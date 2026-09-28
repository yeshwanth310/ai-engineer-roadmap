import json, subprocess, io, contextlib, sys
data = json.loads(subprocess.check_output(["node", "/workspace/tools/dump.js"]))
def run(code, tests):
    ns = {"__name__": "__main__"}; out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out):
            exec(code, ns); exec(tests, ns)
        return True, ""
    except BaseException as e:
        return False, f"{type(e).__name__}: {e}"
bad = 0
for w in data["weeks"]:
    ex = w["exercise"]
    ok, err = run(ex["solution"], ex["tests"])
    sok, serr = run(ex["starter"], ex["tests"])
    q = w["quiz"]; assert len(q) == 5, w["id"]
    for qq in q: assert 0 <= qq["a"] < len(qq["o"]), (w["id"], qq["q"])
    flag = "OK " if ok and not sok else "BAD"
    if flag == "BAD": bad += 1
    print(f"{flag} W{w['id']:>2} sol={'pass' if ok else 'FAIL '+err} starter={'fails' if not sok else 'PASSES(!)'} | {serr[:70]}")
print("weeks:", len(data["weeks"]), "bad:", bad)
