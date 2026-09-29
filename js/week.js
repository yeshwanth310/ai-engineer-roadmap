/* Week page: lesson, quiz, Pyodide exercise, mini project. */
(function(){
const { R, Store, esc, highlight, highlightShell, codeBlock, toast, QUIZ_PASS, href } = App;
const TABS = [["gemini","Gemini (free)"],["openai","OpenAI"],["anthropic","Claude"],["python","Python"],["bash","bash (Linux/macOS)"],["powershell","PowerShell (Windows)"],["terminal","Terminal (bash or PowerShell)"]];
const PROVIDERS = ["gemini","openai","anthropic"], SHELLS = ["bash","powershell"];
const isShell = (k) => k === "bash" || k === "powershell" || k === "terminal";

function studyBuddy(w){
  const cmdTip = w.id >= 109 && w.id <= 112;
  const c1 = w.concepts[0] ? w.concepts[0][0] : w.title;
  const c2 = w.concepts[1] ? w.concepts[1][0] : "";
  return `<div class="callout buddy"><b>🤝 Study buddy tip</b> — you already have chat apps (ChatGPT, Claude, Gemini, Grok). Use them as a patient tutor:
  <ul>
    <li>“Explain <i>${esc(c1)}</i>${c2 ? ` and <i>${esc(c2)}</i>` : ""} to me with an everyday analogy, then ask me 3 questions to check I understood.”</li>
    ${cmdTip ? `<li>Before running a command you're unsure about: “Explain each part of this command, what it will change, and what could go wrong: <i>…paste command…</i>”</li>` : ""}
    <li>After the exercise: “Here is my ${cmdTip ? "answer" : "Python solution"} — review it for mistakes, edge cases and readability. Explain your suggestions instead of just rewriting it.”</li>
  </ul>
  Double-check anything important against the resources below, and never paste API keys or private data into a chat.</div>`;
}

function tabsHtml(code){
  const keys = TABS.map(([k]) => k).filter(k => code[k]);
  const pref = keys.includes(Store.data.tab) ? Store.data.tab : keys.includes(Store.data.shellTab) ? Store.data.shellTab : null;
  const cur = pref || keys[0];
  const paid = keys.includes("openai") || keys.includes("anthropic");
  return `<div class="tabs" role="tablist">
    <div class="tab-bar">${TABS.filter(([k]) => code[k]).map(([k, l]) => `<button class="tab${k === cur ? " active" : ""}" role="tab" aria-selected="${k === cur}" data-tab="${k}">${l}</button>`).join("")}
      <button class="copy" data-copy>copy</button></div>
    ${TABS.filter(([k]) => code[k]).map(([k]) => `<div class="tab-panel" data-panel="${k}" ${k === cur ? "" : "hidden"}><pre class="code"><code>${isShell(k) ? highlightShell(code[k].replace(/^\n/, "")) : highlight(code[k].replace(/^\n/, ""))}</code></pre></div>`).join("")}
  </div>
  ${paid ? `<p class="small muted" style="margin-top:.6rem">Gemini works with a free AI Studio key. OpenAI and Claude API calls need paid API credits (a ChatGPT Plus or Claude Pro subscription does not include API usage) — see <a href="#/setup">Setup</a>.</p>` : ""}`;
}

function render(id){
  const w = R.weeks.find(x => x.id === id);
  if (!w) return `<div class="wrap"><h1>Week not found</h1><p><a href="#/">Back to the roadmap</a></p></div>`;
  const ph = R.phases.find(p => p.id === w.phase) || {};
  const s = Store.wk(w.id);
  const idx = R.weeks.indexOf(w), prev = R.weeks[idx - 1], next = R.weeks[idx + 1];
  const sections = [["goal","Goal"],["learn","Learn"],["concepts","Key concepts"],["resources","Resources"],["quiz","Quiz"],["exercise","Exercise"],["project","Mini project"],["finish","Finish"]];
  const ex = w.exercise;
  const saved = typeof s.code === "string" ? s.code : ex.starter;
  return `<div class="wrap fade-in"><div class="week-layout">
  <nav class="side-nav" aria-label="Sections"><div class="side-title">${w.name}</div>
    ${sections.map(([k, l]) => `<a href="${href(w)}" data-jump="${k}">${l}</a>`).join("")}
  </nav>
  <article>
    <div class="crumbs"><a href="#/">Roadmap</a><span>/</span><span>Phase ${ph.id} · ${esc(ph.short || ph.title || "")}</span><span>/</span><span>${w.toolkit ? `Toolkit session ${w.label} of ${R.toolkit.length} · optional` : `Week ${w.id} of ${R.core.length}`}</span></div>
    <h1 class="week-title">${esc(w.title)}</h1>
    ${w.toolkit ? `<div class="callout optional"><b>Optional session.</b> Skip it if ${w.skip || "you already know this topic."} Quick self-test: take the quiz below. If you score 5/5, mark the session complete and move on.</div>` : ""}
    <div class="plan">${w.plan.map(([t, l]) => `<span><b>${esc(t)}</b> ${esc(l)}</span>`).join("")}<span><b>≈2h</b> total</span></div>

    <section class="section" id="sec-goal"><div class="section-h"><span class="num">01</span><h2>Goal</h2></div>
      <div class="goal">${w.goal}</div></section>

    <section class="section" id="sec-learn"><div class="section-h"><span class="num">02</span><h2>Learn — in plain English</h2></div>
      ${w.analogy ? `<div class="callout analogy"><b>🧠 Everyday analogy</b><br>${w.analogy}</div>` : ""}
      <div class="prose">${w.explain}${w.explainMore || ""}</div>
      ${w.why ? `<div class="callout why"><b>🎯 Why it matters</b><br>${w.why}</div>` : ""}
      ${studyBuddy(w)}
    </section>

    <section class="section" id="sec-concepts"><div class="section-h"><span class="num">03</span><h2>Key concepts</h2></div>
      <div class="concepts stagger">${w.concepts.map(([t, d]) => `<div class="concept"><b>${esc(t)}</b><span>${d}</span></div>`).join("")}</div></section>

    <section class="section" id="sec-resources"><div class="section-h"><span class="num">04</span><h2>Resources</h2></div>
      <div class="resources">${w.resources.map(r => `<a class="res" href="${esc(r.u)}" target="_blank" rel="noopener"><span class="type">${esc(r.type || "link")}</span><span class="rt">${esc(r.t)}<small>${esc(r.u.replace(/^https?:\/\//, ""))}</small></span><span class="arrow">↗</span></a>`).join("")}</div></section>

    <section class="section" id="sec-quiz"><div class="section-h"><span class="num">05</span><h2>Quiz</h2><span class="small muted mono" id="quiz-best">${s.quizBest !== undefined ? `best: ${s.quizBest}/5` : ""}</span></div>
      <p class="small muted">Tap an answer for instant feedback. Get ${QUIZ_PASS}/5 or more to pass.</p>
      <div class="quiz" id="quiz"></div></section>

    <section class="section" id="sec-exercise"><div class="section-h"><span class="num">06</span><h2>Exercise</h2><span class="ex-passed" id="ex-passed" ${s.ex ? "" : "hidden"}>✓ passed</span></div>
      <div class="ex">
        <div class="ex-task"><h3>${esc(ex.title)}</h3>${ex.task}<p class="small muted">Runs real Python in your browser (Pyodide). <b>Run</b> just executes your code; <b>Check</b> runs the automatic tests. Shortcut: Ctrl/⌘+Enter.</p></div>
        <div class="editor-wrap"><div class="gutter" id="gutter" aria-hidden="true">1</div>
          <textarea class="editor" id="editor" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" wrap="off" aria-label="Python code editor">${esc(saved)}</textarea></div>
        <div class="keybar" id="keybar" aria-label="Coding keys">
          ${[["⇥","tab"],["⇤","untab"],[":",":"],["( )","()"],["[ ]","[]"],["{ }","{}"],["\" \"","\"\""],["' '","''"],["=","="],["#","#"],["_","_"],["↩ undo","undo"]].map(([l, k]) => `<button type="button" data-key="${esc(k)}">${esc(l)}</button>`).join("")}
        </div>
        <div class="ex-bar">
          <button class="btn primary sm" id="btn-check">✓ Check</button>
          <button class="btn sm" id="btn-run">▶ Run</button>
          <button class="btn ghost sm" id="btn-reset">Reset</button>
          <span class="grow"></span>
          <span class="py-status" id="py-status"><span class="d"></span><span class="t">Python: loading…</span></span>
        </div>
        <pre class="console" id="console" aria-live="polite"><span class="info">Output appears here.</span></pre>
        <details class="solution" id="solution"><summary>Stuck? Reveal a solution</summary>
          ${codeBlock(ex.solution)}<button class="btn sm" id="btn-use-sol" style="margin-top:.6rem">Put solution in editor</button></details>
      </div></section>

    <section class="section project" id="sec-project"><div class="section-h"><span class="num">07</span><h2>Mini project: ${esc(w.project.title)}</h2></div>
      <p class="prose">${w.project.desc}</p>
      <ol class="steps">${w.project.steps.map(x => `<li>${x}</li>`).join("")}</ol>
      ${tabsHtml(w.project.code)}</section>

    <section class="section" id="sec-finish"><div class="section-h"><span class="num">08</span><h2>Finish the week</h2></div>
      <div class="complete-box"><div><div class="checklist" id="checklist"></div></div>
        <button class="btn ${s.done ? "" : "primary"}" id="btn-done">${s.done ? "✓ Completed — undo" : (w.toolkit ? "Mark session complete" : "Mark week complete")}</button></div>
      <div class="pager">${prev ? `<a href="${href(prev)}"><small>← ${prev.name}</small>${esc(prev.title)}</a>` : `<span></span>`}
        ${next ? `<a class="next" href="${href(next)}"><small>${next.name} →</small>${esc(next.title)}</a>` : `<a class="next" href="#/progress"><small>Finished →</small>See your progress</a>`}</div>
    </section>
  </article></div></div>`;
}

function mount(id){
  const w = R.weeks.find(x => x.id === id); if (!w) return () => {};
  const ex = w.exercise;
  const root = document.getElementById("app");
  const cleanups = [];

  // Section jump links (hash is used by the router, so scroll manually)
  root.querySelectorAll("[data-jump]").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault(); const el = document.getElementById("sec-" + a.dataset.jump); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  const links = [...root.querySelectorAll(".side-nav a")];
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => {
      ents.forEach(en => { if (en.isIntersecting) { const k = en.target.id.slice(4); links.forEach(l => l.classList.toggle("active", l.dataset.jump === k));
        const act = links.find(l => l.dataset.jump === k); const nav = act && act.parentElement;
        if (act && nav && nav.scrollWidth > nav.clientWidth) { const l = act.offsetLeft - nav.offsetLeft, r = l + act.offsetWidth;
          if (l < nav.scrollLeft || r > nav.scrollLeft + nav.clientWidth) nav.scrollTo({ left: Math.max(0, l - 16), behavior: "smooth" }); } } });
    }, { rootMargin: "-30% 0px -60% 0px" });
    root.querySelectorAll("section.section").forEach(s => io.observe(s));
    cleanups.push(() => io.disconnect());
  }

  // ---------- Quiz ----------
  const quizEl = document.getElementById("quiz");
  function renderQuiz(){
    const answers = new Array(w.quiz.length).fill(null);
    quizEl.innerHTML = w.quiz.map((q, i) => `<div class="q" data-q="${i}"><div class="q-title"><span class="qn">Q${i + 1}</span><span>${q.q}</span></div>
      <div class="opts">${q.o.map((o, j) => `<button class="opt" data-o="${j}"><span class="letter">${"ABCD"[j]}</span><span>${o}</span></button>`).join("")}</div></div>`).join("") + `<div id="quiz-result"></div>`;
    quizEl.querySelectorAll(".q").forEach(qEl => {
      const i = +qEl.dataset.q, q = w.quiz[i];
      qEl.querySelectorAll(".opt").forEach(btn => btn.addEventListener("click", () => {
        if (answers[i] !== null) return;
        const j = +btn.dataset.o; answers[i] = j;
        qEl.querySelectorAll(".opt").forEach(b => { b.disabled = true; const k = +b.dataset.o; if (k === q.a) b.classList.add("correct"); else if (k === j) b.classList.add("wrong"); });
        const ok = j === q.a;
        qEl.insertAdjacentHTML("beforeend", `<div class="feedback"><b class="${ok ? "ok" : "no"}">${ok ? "✓ Correct." : "✗ Not quite."}</b> ${q.e}</div>`);
        if (answers.every(a => a !== null)) finish(answers);
      }));
    });
  }
  function finish(answers){
    const score = answers.filter((a, i) => a === w.quiz[i].a).length;
    const s = Store.wk(w.id); const best = Math.max(score, s.quizBest || 0);
    Store.set(w.id, { quizBest: best });
    document.getElementById("quiz-best").textContent = `best: ${best}/5`;
    const pass = score >= QUIZ_PASS;
    document.getElementById("quiz-result").innerHTML = `<div class="quiz-score fade-in"><div><div class="s">${score}/5 ${pass ? "— passed ✓" : ""}</div>
      <div class="small muted">${pass ? "Nice work. Your best score is saved." : `You need ${QUIZ_PASS}/5 to pass — reread the explanations above and try again.`}</div></div>
      <button class="btn sm" id="quiz-retry">↻ Retry quiz</button></div>`;
    document.getElementById("quiz-retry").onclick = () => { renderQuiz(); quizEl.scrollIntoView({ behavior: "smooth" }); };
    updateChecklist(); toast(`Quiz: ${score}/5`);
  }
  renderQuiz();

  // ---------- Editor ----------
  const ed = document.getElementById("editor"), gut = document.getElementById("gutter"), con = document.getElementById("console");
  const undoStack = [];
  function syncGutter(){ const n = ed.value.split("\n").length; let s = ""; for (let i = 1; i <= n; i++) s += i + "\n"; gut.textContent = s; gut.scrollTop = ed.scrollTop; }
  function fit(){ ed.style.height = "auto"; const h = Math.min(Math.max(ed.scrollHeight + 4, 260), window.innerWidth <= 720 ? 520 : 640); ed.style.height = h + "px"; }
  let saveT;
  function changed(){ syncGutter(); clearTimeout(saveT); saveT = setTimeout(() => Store.set(w.id, { code: ed.value }), 400); }
  function pushUndo(){ undoStack.push([ed.value, ed.selectionStart, ed.selectionEnd]); if (undoStack.length > 100) undoStack.shift(); }
  function insert(text, caretOffset){
    pushUndo(); ed.focus();
    const a = ed.selectionStart, b = ed.selectionEnd;
    ed.setRangeText(text, a, b, "end");
    if (caretOffset !== undefined) { const p = a + caretOffset; ed.setSelectionRange(p, p); }
    changed();
  }
  function indentLines(dedent){
    pushUndo();
    const v = ed.value, a = ed.selectionStart, b = ed.selectionEnd;
    const ls = v.lastIndexOf("\n", a - 1) + 1; let le = v.indexOf("\n", b); if (le < 0) le = v.length;
    const block = v.slice(ls, le);
    if (!dedent && a === b) { ed.setRangeText("    ", a, b, "end"); changed(); return; }
    const lines = block.split("\n");
    const newLines = lines.map(l => dedent ? l.replace(/^ {1,4}/, "") : "    " + l);
    const nb = newLines.join("\n");
    ed.value = v.slice(0, ls) + nb + v.slice(le);
    const delta0 = newLines[0].length - lines[0].length;
    ed.setSelectionRange(Math.max(ls, a + delta0), b + (nb.length - block.length));
    changed();
  }
  ed.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); doRun(true); return; }
    if (e.key === "Tab") { e.preventDefault(); indentLines(e.shiftKey); return; }
    if (e.key === "Enter" && !e.isComposing) {
      e.preventDefault();
      const v = ed.value, a = ed.selectionStart; const ls = v.lastIndexOf("\n", a - 1) + 1; const line = v.slice(ls, a);
      let ind = (line.match(/^\s*/) || [""])[0]; if (/:\s*(#.*)?$/.test(line)) ind += "    ";
      insert("\n" + ind); return;
    }
    if (e.key === "Backspace" && ed.selectionStart === ed.selectionEnd) {
      const v = ed.value, a = ed.selectionStart, ls = v.lastIndexOf("\n", a - 1) + 1, before = v.slice(ls, a);
      if (before.length >= 4 && /^ +$/.test(before)) { e.preventDefault(); const n = before.length % 4 || 4; pushUndo(); ed.setRangeText("", a - n, a, "end"); changed(); }
    }
  });
  ed.addEventListener("beforeinput", (e) => { if (e.inputType && e.inputType.startsWith("insert") || e.inputType === "deleteContentBackward") pushUndo(); });
  ed.addEventListener("input", () => { changed(); fit(); });
  ed.addEventListener("scroll", () => { gut.scrollTop = ed.scrollTop; });
  document.getElementById("keybar").addEventListener("mousedown", (e) => e.preventDefault()); // keep focus/keyboard on the editor
  document.getElementById("keybar").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return; const k = b.dataset.key;
    if (k === "tab") indentLines(false); else if (k === "untab") indentLines(true);
    else if (k === "undo") { const u = undoStack.pop(); if (u) { ed.value = u[0]; ed.setSelectionRange(u[1], u[2]); changed(); fit(); } }
    else if (k.length === 2 && "([{\"'".includes(k[0])) insert(k, 1);
    else insert(k);
  });
  syncGutter(); fit();

  // ---------- Run / Check ----------
  const statusEl = document.getElementById("py-status");
  cleanups.push(Py.onState((st, detail) => {
    statusEl.classList.toggle("ready", st === "ready"); statusEl.classList.toggle("err", st === "error");
    statusEl.querySelector(".t").textContent = st === "ready" ? "Python ready" : st === "error" ? "Python failed to load" : "Python: loading…";
    if (st === "error") statusEl.title = detail || "";
  }));
  Py.start();
  Py.onStatus((msg) => { con.innerHTML = `<span class="info">${esc(msg)} (first time only)</span>`; });
  cleanups.push(() => Py.onStatus(null));
  let busy = false;
  async function doRun(check){
    if (busy) return; busy = true;
    const btns = [document.getElementById("btn-run"), document.getElementById("btn-check")]; btns.forEach(b => b.disabled = true);
    con.innerHTML = `<span class="info">${Py.state === "ready" ? (check ? "Running checks…" : "Running…") : "Loading Python (first time takes a few seconds)…"}</span>`;
    Store.set(w.id, { code: ed.value });
    const res = await Py.run(ed.value, check ? ex.tests : undefined);
    let html = "";
    if (res.stdout) html += esc(res.stdout.replace(/\n+$/, "")) + "\n";
    if (res.ok) {
      if (check) {
        html += `<span class="ok">🎉 Exercise complete — progress saved.</span>`;
        const first = !Store.wk(w.id).ex; Store.set(w.id, { ex: true });
        document.getElementById("ex-passed").hidden = false; updateChecklist();
        if (first) toast("Exercise passed ✓");
      } else html += `<span class="info">✓ Ran without errors. Press “Check” to run the tests.</span>`;
    } else html += `<span class="err">${esc(res.error)}</span>`;
    con.innerHTML = html || `<span class="info">(no output)</span>`;
    btns.forEach(b => b.disabled = false); busy = false;
    if (window.innerWidth <= 720) con.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  document.getElementById("btn-run").onclick = () => doRun(false);
  document.getElementById("btn-check").onclick = () => doRun(true);
  document.getElementById("btn-reset").onclick = () => { if (!confirm("Replace your code with the original starter code?")) return; pushUndo(); ed.value = ex.starter; changed(); fit(); con.innerHTML = `<span class="info">Starter code restored.</span>`; };
  document.getElementById("btn-use-sol").onclick = () => { pushUndo(); ed.value = ex.solution; changed(); fit(); ed.scrollIntoView({ behavior: "smooth", block: "center" }); toast("Solution copied into the editor — read it, then press Check"); };

  // ---------- Tabs ----------
  root.querySelectorAll(".tabs").forEach(t => t.addEventListener("click", (e) => {
    const b = e.target.closest(".tab"); if (!b) return; const k = b.dataset.tab;
    if (PROVIDERS.includes(k)) { Store.data.tab = k; Store.save(); } else if (SHELLS.includes(k)) { Store.data.shellTab = k; Store.save(); }
    t.querySelectorAll(".tab").forEach(x => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", x === b); });
    t.querySelectorAll(".tab-panel").forEach(p => p.hidden = p.dataset.panel !== k);
  }));

  // ---------- Complete ----------
  function updateChecklist(){
    const s = Store.wk(w.id);
    document.getElementById("checklist").innerHTML = [
      [(s.quizBest || 0) >= QUIZ_PASS, `Quiz ≥ ${QUIZ_PASS}/5${s.quizBest !== undefined ? ` (best ${s.quizBest})` : ""}`],
      [!!s.ex, "Exercise passed"], [!!s.done, "Week marked complete"]
    ].map(([on, l]) => `<span class="${on ? "on" : ""}">${on ? "✓" : "○"} ${l}</span>`).join("");
  }
  updateChecklist();
  document.getElementById("btn-done").onclick = (e) => {
    const s = Store.wk(w.id); const done = !s.done; Store.set(w.id, { done });
    e.currentTarget.textContent = done ? "✓ Completed — undo" : (w.toolkit ? "Mark session complete" : "Mark week complete"); e.currentTarget.classList.toggle("primary", !done);
    updateChecklist(); toast(done ? `${w.name} complete 🎉` : "Marked as not complete");
  };

  return () => cleanups.forEach(fn => fn());
}

App.week = { render, mount };
})();
