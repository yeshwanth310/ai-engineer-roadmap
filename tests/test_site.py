import json, sys, time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8080/"
SS = "/workspace/ai-roadmap/screenshots/"
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
    n = pg.locator(".week-card").count(); ok("overview renders 27 week cards", n == 27, str(n))
    ok("overview has 10 phases", pg.locator(".phase").count() == 10)
    time.sleep(0.9); pg.screenshot(path=SS + "overview.png", full_page=False)
    for route in ["#/setup", "#/glossary", "#/progress"]:
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
    ok("all 27 solutions pass & starters fail in Pyodide", not bad, json.dumps(bad)[:600])
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
    path = dl.value.path(); data = json.load(open(path)); ok("export JSON works", data["weeks"]["1"]["done"] is True)
    ctx.close()

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
    mctx.close(); b.close()

real = [e for e in errors if "fonts.g" not in e and "favicon" not in e]
ok("no console errors", not real, "\n".join(real[:10]))
fails = [r for r in results if not r[1]]
print(f"\n{len(results)-len(fails)}/{len(results)} checks passed")
sys.exit(1 if fails else 0)
