/* Core helpers: data merge, storage, highlighting, small UI utilities. */
(function(){
const R = window.ROADMAP;
// Merge Claude code, analogies and extra sections into the weeks
R.weeks.sort((a,b)=>a.id-b.id);
for (const w of R.weeks) {
  const p = (R.patches || {})[w.id]; if (!p) continue;
  if (p.anthropic && !w.project.code.anthropic) w.project.code.anthropic = p.anthropic;
  if (p.analogy && !w.analogy) w.analogy = p.analogy;
  if (p.why && !w.why) w.why = p.why;
  if (p.explainMore) w.explainMore = (w.explainMore || "") + p.explainMore;
}

const KEY = "air-progress-v1";
const blank = () => ({ version: 1, weeks: {}, tab: "gemini", updated: null });
const Store = {
  data: blank(),
  load(){ try { const d = JSON.parse(localStorage.getItem(KEY) || "null"); if (d && typeof d === "object" && d.weeks) this.data = Object.assign(blank(), d); } catch(e) { this.data = blank(); } },
  save(){ this.data.updated = new Date().toISOString(); try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch(e) {} App.refreshTop && App.refreshTop(); },
  wk(id){ return this.data.weeks[id] || (this.data.weeks[id] = {}); },
  set(id, patch){ Object.assign(this.wk(id), patch); this.save(); },
  reset(){ this.data = blank(); try { localStorage.removeItem(KEY); } catch(e) {} App.refreshTop && App.refreshTop(); },
  import(obj){
    if (!obj || typeof obj !== "object" || typeof obj.weeks !== "object") throw new Error("Not a progress file");
    const d = blank(); d.tab = ["gemini","openai","anthropic"].includes(obj.tab) ? obj.tab : "gemini";
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
function stats(){
  const n = R.weeks.length; let done = 0, quiz = 0, ex = 0;
  for (const w of R.weeks) { const s = Store.data.weeks[w.id] || {}; if (s.done) done++; if ((s.quizBest || 0) >= QUIZ_PASS) quiz++; if (s.ex) ex++; }
  const pct = Math.round(((done + quiz + ex) / (3 * n)) * 100);
  return { n, done, quiz, ex, pct };
}

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
function codeBlock(code, lang){
  const isPy = !lang || lang === "python";
  return `<div class="code-wrap"><button class="copy" data-copy>copy</button><pre class="code"><code>${isPy ? highlight(code) : esc(code)}</code></pre></div>`;
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
Object.assign(window.App, { R, Store, stats, esc, highlight, codeBlock, toast, copyText, QUIZ_PASS });
})();
