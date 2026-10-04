import json, sys, time
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/"
SHOTS = "--no-shots" not in sys.argv
SS = "/workspace/ai-roadmap/screenshots/"
import os
if not SHOTS:
    SS = "/tmp/live-shots/"; os.makedirs(SS, exist_ok=True)
errors = []
results = []
def ok(name, cond, extra=""):
    results.append((name, bool(cond), extra)); print(("PASS " if cond else "FAIL ") + name, extra); sys.stdout.flush()

def watch(page, tag):
    page.on("console", lambda m: m.type == "error" and errors.append(f"[{tag}] console: {m.text}"))
    page.on("pageerror", lambda e: errors.append(f"[{tag}] pageerror: {e}"))

with sync_playwright() as p:
    b = p.chromium.launch()
    # ---------------- Desktop ----------------
    ctx = b.new_context(viewport={"width": 1366, "height": 900})
    pg = ctx.new_page(); watch(pg, "desktop")
    pg.goto(BASE); pg.wait_for_selector(".week-card")
    n = pg.locator(".week-card").count(); ok("overview renders 40 week cards (27 core + 13 toolkit)", n == 40, str(n))
    ok("overview has 11 phases incl. Phase 0", pg.locator(".phase").count() == 11 and "Phase 0" in pg.inner_text("#phase-0"))
    ok("Phase 0 marked optional", pg.locator("#phase-0 .badge.optbadge").count() == 1)
    time.sleep(0.9); pg.screenshot(path=SS + "overview.png", full_page=False)
    for route in ["#/setup", "#/glossary", "#/progress", "#/cheatsheet"]:
        pg.goto(BASE + route); pg.wait_for_selector("h1"); ok(f"{route} renders", pg.locator("h1").first.inner_text() != "")
    pg.goto(BASE + "#/setup"); pg.wait_for_selector("#subscriptions")
    ok("setup has subscriptions + xAI snippet", "api.x.ai/v1" in pg.inner_text("#subscriptions") and "SuperGrok" in pg.inner_text("#subscriptions"))
    time.sleep(0.9); pg.screenshot(path=SS + "setup.png")
    pg.goto(BASE + "#/glossary"); pg.fill("#gsearch", "rerank"); time.sleep(0.2)
    vis = pg.locator("#gloss .concept:visible").count(); ok("glossary search filters", 0 < vis < 5, str(vis))
    for i in range(1, 28):
        pg.goto(BASE + f"#/week/{i}"); pg.wait_for_selector(".week-title")
        c = pg.evaluate("""() => ({q: document.querySelectorAll('.q').length, tabs: document.querySelectorAll('.tabs .tab').length,
            buddy: !!document.querySelector('.callout.buddy'), analogy: !!document.querySelector('.callout.analogy'), why: !!document.querySelector('.callout.why'),
            res: document.querySelectorAll('.res').length, concepts: document.querySelectorAll('.concept').length})""")
        good = c["q"] == 5 and c["tabs"] == 3 and c["buddy"] and c["analogy"] and c["why"] and c["res"] >= 2 and c["concepts"] >= 3
        ok(f"week {i} page complete", good, json.dumps(c) if not good else "")
    ok("week 1 still maps to the same content", "What an LLM really is" in (pg.goto(BASE + "#/week/1") or pg.wait_for_selector(".week-title") and pg.inner_text(".week-title")))
    for i in range(1, 14):
        pg.goto(BASE + f"#/week/p{i}"); pg.wait_for_selector(".week-title")
        c = pg.evaluate("""() => ({q: document.querySelectorAll('.q').length, tabs: document.querySelectorAll('.tabs .tab').length,
            buddy: !!document.querySelector('.callout.buddy'), analogy: !!document.querySelector('.callout.analogy'), why: !!document.querySelector('.callout.why'),
            opt: !!document.querySelector('.callout.optional'), res: document.querySelectorAll('.res').length, concepts: document.querySelectorAll('.concept').length,
            crumbs: document.querySelector('.crumbs').innerText, ed: !!document.getElementById('editor')})""")
        good = c["q"] == 5 and c["tabs"] >= 1 and c["buddy"] and c["analogy"] and c["why"] and c["opt"] and c["res"] >= 4 and c["concepts"] >= 5 and c["ed"] and f"P{i}" in c["crumbs"]
        ok(f"toolkit P{i} page complete", good, json.dumps(c) if not good else "")
    pg.goto(BASE + "#/cheatsheet"); pg.wait_for_selector(".cs")
    rows = pg.locator("table.cs tr[data-q]").count(); ok("cheat sheet has PowerShell vs bash rows", rows >= 40, str(rows))
    pg.fill("#csearch", "venv"); time.sleep(0.2)
    vis = pg.locator("table.cs tr[data-q]:visible").count(); ok("cheat sheet filter works", 0 < vis < 8, str(vis))
    pg.fill("#csearch", ""); time.sleep(0.9); pg.screenshot(path=SS + "cheatsheet.png")
    pg.goto(BASE + "#/glossary"); pg.fill("#gsearch", "merge conflict"); time.sleep(0.2)
    ok("glossary has new git terms", pg.locator("#gloss .concept:visible").count() >= 1)
    pg.fill("#gsearch", "personal access token"); time.sleep(0.2)
    ok("glossary has GitHub API terms (PAT)", pg.locator("#gloss .concept:visible").count() >= 1)
    # --- P13 GitHub API page ---
    pg.goto(BASE + "#/week/p13"); pg.wait_for_selector(".week-title")
    ok("P13 is the GitHub API session", "GitHub API" in pg.inner_text(".week-title") and "P13" in pg.inner_text(".crumbs"))
    tabs = pg.locator(".tabs .tab").all_inner_texts(); ok("P13 has requests / PyGithub / gh tabs", tabs == ["requests", "PyGithub", "gh CLI / curl"], str(tabs))
    pg.locator(".tab[data-tab=pygithub]").click(); ok("PyGithub tab shows PyGithub code", "Auth.Token" in pg.locator(".tab-panel:not([hidden])").inner_text())
    pg.wait_for_selector("#py-status.ready", timeout=120000)
    pg.click("#btn-check"); pg.wait_for_selector("#console .err", timeout=60000); ok("P13 starter fails with a helpful message", "build_headers" in pg.inner_text("#console"))
    pg.evaluate("""() => { const w = window.ROADMAP.weeks.find(w=>w.id===113); const ed = document.getElementById('editor'); ed.value = w.exercise.solution; ed.dispatchEvent(new Event('input')); }""")
    pg.click("#btn-check"); pg.wait_for_selector("#console .ok", timeout=60000); ok("P13 solution passes in the browser", "All checks passed" in pg.inner_text("#console"))
    st13 = pg.evaluate("JSON.parse(localStorage.getItem('air-progress-v1')).weeks['113']"); ok("P13 progress saved under new key 113", st13 and st13.get("ex"))
    pg.locator("#sec-exercise").scroll_into_view_if_needed(); time.sleep(0.3)
    ok("P13 editor gutter never taller than the editor", pg.evaluate("document.getElementById('gutter').getBoundingClientRect().height <= document.getElementById('editor').getBoundingClientRect().height + 1"))
    pg.evaluate("window.scrollTo({top: 0, behavior: 'instant'})"); time.sleep(3); pg.screenshot(path=SS + "p13.png")
    # Quiz on week 1
    pg.goto(BASE + "#/week/1"); pg.wait_for_selector(".q")
    answers = pg.evaluate("window.ROADMAP.weeks.find(w=>w.id===1).quiz.map(q=>q.a)")
    # answer Q1 wrong first to see wrong feedback
    wrong = (answers[0] + 1) % 4
    pg.locator(".q").nth(0).locator(".opt").nth(wrong).click()
    ok("wrong answer shows feedback", pg.locator(".q").nth(0).locator(".opt.wrong").count() == 1 and "Not quite" in pg.locator(".q").nth(0).locator(".feedback").inner_text())
    for i in range(1, 5):
        pg.locator(".q").nth(i).locator(".opt").nth(answers[i]).click()
    ok("quiz score shown 4/5", "4/5" in pg.inner_text("#quiz-result"))
    pg.locator("#sec-quiz").scroll_into_view_if_needed()
    time.sleep(0.9); pg.screenshot(path=SS + "week-quiz.png")
    pg.click("#quiz-retry")
    for i in range(5): pg.locator(".q").nth(i).locator(".opt").nth(answers[i]).click()
    ok("retry quiz 5/5", "5/5" in pg.inner_text("#quiz-result"))
    # Exercise: starter should fail, solution should pass
    pg.wait_for_selector("#py-status.ready", timeout=120000); ok("pyodide loads in worker", True)
    pg.click("#btn-check"); pg.wait_for_function("document.querySelector('#console .err, #console .ok')", timeout=60000)
    ok("starter code fails checks with message", pg.locator("#console .err").count() == 1, pg.inner_text("#console")[:120])
    pg.evaluate("""() => { const w = window.ROADMAP.weeks.find(w=>w.id===1); const ed = document.getElementById('editor'); ed.value = w.exercise.solution; ed.dispatchEvent(new Event('input')); }""")
    pg.click("#btn-check"); pg.wait_for_selector("#console .ok", timeout=60000)
    ok("solution passes checks", "All checks passed" in pg.inner_text("#console"))
    ok("exercise passed badge", pg.is_visible("#ex-passed"))
    pg.locator("#sec-exercise").scroll_into_view_if_needed(); time.sleep(0.9); pg.screenshot(path=SS + "exercise.png")
    # infinite loop timeout
    pg.evaluate("""() => { const ed = document.getElementById('editor'); ed.value = 'while True:\\n    pass\\n'; ed.dispatchEvent(new Event('input')); }""")
    t0 = time.time(); pg.click("#btn-run"); pg.wait_for_selector("#console .err", timeout=40000)
    ok("infinite loop stopped by timeout", "Stopped after 10 seconds" in pg.inner_text("#console"), f"{time.time()-t0:.1f}s")
    pg.wait_for_selector("#py-status.ready", timeout=120000); ok("worker recreated after timeout", True)
    # restore solution & mark done
    pg.evaluate("""() => { const w = window.ROADMAP.weeks.find(w=>w.id===1); const ed = document.getElementById('editor'); ed.value = w.exercise.solution; ed.dispatchEvent(new Event('input')); }""")
    time.sleep(0.6)
    pg.click("#btn-done")
    # tab memory
    pg.locator(".tab[data-tab=anthropic]").click()
    ok("claude tab shows anthropic code", "anthropic" in pg.locator(".tab-panel:not([hidden])").inner_text())
    # Run every exercise solution in Pyodide
    res = pg.evaluate("""async () => { const out = []; for (const w of window.ROADMAP.weeks) {
        const r = await Py.run(w.exercise.solution, w.exercise.tests); const s = await Py.run(w.exercise.starter, w.exercise.tests);
        out.push([w.id, r.ok, s.ok, r.ok ? '' : r.error]); } return out; }""")
    bad = [r for r in res if not r[1] or r[2]]
    ok(f"all {len(res)} solutions pass & starters fail in Pyodide", not bad and len(res) == 40, json.dumps(bad)[:600])
    # Reload persistence
    pg.reload(); pg.wait_for_selector(".week-title")
    st = pg.evaluate("JSON.parse(localStorage.getItem('air-progress-v1')).weeks['1']")
    ok("progress saved in localStorage", st.get("done") and st.get("ex") and st.get("quizBest") == 5, json.dumps({k: st[k] for k in st if k != 'code'}))
    ok("UI after reload shows passed/complete", pg.is_visible("#ex-passed") and "best: 5/5" in pg.inner_text("#quiz-best") and "Completed" in pg.inner_text("#btn-done"))
    ok("saved code restored", "while True" not in pg.input_value("#editor") and len(pg.input_value("#editor")) > 20)
    ok("claude tab remembered", pg.locator(".tab.active").inner_text() == "Claude")
    pg.goto(BASE); pg.wait_for_selector(".week-card")
    ok("overview shows progress", pg.inner_text("#top-progress-label") != "0%" and pg.locator(".week-card.done").count() == 1, pg.inner_text("#top-progress-label"))
    # export
    pg.goto(BASE + "#/progress"); pg.wait_for_selector("#p-export")
    with pg.expect_download() as dl: pg.click("#p-export")
    path = dl.value.path(); data = json.load(open(path)); ok("export JSON works", data["weeks"]["1"]["done"] is True and data.get("version") == 2)
    # --- Toolkit exercise via the UI (P1) ---
    core_pct_before = pg.evaluate("App.stats().pct")
    pg.goto(BASE + "#/week/p1"); pg.wait_for_selector("#py-status.ready", timeout=120000)
    pg.click("#btn-check"); pg.wait_for_selector("#console .err", timeout=60000)
    ok("P1 starter fails with a helpful message", "clean_prompt" in pg.inner_text("#console"))
    pg.evaluate("""() => { const w = window.ROADMAP.weeks.find(w=>w.id===101); const ed = document.getElementById('editor'); ed.value = w.exercise.solution; ed.dispatchEvent(new Event('input')); }""")
    pg.click("#btn-check"); pg.wait_for_selector("#console .ok", timeout=60000); ok("P1 solution passes in the browser", True)
    time.sleep(0.9); pg.locator("#sec-exercise").scroll_into_view_if_needed(); pg.screenshot(path=SS + "python-exercise.png")
    pg.click("#btn-done")
    pg.goto(BASE + "#/week/p8"); pg.wait_for_selector("#py-status.ready", timeout=120000)
    pg.evaluate("""() => { const w = window.ROADMAP.weeks.find(w=>w.id===108); const ed = document.getElementById('editor'); ed.value = w.exercise.solution; ed.dispatchEvent(new Event('input')); }""")
    pg.click("#btn-check"); pg.wait_for_selector("#console .ok", timeout=120000)
    ok("P8 (async + pydantic) passes in the browser", "Loading" not in pg.inner_text("#console"), pg.inner_text("#console")[:200])
    pg.goto(BASE + "#/week/p10"); pg.wait_for_selector(".tabs")
    pg.reload(); pg.wait_for_selector(".week-title")
    st = pg.evaluate("JSON.parse(localStorage.getItem('air-progress-v1')).weeks['101']")
    ok("toolkit progress saved under its own key (101)", st.get("done") and st.get("ex"), json.dumps({k: st[k] for k in st if k != 'code'}))
    ok("core % unaffected by toolkit progress", pg.evaluate("App.stats().pct") == core_pct_before and pg.evaluate("App.stats().tk.done") == 1)
    pg.goto(BASE); pg.wait_for_selector("#phase-0")
    ok("overview toolkit line shows 1/13", "1/13 done" in pg.inner_text(".tk-line"))
    ok("Phase 0 has a GitHub API group with P13", "GitHub API" in pg.inner_text("#phase-0") and pg.locator("#phase-0 .week-card").count() == 13)
    pg.evaluate("window.scrollTo({top: document.getElementById('phase-0').getBoundingClientRect().top + window.scrollY - 90, behavior: 'instant'})"); time.sleep(0.9); pg.screenshot(path=SS + "phase0.png")
    # --- Forward-deployed engineer roadmap page ---
    pg.goto(BASE); pg.wait_for_selector("#fde-card")
    ok("home has FDE roadmap card + nav link", pg.is_visible("#fde-card") and pg.locator("#topnav a[href='fde.html']").count() == 1)
    pg.click("#fde-card"); pg.wait_for_function("document.body.dataset.mermaid", timeout=60000)
    ok("FDE page renders 4 Mermaid diagrams", pg.evaluate("document.body.dataset.mermaid") == "done" and pg.locator("pre.mermaid svg").count() == 4)
    imgs = pg.evaluate("""async () => { const im = [...document.querySelectorAll('img.fde-img')]; for (const i of im) { i.loading = 'eager'; if (!i.complete) await new Promise(r => { i.onload = i.onerror = r; }); } return im.map(i => i.naturalWidth); }""")
    ok("FDE page SVG infographics load", len(imgs) == 2 and all(imgs), str(imgs))
    t = pg.inner_text("#fde-content")
    ok("FDE page has primer, stages 0-8, privacy rule and review list", all(x in t for x in ["AI, ML and LLMs in plain English", "Stage 0", "Stage 8 (optional)", "Customer privacy rule", "What changed after review"]))
    ok("FDE page links back home", pg.locator(".crumbs a[href='./#/']").count() == 1)
    # --- Top nav: Roadmap submenu (desktop) ---
    top = pg.evaluate("[...document.querySelectorAll('#topnav > a')].map(a => a.textContent.trim())")
    ok("no top-level 'FDE' nav item", top == ["Setup", "Glossary", "Cheat sheet", "Progress"] and "Roadmap" in pg.inner_text("#nav-roadmap-btn"), str(top))
    ok("FDE page highlights Roadmap + its FDE entry", pg.evaluate("""(() => { const b = document.getElementById('nav-roadmap-btn'), a = document.querySelector('#nav-roadmap-menu a[data-nav=fde]');
        return b.classList.contains('active') && a.classList.contains('active') && a.getAttribute('aria-current') === 'page'; })()"""))
    exp = lambda: pg.get_attribute("#nav-roadmap-btn", "aria-expanded")
    ok("submenu closed by default", exp() == "false" and not pg.is_visible("#nav-roadmap-menu"))
    pg.hover("#nav-roadmap-btn"); time.sleep(0.2); ok("submenu opens on hover", exp() == "true" and pg.is_visible("#nav-roadmap-menu a[data-nav=home]"))
    pg.mouse.move(700, 600); time.sleep(0.2); ok("submenu closes when the mouse leaves", exp() == "false" and not pg.is_visible("#nav-roadmap-menu"))
    pg.click("#nav-roadmap-btn"); time.sleep(0.2); ok("submenu opens on click", exp() == "true")
    pg.keyboard.press("Escape"); time.sleep(0.1)
    ok("Esc closes submenu and returns focus", exp() == "false" and pg.evaluate("document.activeElement.id") == "nav-roadmap-btn")
    pg.mouse.move(700, 600); pg.evaluate("document.activeElement.blur()"); pg.focus("#nav-roadmap-btn"); time.sleep(0.1)
    ok("submenu opens on keyboard focus", exp() == "true")
    pg.keyboard.press("ArrowDown"); ok("ArrowDown moves into the submenu", pg.evaluate("document.activeElement.dataset.nav") == "home")
    pg.keyboard.press("Enter"); pg.wait_for_selector(".week-card")
    ok("'AI Engineer (27 weeks)' entry opens the roadmap overview", pg.url.rstrip("/").endswith("#") and pg.locator(".week-card").count() == 40, pg.url)
    ok("overview highlights Roadmap + AI Engineer entry", pg.evaluate("document.getElementById('nav-roadmap-btn').classList.contains('active') && document.querySelector('#nav-roadmap-menu a[data-nav=home]').classList.contains('active')"))
    pg.click("#nav-roadmap-btn"); pg.click("#nav-roadmap-menu a[data-nav=fde]"); pg.wait_for_url("**/fde.html")
    ok("'Forward-Deployed Engineer (43 weeks)' entry opens fde.html", "Forward-Deployed Engineer" in pg.inner_text("h1"))
    pg.goto(BASE + "#/setup"); pg.wait_for_selector("#subscriptions")
    ok("Setup page: Roadmap not highlighted", not pg.evaluate("document.getElementById('nav-roadmap-btn').classList.contains('active')") and pg.locator("#topnav a.active[data-nav=setup]").count() == 1)
    ctx.close()

    # --- Migration: a v1 progress object from before Phase 0 existed ---
    mig = b.new_context(viewport={"width": 1366, "height": 900}); mp = mig.new_page(); watch(mp, "migration")
    mp.goto(BASE); mp.wait_for_selector(".week-card")
    v1 = {"weeks": {"1": {"done": True, "ex": True, "quizBest": 5, "code": "print('mine')"}, "12": {"quizBest": 3}, "27": {"done": True}}, "tab": "openai", "updated": "2026-09-28T10:00:00Z"}
    mp.evaluate("d => { localStorage.clear(); localStorage.setItem('air-progress-v1', JSON.stringify(d)); }", v1)
    mp.reload(); mp.wait_for_selector(".week-card")
    d2 = mp.evaluate("JSON.parse(localStorage.getItem('air-progress-v1'))")
    ok("v1 data migrated to v2 in place", d2.get("version") == 2 and d2["weeks"]["1"]["done"] and d2["weeks"]["27"]["done"] and d2["weeks"]["12"]["quizBest"] == 3)
    ok("v1 backup kept", mp.evaluate("!!localStorage.getItem('air-progress-v1-backup-v1')"))
    ok("old progress shows on overview", mp.locator(".week-card.done").count() == 2 and "2/27" in mp.inner_text(".stat-grid"))
    mp.goto(BASE + "#/week/1"); mp.wait_for_selector(".week-title")
    ok("old week 1 progress + saved code intact", mp.is_visible("#ex-passed") and "best: 5/5" in mp.inner_text("#quiz-best") and "print('mine')" in mp.input_value("#editor"))
    ok("old provider tab preference kept", mp.locator(".tab.active").inner_text() == "OpenAI")
    mp.goto(BASE + "#/week/12"); mp.wait_for_selector(".week-title"); ok("old quiz score on week 12 intact", "best: 3/5" in mp.inner_text("#quiz-best"))
    mp.goto(BASE + "#/week/p1"); mp.wait_for_selector(".week-title"); ok("toolkit starts empty after migration", not mp.is_visible("#ex-passed"))
    mig.close()

    # ---------------- Mobile ----------------
    mctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True,
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
    m = mctx.new_page(); watch(m, "mobile")
    m.goto(BASE); m.wait_for_selector(".week-card")
    def no_hscroll(tag):
        w = m.evaluate("document.documentElement.scrollWidth"); ok(f"mobile no horizontal overflow ({tag})", w <= 391, str(w))
    def pill_tap(k):
        # like a user: swipe the pill bar so the pill is visible, then tap it
        m.evaluate(f"(() => {{ const a = document.querySelector('.side-nav a[data-jump={k}]'); const n = a.parentElement; n.scrollLeft = a.offsetLeft - n.offsetLeft - 16; }})()")
        time.sleep(0.4); box = m.locator(f".side-nav a[data-jump={k}]").bounding_box()
        m.touchscreen.tap(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2); time.sleep(1.2)
        top = m.evaluate(f"document.getElementById('sec-{k}').getBoundingClientRect().top")
        for _ in range(10):  # long pages: let the smooth scroll finish
            time.sleep(0.3); t2 = m.evaluate(f"document.getElementById('sec-{k}').getBoundingClientRect().top")
            if t2 == top: break
            top = t2
        ok(f"mobile pill '{k}' jumps to section", 0 <= top < 200, str(top))
    no_hscroll("overview"); time.sleep(0.9); m.screenshot(path=SS + "mobile-overview.png")
    ok("mobile nav hidden by default", not m.is_visible("#topnav a[data-nav=setup]"))
    m.tap("#menu-btn"); ok("mobile menu opens", m.is_visible("#topnav a[data-nav=setup]"))
    m.tap("#topnav a[data-nav=setup]"); m.wait_for_selector("#subscriptions"); no_hscroll("setup")
    time.sleep(0.9); m.screenshot(path=SS + "mobile-setup.png")
    m.goto(BASE + "#/glossary"); m.wait_for_selector("#gloss"); no_hscroll("glossary")
    m.goto(BASE + "#/progress"); m.wait_for_selector(".tbl"); no_hscroll("progress")
    m.goto(BASE + "#/week/9"); m.wait_for_selector(".week-title"); no_hscroll("week 9")
    ok("side-nav is horizontal pill bar", m.evaluate("getComputedStyle(document.querySelector('.side-nav')).flexDirection") == "row")
    time.sleep(0.9); m.screenshot(path=SS + "mobile-week.png")
    pill_tap("quiz")
    ans = m.evaluate("window.ROADMAP.weeks.find(w=>w.id===9).quiz.map(q=>q.a)")
    m.locator(".q").nth(0).locator(".opt").nth(ans[0]).tap()
    m.locator(".q").nth(1).locator(".opt").nth((ans[1] + 1) % 4).tap()
    ok("mobile quiz taps give feedback", m.locator(".feedback").count() == 2)
    hgt = m.evaluate("Math.min(...[...document.querySelectorAll('.opt')].map(o=>o.getBoundingClientRect().height))"); ok("quiz options are big tap targets (>=44px)", hgt >= 44, str(hgt))
    m.locator(".q").nth(0).scroll_into_view_if_needed(); m.evaluate("window.scrollBy(0,-120)")
    time.sleep(0.9); m.screenshot(path=SS + "mobile-quiz.png")
    # editor usability
    pill_tap("exercise")
    fs = m.evaluate("getComputedStyle(document.getElementById('editor')).fontSize"); ok("editor font >=16px on mobile (no iOS zoom)", fs == "16px", fs)
    ok("keybar visible on mobile", m.is_visible("#keybar"))
    m.evaluate("""() => { const ed = document.getElementById('editor'); ed.value=''; ed.dispatchEvent(new Event('input')); }""")
    m.tap("#editor"); m.keyboard.type("def f(x):"); m.keyboard.press("Enter"); m.keyboard.type("return x * 2")
    m.keyboard.press("Enter"); m.keyboard.press("Backspace"); m.keyboard.type("print")
    m.tap("#keybar button[data-key='()']"); m.keyboard.type("f"); m.tap("#keybar button[data-key='()']"); m.keyboard.type("21")
    val = m.input_value("#editor"); ok("auto-indent + keybar produce valid code", val == "def f(x):\n    return x * 2\nprint(f(21))", repr(val))
    m.wait_for_selector("#py-status.ready", timeout=120000)
    m.tap("#btn-run"); m.wait_for_selector("#console .info:has-text('Ran without errors')", timeout=60000)
    ok("mobile Run prints output", "42" in m.inner_text("#console"))
    m.evaluate("""() => { const w = window.ROADMAP.weeks.find(w=>w.id===9); const ed = document.getElementById('editor'); ed.value = w.exercise.solution; ed.dispatchEvent(new Event('input')); }""")
    m.tap("#btn-check"); m.wait_for_selector("#console .ok", timeout=60000); ok("mobile Check passes", True)
    bw = m.evaluate("document.getElementById('btn-check').getBoundingClientRect().height"); ok("exercise buttons tappable (>=40px)", bw >= 40, str(bw))
    no_hscroll("exercise")
    m.locator(".ex-bar").scroll_into_view_if_needed(); m.evaluate("window.scrollBy(0, 250)")
    time.sleep(0.9); m.screenshot(path=SS + "mobile-exercise.png")
    m.reload(); m.wait_for_selector(".week-title")
    ok("mobile progress survives reload", m.is_visible("#ex-passed"))
    # --- Mobile: Phase 0 + a Python exercise + shell/git pages ---
    m.goto(BASE); m.wait_for_selector("#phase-0")
    m.evaluate("window.scrollTo({top: document.getElementById('phase-0').getBoundingClientRect().top + window.scrollY - 90, behavior: 'instant'})")
    time.sleep(0.9); m.screenshot(path=SS + "mobile-phase0.png")
    for r in ["#/week/p1", "#/week/p4", "#/week/p9", "#/week/p10", "#/week/p12", "#/week/p13", "#/cheatsheet"]:
        m.goto(BASE + r); m.wait_for_selector("h1"); time.sleep(0.3); no_hscroll(r)
    m.goto(BASE + "#/cheatsheet"); m.wait_for_selector(".cs")
    ok("cheat sheet stacks into cards on mobile", m.evaluate("getComputedStyle(document.querySelector('table.cs td')).display") == "block")
    time.sleep(0.6); m.screenshot(path=SS + "mobile-cheatsheet.png")
    m.goto(BASE + "#/week/p2"); m.wait_for_selector("#py-status.ready", timeout=120000)
    pill_tap("exercise")
    m.evaluate("""() => { const w = window.ROADMAP.weeks.find(w=>w.id===102); const ed = document.getElementById('editor'); ed.value = w.exercise.solution; ed.dispatchEvent(new Event('input')); }""")
    m.tap("#btn-check"); m.wait_for_selector("#console .ok", timeout=60000); ok("mobile P2 Python exercise passes", True)
    m.locator(".ex-bar").scroll_into_view_if_needed(); m.evaluate("window.scrollBy(0, 200)")
    time.sleep(0.9); m.screenshot(path=SS + "mobile-python-exercise.png")
    m.goto(BASE + "#/week/p13"); m.wait_for_selector("#py-status.ready", timeout=120000)
    m.evaluate("window.scrollTo({top: 0, behavior: 'instant'})"); time.sleep(3); m.screenshot(path=SS + "mobile-p13.png")
    pill_tap("exercise")
    m.evaluate("""() => { const w = window.ROADMAP.weeks.find(w=>w.id===113); const ed = document.getElementById('editor'); ed.value = w.exercise.solution; ed.dispatchEvent(new Event('input')); }""")
    m.tap("#btn-check"); m.wait_for_selector("#console .ok", timeout=60000); ok("mobile P13 GitHub API exercise passes", True); no_hscroll("p13 exercise")
    m.locator(".tab[data-tab=gh]").tap(); ok("mobile P13 gh tab renders", "gh issue list" in m.inner_text(".tab-panel:not([hidden])")); no_hscroll("p13 gh tab")
    m.goto(BASE + "fde.html"); m.wait_for_function("document.body.dataset.mermaid", timeout=60000); no_hscroll("fde page")
    ok("mobile FDE page renders 4 Mermaid diagrams", m.locator("pre.mermaid svg").count() == 4)
    # --- Top nav: Roadmap submenu (phone) ---
    m.goto(BASE); m.wait_for_selector(".week-card"); m.tap("#menu-btn")
    url0 = m.url; m.tap("#nav-roadmap-btn"); time.sleep(0.3)
    ok("mobile: first tap on Roadmap expands, does not navigate", m.url == url0 and m.get_attribute("#nav-roadmap-btn", "aria-expanded") == "true" and m.is_visible("#nav-roadmap-menu a[data-nav=fde]"))
    hs = m.evaluate("[document.getElementById('nav-roadmap-btn'), ...document.querySelectorAll('#nav-roadmap-menu a'), ...document.querySelectorAll('#topnav > a')].map(e => Math.round(e.getBoundingClientRect().height))")
    ok("mobile: nav tap targets >= 44px", min(hs) >= 44, str(hs))
    no_hscroll("open nav")
    m.tap("#nav-roadmap-btn"); time.sleep(0.2)
    ok("mobile: second tap collapses the submenu", m.get_attribute("#nav-roadmap-btn", "aria-expanded") == "false" and not m.is_visible("#nav-roadmap-menu a[data-nav=fde]"))
    m.tap("#nav-roadmap-btn"); m.tap("#nav-roadmap-menu a[data-nav=fde]"); m.wait_for_url("**/fde.html")
    ok("mobile: FDE entry opens fde.html", "Forward-Deployed Engineer" in m.inner_text("h1"))
    m.tap("#menu-btn"); m.tap("#nav-roadmap-btn"); time.sleep(0.2); m.tap("#nav-roadmap-menu a[data-nav=home]"); m.wait_for_selector(".week-card")
    ok("mobile: AI Engineer entry opens the roadmap overview", m.locator(".week-card").count() == 40 and not m.is_visible("#nav-roadmap-menu"))
    m.goto(BASE + "#/week/p9"); m.wait_for_selector(".tabs")
    ok("PowerShell project tab renders", "Activate.ps1" in m.inner_text(".tab-panel:not([hidden])"))
    mctx.close(); b.close()

real = [e for e in errors if "fonts.g" not in e and "favicon" not in e]
ok("no console errors", not real, "\n".join(real[:10]))
fails = [r for r in results if not r[1]]
print(f"\n{len(results)-len(fails)}/{len(results)} checks passed")
sys.exit(1 if fails else 0)
