/* Router + overview, glossary and progress pages. */
(function(){
const { R, Store, stats, esc, toast, QUIZ_PASS, href, weekBySlug } = App;
const app = document.getElementById("app");
let cleanup = null;

function nextWeek(){ return R.core.find(w => !(Store.data.weeks[w.id] || {}).done) || null; }
function nextToolkit(){ return R.toolkit.find(w => !(Store.data.weeks[w.id] || {}).done) || null; }

function refreshTop(){
  const s = stats();
  const f = document.getElementById("top-progress-fill"), l = document.getElementById("top-progress-label");
  if (f) f.style.width = s.pct + "%"; if (l) l.textContent = s.pct + "%";
}
App.refreshTop = refreshTop;

function statGrid(s, withToolkit = true){
  return `<div class="stat-grid">
    <div class="stat"><b>${s.done}/${s.n}</b><span>weeks done</span></div>
    <div class="stat"><b>${s.quiz}/${s.n}</b><span>quizzes passed</span></div>
    <div class="stat"><b>${s.ex}/${s.n}</b><span>exercises passed</span></div></div>
    ${withToolkit ? `<div class="tk-line"><span class="mono small muted">Toolkit (optional)</span><div class="bar"><div class="fill" style="width:${s.tk.pct}%"></div></div><span class="mono small">${s.tk.done}/${s.tk.n} done</span></div>` : ""}`;
}

function weekCard(w, nx){
  const st = Store.data.weeks[w.id] || {};
  const isNext = nx && nx.id === w.id;
  return `<a class="week-card ${st.done ? "done" : ""} ${isNext ? "next" : ""}" href="${href(w)}">
    <div class="wk"><span>${w.toolkit ? "TOOLKIT " + w.label : "WEEK " + String(w.id).padStart(2, "0")}${isNext ? " · up next" : ""}</span><span class="status-dot"></span></div>
    <h3>${esc(w.title)}</h3>
    <div class="badges"><span class="badge ${(st.quizBest || 0) >= QUIZ_PASS ? "on" : ""}">quiz${st.quizBest !== undefined ? " " + st.quizBest + "/5" : ""}</span><span class="badge ${st.ex ? "on" : ""}">exercise</span><span class="badge ${st.done ? "on" : ""}">done</span></div></a>`;
}

function overview(){
  const s = stats(), nx = nextWeek(), nt = nextToolkit();
  const phases = R.phases.map(ph => {
    const ws = R.weeks.filter(w => w.phase === ph.id);
    if (!ws.length) return "";
    const done = ws.filter(w => (Store.data.weeks[w.id] || {}).done).length;
    const all = done === ws.length;
    const cls = (all ? "done" : (nx && nx.phase === ph.id ? "active" : "")) + (ph.optional ? " optional" : "");
    const range = ph.optional ? `sessions ${ws[0].label}–${ws[ws.length - 1].label}` : `weeks ${ws[0].id}–${ws[ws.length - 1].id}`;
    let grid;
    if (ph.optional) {
      const groups = [["Python", ws.filter(w => w.id <= 108)], ["Shell", ws.filter(w => w.id >= 109 && w.id <= 110)], ["Git", ws.filter(w => w.id >= 111)]];
      grid = groups.map(([g, list]) => `<div class="tk-group"><div class="tk-group-h mono small">${g}</div><div class="week-grid">${list.map(w => weekCard(w, nt)).join("")}</div></div>`).join("");
    } else grid = `<div class="week-grid">${ws.map(w => weekCard(w, nx)).join("")}</div>`;
    return `<div class="phase ${cls}" id="phase-${ph.id}"><div class="phase-dot">${all ? "✓" : ph.id}</div>
      <div class="phase-head"><h2>Phase ${ph.id} · ${esc(ph.title)}</h2>${ph.optional ? `<span class="badge optbadge">optional · skippable</span>` : ""}<span class="phase-meta">${range} · ${done}/${ws.length} done</span></div>
      <p class="phase-desc">${esc(ph.desc)}</p>
      ${grid}</div>`;
  }).join("");
  return `<div class="wrap fade-in">
  <section class="hero"><div>
    <span class="eyebrow">// python → ai engineer · ${R.core.length} weeks · 2h each · no maths</span>
    <h1>Build LLM apps &amp; AI agents, one 2-hour session a week.</h1>
    <p class="lead">A practical roadmap for Python developers: prompting, APIs, structured output, tools, RAG, agents, frameworks, evals, safety and deployment. Every week has a plain-English lesson, a quiz, an in-browser Python exercise and a mini project with Gemini (free), OpenAI and Claude code.</p>
    <p class="lead small-lead">New to Python, the terminal or git? The optional <a href="#/week/p1">Phase 0 toolkit</a> (${R.toolkit.length} sessions) gets you ready first.</p>
    <div class="btn-row" style="margin-top:1.4rem">
      ${nx ? `<a class="btn primary" href="${href(nx)}">${s.done ? "Continue" : "Start"}: Week ${nx.id} →</a>` : `<a class="btn primary" href="#/progress">🎉 All done — see progress</a>`}
      ${nt ? `<a class="btn" href="${href(nt)}">${s.tk.done ? "Continue" : "Start"} toolkit: ${nt.label}</a>` : ""}
      <a class="btn ghost" href="#/setup">Setup guide</a></div></div>
    <div class="card"><div class="mono small muted">Your progress (core ${R.core.length} weeks)</div>
      <div class="big-progress"><div class="bar"><div class="fill" style="width:${s.pct}%"></div></div><span class="pct">${s.pct}%</span></div>
      ${statGrid(s)}</div>
  </section>
  <div class="timeline stagger">${phases}</div></div>`;
}

function glossary(){
  const terms = (window.GLOSSARY || []).slice().sort((a, b) => a[0].localeCompare(b[0]));
  const letters = [...new Set(terms.map(t => t[0][0].toUpperCase()))];
  return `<div class="wrap fade-in"><span class="eyebrow">// ${terms.length} terms in plain English</span><h1>Glossary</h1>
    <input class="search" id="gsearch" type="search" placeholder="Search terms… (e.g. token, RAG, MCP)" autocomplete="off" aria-label="Search glossary" />
    <div class="letters">${letters.map(l => `<button class="btn sm ghost" data-letter="${l}">${l}</button>`).join("")}</div>
    <div class="gloss" id="gloss">${terms.map(([t, d, wk]) => `<div class="concept" data-term="${esc((t + " " + d).toLowerCase())}" data-l="${t[0].toUpperCase()}"><b>${esc(t)}</b><span>${esc(d)}</span>${(() => { const w = wk && weekBySlug(wk); return w ? ` <a class="small mono" href="${href(w)}">${w.toolkit ? "toolkit " + w.label : "week " + w.id} →</a>` : ""; })()}</div>`).join("")}</div>
    <p class="muted" id="gempty" hidden>No matching terms.</p></div>`;
}
function mountGlossary(){
  const inp = document.getElementById("gsearch"), cards = [...document.querySelectorAll("#gloss .concept")];
  const filter = (fn) => { let n = 0; cards.forEach(c => { const ok = fn(c); c.hidden = !ok; if (ok) n++; }); document.getElementById("gempty").hidden = n > 0; };
  inp.addEventListener("input", () => { const norm = (x) => x.toLowerCase().replace(/[-\s]+/g, ""); const q = norm(inp.value.trim()); filter(c => !q || norm(c.dataset.term).includes(q)); });
  document.querySelectorAll("[data-letter]").forEach(b => b.addEventListener("click", () => { inp.value = ""; const L = b.dataset.letter; filter(c => c.dataset.l === L); }));
}

function progress(){
  const s = stats();
  return `<div class="wrap fade-in" style="max-width:960px"><span class="eyebrow">// saved in this browser (localStorage)</span><h1>Your progress</h1>
    <div class="card"><div class="big-progress"><div class="bar"><div class="fill" style="width:${s.pct}%"></div></div><span class="pct">${s.pct}%</span></div>${statGrid(s)}
    <p class="small muted" style="margin:.8rem 0 0">The main % covers the ${R.core.length} core weeks and counts three things per week: quiz passed (≥${QUIZ_PASS}/5), exercise passed, and week marked complete. The optional toolkit (Phase 0) is tracked separately: ${s.tk.pct}%.</p></div>
    <div class="btn-row" style="margin:1.2rem 0 1.6rem">
      <button class="btn" id="p-export">⬇ Export JSON</button>
      <label class="btn" for="p-import" style="cursor:pointer">⬆ Import JSON</label><input type="file" id="p-import" accept="application/json,.json" hidden />
      <button class="btn danger" id="p-reset">Reset all progress</button></div>
    <div class="table-scroll"><table class="tbl"><tr><th>Week</th><th>Title</th><th>Quiz best</th><th>Exercise</th><th>Done</th></tr>
      <tr class="tbl-group"><td colspan="5">Phase 0 · Toolkit (optional)</td></tr>
      ${R.weeks.map((w, i) => { const st = Store.data.weeks[w.id] || {};
        const sep = (!w.toolkit && i > 0 && R.weeks[i - 1].toolkit) ? `<tr class="tbl-group"><td colspan="5">Core roadmap · weeks 1–${R.core.length}</td></tr>` : "";
        return sep + `<tr><td class="mono">${w.label}</td><td><a href="${href(w)}">${esc(w.title)}</a></td><td class="mono ${(st.quizBest || 0) >= QUIZ_PASS ? "accent" : "muted"}">${st.quizBest !== undefined ? st.quizBest + "/5" : "—"}</td><td class="${st.ex ? "accent" : "muted"}">${st.ex ? "✓" : "—"}</td><td class="${st.done ? "accent" : "muted"}">${st.done ? "✓" : "—"}</td></tr>`; }).join("")}
    </table></div>
    <p class="small muted">Last saved: ${Store.data.updated ? new Date(Store.data.updated).toLocaleString() : "never"}</p></div>`;
}
function mountProgress(){
  document.getElementById("p-export").onclick = () => {
    const blob = new Blob([JSON.stringify(Store.data, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `ai-roadmap-progress-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast("Progress exported");
  };
  document.getElementById("p-import").onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { Store.import(JSON.parse(await f.text())); toast("Progress imported ✓"); route(); }
    catch(err) { toast("Import failed: " + err.message); }
  };
  document.getElementById("p-reset").onclick = () => { if (confirm("Delete ALL progress, quiz scores and saved code? This cannot be undone.")) { Store.reset(); toast("Progress reset"); route(); } };
}


function cheatsheet(){
  const secs = window.CHEATSHEET || [];
  return `<div class="wrap fade-in" style="max-width:1100px"><span class="eyebrow">// windows ↔ linux / macOS</span><h1>PowerShell ↔ bash cheat sheet</h1>
    <p class="lead">The same everyday task in both shells. Learn it in <a href="#/week/p9">Toolkit P9 (PowerShell)</a> and <a href="#/week/p10">P10 (bash)</a>. Tap a command to copy it.</p>
    <input class="search" id="csearch" type="search" placeholder="Filter… (e.g. env, venv, grep, gpu)" autocomplete="off" aria-label="Filter cheat sheet" />
    ${secs.map(([title, rows]) => `<section class="cs-sec"><h2>${esc(title)}</h2><div class="table-scroll"><table class="tbl cs">
      <tr><th>Task</th><th>PowerShell (Windows)</th><th>bash (Linux / macOS / WSL)</th></tr>
      ${rows.map(([t, ps, sh]) => `<tr data-q="${esc((t + " " + ps + " " + sh).toLowerCase())}"><td data-l="Task">${esc(t)}</td><td data-l="PowerShell"><code class="cs-cmd">${esc(ps)}</code></td><td data-l="bash"><code class="cs-cmd">${esc(sh)}</code></td></tr>`).join("")}
    </table></div></section>`).join("")}
    <p class="small muted">Tip: in both shells press Tab to auto-complete and ↑ for history, and never paste commands you don't understand. Ask a study-buddy chat app to explain them first.</p></div>`;
}
function mountCheatsheet(){
  const inp = document.getElementById("csearch");
  inp.addEventListener("input", () => {
    const q = inp.value.trim().toLowerCase();
    document.querySelectorAll(".cs-sec").forEach(sec => {
      let n = 0; sec.querySelectorAll("tr[data-q]").forEach(tr => { const ok = !q || tr.dataset.q.includes(q); tr.hidden = !ok; if (ok) n++; });
      sec.hidden = n === 0;
    });
  });
  document.querySelectorAll(".cs-cmd").forEach(c => c.addEventListener("click", () => App.copyText(c.textContent)));
}

function route(){
  if (cleanup) { try { cleanup(); } catch(e) {} cleanup = null; }
  const h = location.hash.replace(/^#/, "") || "/";
  let m, nav = "home", html, mount = null, title = "AI Engineer Roadmap";
  if ((m = h.match(/^\/week\/(p?\d+)/i))) { const w = weekBySlug(m[1]); const id = w ? w.id : -1; html = App.week.render(id); mount = () => App.week.mount(id); if (w) title = `${w.name}: ${w.title} · AI Engineer Roadmap`; }
  else if (h === "/cheatsheet") { nav = "cheatsheet"; html = cheatsheet(); mount = mountCheatsheet; title = "PowerShell ↔ bash cheat sheet · AI Engineer Roadmap"; }
  else if (h === "/setup") { nav = "setup"; html = App.setup.render(); title = "Setup · AI Engineer Roadmap"; }
  else if (h === "/glossary") { nav = "glossary"; html = glossary(); mount = mountGlossary; title = "Glossary · AI Engineer Roadmap"; }
  else if (h === "/progress") { nav = "progress"; html = progress(); mount = mountProgress; title = "Progress · AI Engineer Roadmap"; }
  else html = overview();
  app.innerHTML = html; document.title = title;
  document.querySelectorAll("[data-nav]").forEach(a => a.classList.toggle("active", a.dataset.nav === nav));
  document.getElementById("topnav").classList.remove("open");
  if (mount) cleanup = mount() || null;
  window.scrollTo(0, 0); refreshTop();
}

document.getElementById("menu-btn").addEventListener("click", () => document.getElementById("topnav").classList.toggle("open"));
window.addEventListener("hashchange", route);
route();
})();
