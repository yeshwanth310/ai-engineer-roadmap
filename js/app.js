/* Router + overview, glossary and progress pages. */
(function(){
const { R, Store, stats, esc, toast, QUIZ_PASS } = App;
const app = document.getElementById("app");
let cleanup = null;

function nextWeek(){ return R.weeks.find(w => !(Store.data.weeks[w.id] || {}).done) || null; }

function refreshTop(){
  const s = stats();
  const f = document.getElementById("top-progress-fill"), l = document.getElementById("top-progress-label");
  if (f) f.style.width = s.pct + "%"; if (l) l.textContent = s.pct + "%";
}
App.refreshTop = refreshTop;

function statGrid(s){
  return `<div class="stat-grid">
    <div class="stat"><b>${s.done}/${s.n}</b><span>weeks done</span></div>
    <div class="stat"><b>${s.quiz}/${s.n}</b><span>quizzes passed</span></div>
    <div class="stat"><b>${s.ex}/${s.n}</b><span>exercises passed</span></div></div>`;
}

function overview(){
  const s = stats(), nx = nextWeek();
  const phases = R.phases.map(ph => {
    const ws = R.weeks.filter(w => w.phase === ph.id);
    const done = ws.filter(w => (Store.data.weeks[w.id] || {}).done).length;
    const cls = done === ws.length && ws.length ? "done" : (nx && nx.phase === ph.id ? "active" : "");
    return `<div class="phase ${cls}"><div class="phase-dot">${done === ws.length && ws.length ? "✓" : ph.id}</div>
      <div class="phase-head"><h2>Phase ${ph.id} · ${esc(ph.title)}</h2><span class="phase-meta">weeks ${ws[0].id}–${ws[ws.length - 1].id} · ${done}/${ws.length} done</span></div>
      <p class="phase-desc">${esc(ph.desc)}</p>
      <div class="week-grid">${ws.map(w => { const st = Store.data.weeks[w.id] || {};
        return `<a class="week-card ${st.done ? "done" : ""} ${nx && nx.id === w.id ? "next" : ""}" href="#/week/${w.id}">
          <div class="wk"><span>WEEK ${String(w.id).padStart(2, "0")}${nx && nx.id === w.id ? " · up next" : ""}</span><span class="status-dot"></span></div>
          <h3>${esc(w.title)}</h3>
          <div class="badges"><span class="badge ${(st.quizBest || 0) >= QUIZ_PASS ? "on" : ""}">quiz${st.quizBest !== undefined ? " " + st.quizBest + "/5" : ""}</span><span class="badge ${st.ex ? "on" : ""}">exercise</span><span class="badge ${st.done ? "on" : ""}">done</span></div></a>`; }).join("")}</div></div>`;
  }).join("");
  return `<div class="wrap fade-in">
  <section class="hero"><div>
    <span class="eyebrow">// python → ai engineer · ${R.weeks.length} weeks · 2h each · no maths</span>
    <h1>Build LLM apps &amp; AI agents, one 2-hour session a week.</h1>
    <p class="lead">A practical roadmap for Python developers: prompting, APIs, structured output, tools, RAG, agents, frameworks, evals, safety and deployment. Every week has a plain-English lesson, a quiz, an in-browser Python exercise and a mini project with Gemini (free), OpenAI and Claude code.</p>
    <div class="btn-row" style="margin-top:1.4rem">
      ${nx ? `<a class="btn primary" href="#/week/${nx.id}">${s.done ? "Continue" : "Start"}: Week ${nx.id} →</a>` : `<a class="btn primary" href="#/progress">🎉 All done — see progress</a>`}
      <a class="btn" href="#/setup">Setup guide</a></div></div>
    <div class="card"><div class="mono small muted">Your progress</div>
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
    <div class="gloss" id="gloss">${terms.map(([t, d, wk]) => `<div class="concept" data-term="${esc((t + " " + d).toLowerCase())}" data-l="${t[0].toUpperCase()}"><b>${esc(t)}</b><span>${esc(d)}</span>${wk ? ` <a class="small mono" href="#/week/${wk}">week ${wk} →</a>` : ""}</div>`).join("")}</div>
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
    <p class="small muted" style="margin:.8rem 0 0">Overall % counts three things per week: quiz passed (≥${QUIZ_PASS}/5), exercise passed, and week marked complete.</p></div>
    <div class="btn-row" style="margin:1.2rem 0 1.6rem">
      <button class="btn" id="p-export">⬇ Export JSON</button>
      <label class="btn" for="p-import" style="cursor:pointer">⬆ Import JSON</label><input type="file" id="p-import" accept="application/json,.json" hidden />
      <button class="btn danger" id="p-reset">Reset all progress</button></div>
    <div class="table-scroll"><table class="tbl"><tr><th>Week</th><th>Title</th><th>Quiz best</th><th>Exercise</th><th>Done</th></tr>
      ${R.weeks.map(w => { const st = Store.data.weeks[w.id] || {};
        return `<tr><td class="mono">${w.id}</td><td><a href="#/week/${w.id}">${esc(w.title)}</a></td><td class="mono ${(st.quizBest || 0) >= QUIZ_PASS ? "accent" : "muted"}">${st.quizBest !== undefined ? st.quizBest + "/5" : "—"}</td><td class="${st.ex ? "accent" : "muted"}">${st.ex ? "✓" : "—"}</td><td class="${st.done ? "accent" : "muted"}">${st.done ? "✓" : "—"}</td></tr>`; }).join("")}
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

function route(){
  if (cleanup) { try { cleanup(); } catch(e) {} cleanup = null; }
  const h = location.hash.replace(/^#/, "") || "/";
  let m, nav = "home", html, mount = null, title = "AI Engineer Roadmap";
  if ((m = h.match(/^\/week\/(\d+)/))) { const id = +m[1]; html = App.week.render(id); mount = () => App.week.mount(id); const w = R.weeks.find(x => x.id === id); if (w) title = `Week ${id}: ${w.title} · AI Engineer Roadmap`; }
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
