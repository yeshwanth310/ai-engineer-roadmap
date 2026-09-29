/* Runs Python (Pyodide) off the main thread so the page never freezes. */
const PYODIDE_URLS = [
  "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/",
  "https://cdn.jsdelivr.net/pyodide/v0.29.5/full/"
];
let pyodide = null;
let out = [];
const loaded = new Set();

async function boot() {
  let lastErr;
  for (const base of PYODIDE_URLS) {
    try {
      importScripts(base + "pyodide.js");
      pyodide = await loadPyodide({ indexURL: base });
      pyodide.setStdout({ batched: (s) => out.push(s) });
      pyodide.setStderr({ batched: (s) => out.push(s) });
      pyodide.runPython(HARNESS);
      return base;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("Could not load Pyodide");
}

const HARNESS = `
import traceback, sys, ast, inspect
_FLAGS = ast.PyCF_ALLOW_TOP_LEVEL_AWAIT
async def _exec(src, name, ns):
    r = eval(compile(src, name, "exec", flags=_FLAGS), ns)
    if inspect.iscoroutine(r):
        await r
async def __air_run(code, tests):
    ns = {"__name__": "__main__"}
    stage = "your code"
    try:
        await _exec(code, "<your code>", ns)
        if tests:
            stage = "the checks"
            await _exec(tests, "<checks>", ns)
        return {"ok": True, "error": ""}
    except AssertionError as e:
        msg = str(e) or "A check failed (no message)."
        return {"ok": False, "error": "❌ Check failed: " + msg, "kind": "assert"}
    except SyntaxError as e:
        return {"ok": False, "kind": "syntax",
                "error": f"SyntaxError on line {e.lineno}: {e.msg}\\n    {(e.text or '').rstrip()}\\nTip: check colons, brackets, quotes and indentation."}
    except BaseException as e:
        tb = traceback.extract_tb(e.__traceback__)
        lines = [f for f in tb if f.filename in ("<your code>", "<checks>")]
        where = ""
        if lines:
            f = lines[-1]
            where = f" (line {f.lineno} of {'your code' if f.filename == '<your code>' else 'the checks'})"
        hint = {
          "NameError": "Tip: a name is misspelled or a function hasn't been defined yet.",
          "TypeError": "Tip: a value has the wrong type, or a function got the wrong number of arguments.",
          "NotImplementedError": "Tip: replace the placeholder 'raise NotImplementedError' with your code.",
          "KeyError": "Tip: a dictionary key doesn't exist - print the dict to see what's inside.",
          "IndexError": "Tip: you're reading past the end of a list.",
          "AttributeError": "Tip: that object doesn't have that method/attribute - check spelling.",
          "IndentationError": "Tip: make indentation consistent (4 spaces).",
        }.get(type(e).__name__, "")
        return {"ok": False, "kind": "error",
                "error": f"{type(e).__name__}: {e}{where} while running {stage}\\n{hint}".rstrip()}
`;

const ready = boot().then(
  (base) => postMessage({ type: "ready", base }),
  (e) => postMessage({ type: "boot-error", error: String(e && e.message || e) })
);

onmessage = async (ev) => {
  const { id, code, tests } = ev.data;
  try {
    await ready;
    if (!pyodide) throw new Error("Python failed to load (are you offline?)");
    out = [];
    const t = typeof tests === "string" ? tests : "";
    // Load any extra packages (e.g. pydantic) the code imports - downloaded once from the CDN
    try {
      const imports = pyodide.pyimport("pyodide.code").find_imports(code + "\n" + t).toJs();
      const missing = imports.filter(n => !loaded.has(n) && !["asyncio","json","math","re","os","sys","time","random","dataclasses","typing","pathlib","collections","itertools","functools","fnmatch","string","datetime","inspect","ast","textwrap","statistics","urllib","http","enum","abc","copy","io","base64","hashlib","shlex","traceback","contextlib","operator"].includes(n));
      if (missing.length) { postMessage({ type: "status", id, msg: "Loading packages: " + missing.join(", ") + "…" }); await pyodide.loadPackagesFromImports(code + "\n" + t, { messageCallback: () => {} }); missing.forEach(n => loaded.add(n)); postMessage({ type: "status-done", id }); }
    } catch (e) { /* unknown packages simply fail at import time with a clear error */ }
    const fn = pyodide.globals.get("__air_run");
    const res = await fn(code, t);
    const js = res.toJs({ dict_converter: Object.fromEntries });
    res.destroy(); fn.destroy();
    postMessage({ type: "result", id, ok: js.ok, error: js.error, kind: js.kind || "", stdout: out.join("\n") });
  } catch (e) {
    postMessage({ type: "result", id, ok: false, error: String(e && e.message || e), stdout: out.join("\n") });
  }
};
