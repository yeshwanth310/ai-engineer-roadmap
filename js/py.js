/* Python runner: talks to the Pyodide Web Worker with a timeout. */
(function(){
const TIMEOUT_MS = 10000;
let worker = null, readyP = null, isReady = false, seq = 0;
const pending = new Map();
const listeners = new Set();
let state = "idle"; // idle | loading | ready | error

let statusCb = null;
function statusMsg(msg){ if (statusCb) statusCb(msg); }
function setState(s, detail){ state = s; listeners.forEach(fn => fn(s, detail)); }

function start(){
  if (worker) return readyP;
  setState("loading");
  worker = new Worker("js/pyworker.js");
  readyP = new Promise((resolve, reject) => {
    worker.onmessage = (ev) => {
      const m = ev.data;
      if (m.type === "ready") { isReady = true; setState("ready"); resolve(); }
      else if (m.type === "boot-error") { setState("error", m.error); reject(new Error(m.error)); }
      else if (m.type === "status") { const p = pending.get(m.id); if (p) { clearTimeout(p.timer); p.timer = setTimeout(() => { if (pending.has(m.id)) restart(); }, 90000); } statusMsg(m.msg); }
      else if (m.type === "status-done") { const p = pending.get(m.id); if (p) { clearTimeout(p.timer); p.timer = setTimeout(() => { if (pending.has(m.id)) restart(); }, TIMEOUT_MS); } }
      else if (m.type === "result") { const p = pending.get(m.id); if (p) { pending.delete(m.id); clearTimeout(p.timer); p.resolve(m); } }
    };
    worker.onerror = (e) => { setState("error", e.message); reject(new Error(e.message || "Worker error")); };
  });
  readyP.catch(() => {});
  return readyP;
}

function restart(){
  if (worker) worker.terminate();
  for (const p of pending.values()) { clearTimeout(p.timer); p.resolve({ ok: false, error: "⏱ Stopped after 10 seconds — is there an infinite loop (e.g. a while loop that never ends)?", stdout: "", kind: "timeout" }); }
  pending.clear(); worker = null; isReady = false; readyP = null;
  start();
}

async function run(code, tests){
  start();
  try { await readyP; } catch(e) { return { ok: false, error: "Python could not load. Pyodide needs an internet connection the first time (it downloads from cdn.jsdelivr.net). " + e.message, stdout: "", kind: "boot" }; }
  const id = ++seq;
  return new Promise((resolve) => {
    const timer = setTimeout(() => { if (pending.has(id)) restart(); }, TIMEOUT_MS);
    pending.set(id, { resolve, timer });
    worker.postMessage({ id, code, tests });
  });
}

window.Py = { start, run, onStatus(fn){ statusCb = fn; }, onState(fn){ listeners.add(fn); fn(state); return () => listeners.delete(fn); }, get state(){ return state; } };
})();
