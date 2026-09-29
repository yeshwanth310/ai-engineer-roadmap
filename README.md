# AI Engineer Roadmap

A self-paced, **no-maths** roadmap from Python developer to AI engineer. It has **27 weekly two-hour sessions across 10 phases**: LLM basics, prompting, APIs, structured output, tools, RAG, agents, frameworks, evals, safety and deployment. There is also an **optional Phase 0 "Engineer's Toolkit"** for anyone who needs Python, the terminal or git first.

**Live site:** https://yeshwanth310.github.io/ai-engineer-roadmap/

## What's inside

Every session includes:
- a plain-English lesson with an analogy
- key concepts and curated resources
- a 5-question quiz
- a runnable **in-browser Python exercise** with an automatic checker (Pyodide, nothing to install)
- a mini project with Gemini (free tier), OpenAI and Claude code
- a study-buddy tip

Progress is saved in your browser.

### Phase 0: Engineer's Toolkit (optional, skippable)

Take each session's quiz; if you score 5/5, skip it.

| Session | Topic |
|---|---|
| P1 | Python basics: variables, types, strings & f-strings |
| P2 | Lists, dictionaries & control flow |
| P3 | Functions, errors & exceptions |
| P4 | Files, JSON, modules, pip & virtual environments |
| P5 | Classes, dataclasses & type hints |
| P6 | Comprehensions, sorting & Pythonic tools |
| P7 | Talking to web APIs: HTTP, requests, env vars & .env |
| P8 | Async basics & Pydantic basics |
| P9 | Shell I: PowerShell basics (Windows) |
| P10 | Shell II: Linux & bash commands for AI work |
| P11 | Git I: version control, commits, GitHub & keeping secrets out |
| P12 | Git II: branches, merging, conflicts, pull requests & AI project workflow |

- The shell and git exercises use command-matching checkers and a small git simulator, because real shells can't run in the browser.
- The **Cheat sheet** page (`#/cheatsheet`) puts common PowerShell and bash commands side by side.

### Core roadmap
Weeks 1–27 across Phases 1–10. Open the site's overview for the full phase map.

## Progress & URLs
- Core weeks: `#/week/1` … `#/week/27`.
- Toolkit sessions: `#/week/p1` … `#/week/p12`. Internally these are ids 101–112, so they never collide with core week numbers.
- Progress lives in `localStorage` (`air-progress-v1`).
  - Storage schema v2 keeps every existing week key unchanged.
  - The first time v2 loads, it writes a one-time backup to `air-progress-v1-backup-v1`.
- The headline percentage counts the 27 core weeks. Toolkit progress is shown separately.
- Export and import are available on the Progress page.

## Run locally
```bash
python -m http.server 8080
# open http://localhost:8080
```

## Tests
The Playwright smoke test covers desktop and 390x844 mobile. It checks that:
- every solution passes and every starter fails
- progress is saved and migrated correctly
- there is no horizontal scroll
- there are no console errors

```bash
pip install playwright && playwright install chromium
python tests/test_site.py                     # against http://localhost:8080
python tests/test_site.py https://yeshwanth310.github.io/ai-engineer-roadmap/ --no-shots
```

Screenshots are in `screenshots/`.
