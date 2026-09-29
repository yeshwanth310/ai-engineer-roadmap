/* Core helpers: data merge, storage, highlighting, small UI utilities. */
(function(){
const R = window.ROADMAP;
// Order: Phase 0 (optional toolkit) first, then the core weeks. Week ids never change
// (core 1..27, toolkit 101..113), so saved progress keys stay valid.
R.weeks.sort((a,b)=> (a.phase - b.phase) || (a.id - b.id));
for (const w of R.weeks) {
  const tk = w.phase === 0;
  w.toolkit = tk;
  w.label = tk ? "P" + (w.id - 100) : String(w.id);
  w.slug = tk ? "p" + (w.id - 100) : String(w.id);
  w.name = tk ? "Toolkit " + w.label : "Week " + w.id;
}
R.core = R.weeks.filter(w => !w.toolkit);
R.toolkit = R.weeks.filter(w => w.toolkit);
const weekBySlug = (s) => { s = String(s).toLowerCase(); return R.weeks.find(w => w.slug === s) || R.weeks.find(w => String(w.id) === s) || null; };
const href = (w) => "#/week/" + w.slug;
// Merge Claude code, analogies and extra sections into the weeks
for (const w of R.weeks) {
  const p = (R.patches || {})[w.id]; if (!p) continue;
  if (p.anthropic && !w.project.code.anthropic) w.project.code.anthropic = p.anthropic;
  if (p.analogy && !w.analogy) w.analogy = p.analogy;
  if (p.why && !w.why) w.why = p.why;
  if (p.explainMore) w.explainMore = (w.explainMore || "") + p.explainMore;
}

const KEY = "air-progress-v1";
const VERSION = 2;
const blank = () => ({ version: VERSION, weeks: {}, tab: "gemini", shellTab: "bash", updated: null });
// v1 -> v2: week ids/keys are unchanged (core weeks 1..27); v2 only adds toolkit weeks (101..112)
// and the shellTab preference. We keep a one-time backup of the old data just in case.
function migrate(d){
  if (!d.version || d.version < 2) {
    try { if (!localStorage.getItem(KEY + "-backup-v1")) localStorage.setItem(KEY + "-backup-v1", JSON.stringify(d)); } catch(e) {}
    d.version = VERSION;
    if (!d.shellTab) d.shellTab = "bash";
    d._migrated = true;
  }
  return d;
}
const Store = {
  data: blank(),
  load(){ try { const d = JSON.parse(localStorage.getItem(KEY) || "null"); if (d && typeof d === "object" && d.weeks) { this.data = Object.assign(blank(), migrate(d)); if (this.data._migrated) { delete this.data._migrated; try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch(e) {} } } } catch(e) { this.data = blank(); } },
  save(){ this.data.updated = new Date().toISOString(); try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch(e) {} App.refreshTop && App.refreshTop(); },
  wk(id){ return this.data.weeks[id] || (this.data.weeks[id] = {}); },
  set(id, patch){ Object.assign(this.wk(id), patch); this.save(); },
  reset(){ this.data = blank(); try { localStorage.removeItem(KEY); } catch(e) {} App.refreshTop && App.refreshTop(); },
  import(obj){
    if (!obj || typeof obj !== "object" || typeof obj.weeks !== "object") throw new Error("Not a progress file");
    const d = blank(); d.tab = ["gemini","openai","anthropic"].includes(obj.tab) ? obj.tab : "gemini";
    d.shellTab = ["bash","powershell"].includes(obj.shellTab) ? obj.shellTab : "bash";
    for (const [k, v] of Object.entries(obj.weeks)) {
      const id = parseInt(k, 10); if (!R.weeks.some(w => w.id === id) || typeof v !== "object") continue;
      d.weeks[id] = { done: !!v.done, ex: !!v.ex, quizBest: Number.isFinite(v.quizBest) ? Math.max(0, Math.min(5, v.quizBest)) : undefined,
                      code: typeof v.code === "string" ? v.code.slice(0, 50000) : undefined };
    }
    this.data = d; this.save();
  }
};
Store.load();

const QUIZ_PASS = 4;
function count(list){
  const n = list.length; let done = 0, quiz = 0, ex = 0;
  for (const w of list) { const s = Store.data.weeks[w.id] || {}; if (s.done) done++; if ((s.quizBest || 0) >= QUIZ_PASS) quiz++; if (s.ex) ex++; }
  return { n, done, quiz, ex, pct: n ? Math.round(((done + quiz + ex) / (3 * n)) * 100) : 0 };
}
// Main progress = the 27 core weeks. The optional toolkit is tracked separately (stats().tk).
function stats(){ const c = count(R.core); c.tk = count(R.toolkit); return c; }

const esc = (s) => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

// Tiny Python highlighter
const KW = new Set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case".split(" "));
const BI = new Set("print len range int str float list dict set tuple bool open input sorted enumerate zip map filter sum min max abs round isinstance super type any all next iter repr object Exception ValueError TypeError KeyError self".split(" "));
const TOK = /(#[^\n]*)|([rRbBfFuU]{0,2}(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)|(@?[A-Za-z_][A-Za-z0-9_]*)/g;
function highlight(code){
  let out = "", last = 0, m, prev = "";
  TOK.lastIndex = 0;
  while ((m = TOK.exec(code))) {
    out += esc(code.slice(last, m.index)); last = TOK.lastIndex;
    const t = m[0];
    if (m[1]) out += `<span class="tok-c">${esc(t)}</span>`;
    else if (m[2]) out += `<span class="tok-s">${esc(t)}</span>`;
    else if (m[3]) out += `<span class="tok-n">${esc(t)}</span>`;
    else if (KW.has(t)) out += `<span class="tok-k">${t}</span>`;
    else if (prev === "def" || prev === "class" || t[0] === "@") out += `<span class="tok-f">${esc(t)}</span>`;
    else if (BI.has(t)) out += `<span class="tok-b">${t}</span>`;
    else out += esc(t);
    if (m[4]) prev = t;
  }
  return out + esc(code.slice(last));
}
function highlightShell(code){
  return code.split("\n").map(line => {
    const m = line.match(/^(\s*)(#.*)$/);
    if (m) return esc(m[1]) + `<span class="tok-c">${esc(m[2])}</span>`;
    const i = line.search(/\s#\s/);
    if (i > 0) return esc(line.slice(0, i)) + `<span class="tok-c">${esc(line.slice(i))}</span>`;
    return esc(line);
  }).join("\n");
}
function codeBlock(code, lang){
  const isPy = !lang || lang === "python";
  const body = isPy ? highlight(code) : (lang === "shell" ? highlightShell(code) : esc(code));
  return `<div class="code-wrap"><button class="copy" data-copy>copy</button><pre class="code"><code>${body}</code></pre></div>`;
}

let toastT;
function toast(msg){
  const t = document.getElementById("toast"); if (!t) return;
  t.textContent = msg; t.classList.add("show"); clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("show"), 2200);
}
async function copyText(text){
  try { await navigator.clipboard.writeText(text); }
  catch(e) { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch(_){} ta.remove(); }
  toast("Copied to clipboard");
}
// Delegated copy buttons (code blocks + tabs)
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-copy]"); if (!b) return;
  const scope = b.closest(".tabs") ? b.closest(".tabs").querySelector(".tab-panel:not([hidden]) pre") : b.parentElement.querySelector("pre");
  if (scope) copyText(scope.innerText.replace(/\n$/, ""));
});

window.App = window.App || {};
Object.assign(window.App, { R, Store, stats, esc, highlight, codeBlock, toast, copyText, QUIZ_PASS, weekBySlug, href, highlightShell });
})();
