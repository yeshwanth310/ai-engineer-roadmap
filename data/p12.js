(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
/* ================= TOOLKIT P12 ================= */
W.push({
id:112, phase:0, title:"Git II: branches, merging, conflicts, pull requests & an AI-project workflow",
skip:"you work on feature branches, resolve merge conflicts calmly, and open and merge pull requests on GitHub.",
goal:"Work on changes safely in branches, merge them back, resolve merge conflicts without panic, and use GitHub pull requests for review. Then put it all together into a simple, professional workflow for an AI project (prompts, eval sets, data and secrets included).",
plan:[["30m","Read & try"],["10m","Quiz"],["45m","Exercise"],["35m","Mini project"]],
analogy:"A <b>branch</b> is a parallel universe for your project. You can try a bold new prompt in the “experiment” universe while the “main” universe keeps working for everyone. <b>Merging</b> brings the experiment's changes back into main. A <b>merge conflict</b> is when both universes changed the same sentence differently, so git asks you, the author, to pick the final wording. A <b>pull request</b> is saying “please review my experiment before we make it official”.",
why:"In AI projects, prompt tweaks and agent changes can quietly make things worse. Branches plus pull requests give you a place to run your evals (Week 22) and get a second pair of eyes <i>before</i> a change reaches users. Conflicts are inevitable once two people (or you on two laptops) touch the same file, and resolving them is a basic professional skill.",
explain:`
<p><b>Branches</b></p>
<pre class="code">git branch                        # list branches (* marks the current one)
git switch -c feature/better-prompt   # create a branch and switch to it (older: git checkout -b ...)
# ...edit, add, commit as usual...
git switch main                   # go back - your files change to main's version
git merge feature/better-prompt   # bring the branch's commits into main
git branch -d feature/better-prompt   # tidy up once merged</pre>
<p>A branch is just a movable label pointing at a commit, so creating one is instant and free. Name branches after the change (<code>feature/rag-reranker</code>, <code>fix/json-parsing</code>). If main hasn't moved since you branched, the merge is a simple <b>fast-forward</b>. Otherwise git creates a <b>merge commit</b> joining the two histories.</p>
<p><b>Merge conflicts.</b> If both sides changed the same lines, git stops and marks the file:</p>
<pre class="code">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
SYSTEM = "You are a concise assistant."
=======
SYSTEM = "You are a friendly, detailed assistant."
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/tone</pre>
<p>The top part is <b>ours</b> (the branch you're on) and the bottom part is <b>theirs</b> (the branch being merged in). To resolve: edit the file to the version you want (one side, both, or a rewrite), <b>delete all three marker lines</b>, then <code>git add file</code> and <code>git commit</code>. Changed your mind? <code>git merge --abort</code> returns you to before the merge. Editors like VS Code show “Accept current / incoming / both” buttons that do the same thing.</p>
<p><b>Useful extras:</b></p>
<ul>
<li><code>git stash</code> shelves unfinished changes so you can switch branches, and <code>git stash pop</code> brings them back.</li>
<li><code>git revert &lt;hash&gt;</code> creates a new commit that undoes an old one. That's safe on shared branches, whereas rewriting history is not.</li>
<li><code>git tag v1.0</code> marks a release.</li>
<li>You'll hear about <code>git rebase</code>. It replays your commits on top of another branch for a tidier history. It's fine on your own unpushed branches, but never rebase commits others already have.</li>
</ul>
<p><b>Pull requests (PRs)</b> on GitHub: push your branch (<code>git push -u origin feature/x</code>), then open a PR, either on github.com or with <code>gh pr create</code>. The PR shows the diff, lets reviewers comment line by line, and runs automated checks (GitHub Actions) such as tests and evals. When it's approved, merge it (a “squash merge” turns the branch into one tidy commit), delete the branch, and <code>git pull</code> on main.</p>
<p><b>A simple workflow for an AI project:</b></p>
<ol>
<li><b>main always works.</b> Every change happens on a short-lived branch and goes through a PR, even if you're solo, because the PR is where you check the diff and the eval results.</li>
<li><b>Commit prompts, eval datasets (small JSONL files) and config</b> alongside code, so a quality change can always be traced to the exact prompt edit.</li>
<li><b>Don't commit</b> secrets (.env), virtual envs, caches, large datasets or model weights. Keep those in .gitignore, and use cloud storage or Git LFS for big files.</li>
<li><b>Run evals before merging</b> (Week 22), ideally automatically in CI, and paste the scores into the PR description.</li>
<li>Write <b>clear commit messages and PR descriptions</b>: what changed, why, and how you tested it. Tag releases you deploy.</li>
</ol>`,
concepts:[["Branch","A movable label for a line of work; switch -c creates one and switches to it."],["Merge","Combine another branch's commits into the current branch."],["Merge conflict","Both sides changed the same lines; you choose the final text and remove the markers."],["ours / theirs","In a conflict: ours = your current branch (HEAD), theirs = the branch being merged."],["Pull request","A GitHub proposal to merge a branch, with diff, review and automated checks."],["revert / stash / tag","Undo safely with a new commit / shelve work in progress / mark a release."]],
resources:[
 {t:"Pro Git: Basic branching and merging",u:"https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging",type:"book"},
 {t:"Learn Git Branching (interactive, in the browser)",u:"https://learngitbranching.js.org/",type:"interactive"},
 {t:"GitHub Docs: About pull requests",u:"https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests",type:"docs"},
 {t:"GitHub Docs: Resolving a merge conflict using the command line",u:"https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line",type:"docs"},
 {t:"GitHub Docs: Hello World (branch, PR, merge tutorial)",u:"https://docs.github.com/en/get-started/start-your-journey/hello-world",type:"docs"}
],
quiz:[
 {q:"Which command creates a new branch and switches to it?",o:["git merge feature","git switch -c feature","git push feature","git log feature"],a:1,e:"switch -c (or the older checkout -b) creates and switches in one step."},
 {q:"In a conflict block, the part between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> and <code>=======</code> is…",o:["Theirs (incoming)","Ours (the branch you're on)","A comment","Deleted text"],a:1,e:"HEAD is your current branch, so the top half is ours."},
 {q:"After editing a conflicted file to the version you want, what's next?",o:["Delete the repo","Remove the markers, git add the file, then git commit","git push --force","Nothing"],a:1,e:"Staging the file tells git the conflict is resolved, and the commit finishes the merge."},
 {q:"Why use a pull request even on a solo AI project?",o:["GitHub requires it","It's a checkpoint to review the diff and run evals before changes reach main","It makes the repo private","It's faster than committing"],a:1,e:"PRs are where quality gates (tests, evals, review) live."},
 {q:"You need to undo a bad commit that's already on the shared main branch. Safest option?",o:["git reset --hard and force-push","git revert &lt;hash&gt;","Delete the repo","Edit the history by hand"],a:1,e:"revert adds a new commit that undoes the old one, without rewriting shared history."}
],
exercise:{title:"Resolve conflicts + a simulated branch workflow",
task:`<p><b>Part A: conflict resolver.</b> Implement:</p>
<ul>
<li><code>has_conflicts(text)</code>: True if any line starts with <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>.</li>
<li><code>resolve(text, choose)</code>: return the text with every conflict block replaced by the <code>"ours"</code> lines, the <code>"theirs"</code> lines, or <code>"both"</code> (ours then theirs). Lines outside conflicts stay unchanged. Raise <code>ValueError</code> for any other choice. Conflict blocks run from a line starting with <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, through <code>=======</code>, to a line starting with <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>.</li>
</ul>
<p><b>Part B: simulated git.</b> Fill the <code>STEPS</code> list with the git commands for this scenario. The checker runs them through a tiny git simulator:</p>
<blockquote>You're on <code>main</code> with some edited files. Create and switch to a branch called <code>feature/eval-set</code>, stage all changes, commit them with a message, and push the branch to <code>origin</code>, setting it as the upstream so you can open a pull request.</blockquote>`,
starter:py`def has_conflicts(text):
    return False  # TODO


def resolve(text, choose):
    return text  # TODO


STEPS = [
    # "git ...",
]

sample = """intro
<<<<<<< HEAD
SYSTEM = "concise"
=======
SYSTEM = "friendly"
>>>>>>> feature/tone
outro
"""
print(resolve(sample, "theirs"))
`,
solution:py`def has_conflicts(text):
    return any(line.startswith("<<<<<<<") for line in text.splitlines())


def resolve(text, choose):
    if choose not in ("ours", "theirs", "both"):
        raise ValueError("choose must be 'ours', 'theirs' or 'both'")
    out, ours, theirs = [], [], []
    state = "normal"
    for line in text.splitlines(keepends=True):
        if state == "normal" and line.startswith("<<<<<<<"):
            state, ours, theirs = "ours", [], []
        elif state == "ours" and line.startswith("======="):
            state = "theirs"
        elif state == "theirs" and line.startswith(">>>>>>>"):
            out += ours if choose == "ours" else theirs if choose == "theirs" else ours + theirs
            state = "normal"
        elif state == "ours":
            ours.append(line)
        elif state == "theirs":
            theirs.append(line)
        else:
            out.append(line)
    return "".join(out)


STEPS = [
    "git switch -c feature/eval-set",
    "git add .",
    'git commit -m "Add first 20 eval questions"',
    "git push -u origin feature/eval-set",
]

sample = """intro
<<<<<<< HEAD
SYSTEM = "concise"
=======
SYSTEM = "friendly"
>>>>>>> feature/tone
outro
"""
print(resolve(sample, "theirs"))
`,
tests:py`import shlex
S = 'intro\n<<<<<<< HEAD\nSYSTEM = "concise"\n=======\nSYSTEM = "friendly"\n>>>>>>> feature/tone\nmiddle\n<<<<<<< HEAD\nA\n=======\nB\nC\n>>>>>>> other\noutro\n'
assert has_conflicts(S) and not has_conflicts("no conflicts here\n"), "has_conflicts wrong"
assert resolve(S, "ours") == 'intro\nSYSTEM = "concise"\nmiddle\nA\noutro\n', "ours wrong: " + repr(resolve(S, "ours"))
assert resolve(S, "theirs") == 'intro\nSYSTEM = "friendly"\nmiddle\nB\nC\noutro\n', "theirs wrong: " + repr(resolve(S, "theirs"))
assert resolve(S, "both") == 'intro\nSYSTEM = "concise"\nSYSTEM = "friendly"\nmiddle\nA\nB\nC\noutro\n', "both wrong"
assert not has_conflicts(resolve(S, "both")), "No markers may remain after resolving"
assert resolve("plain\ntext\n", "ours") == "plain\ntext\n", "Text without conflicts must be unchanged"
try:
    resolve(S, "mine")
    assert False, "An invalid choice should raise ValueError"
except ValueError:
    pass

# ---- tiny git simulator for Part B ----
st = {"branch": "main", "branches": {"main"}, "dirty": True, "staged": False, "commits": {"main": 1}, "upstream": {}, "pushed": set()}
def run(cmd):
    a = shlex.split(cmd)
    assert a[:1] == ["git"], f"{cmd!r}: every step should be a git command"
    sub, rest = (a[1] if len(a) > 1 else ""), a[2:]
    if sub in ("status", "log", "diff", "branch") and not (sub == "branch" and rest):
        return
    if (sub == "switch" and rest[:1] == ["-c"]) or (sub == "checkout" and rest[:1] == ["-b"]):
        name = rest[1]; assert name not in st["branches"], f"branch {name} already exists"
        st["branches"].add(name); st["commits"][name] = st["commits"][st["branch"]]; st["branch"] = name
    elif sub == "branch" and len(rest) == 1:
        st["branches"].add(rest[0]); st["commits"][rest[0]] = st["commits"][st["branch"]]
    elif sub in ("switch", "checkout") and len(rest) == 1:
        assert rest[0] in st["branches"], f"{cmd!r}: branch {rest[0]} doesn't exist yet"
        st["branch"] = rest[0]
    elif sub == "add":
        assert rest and rest[0] in (".", "-A", "--all"), f"{cmd!r}: stage ALL changes (git add . or git add -A)"
        st["staged"] = st["dirty"]
    elif sub == "commit":
        assert "-m" in rest and rest[rest.index("-m") + 1].strip(), f"{cmd!r}: use -m \"a message\""
        assert st["staged"], f"{cmd!r}: nothing staged - run git add first"
        st["commits"][st["branch"]] += 1; st["staged"] = st["dirty"] = False
    elif sub == "push":
        flags = [x for x in rest if x.startswith("-")]; pos = [x for x in rest if not x.startswith("-")]
        assert pos[:1] == ["origin"] and len(pos) == 2, f"{cmd!r}: push to origin with the branch name"
        if "-u" in flags or "--set-upstream" in flags: st["upstream"][pos[1]] = "origin"
        st["pushed"].add(pos[1])
    else:
        raise AssertionError(f"The simulator doesn't understand {cmd!r}")
assert isinstance(STEPS, list) and STEPS, "Fill in the STEPS list"
for step in STEPS:
    run(step)
B = "feature/eval-set"
assert B in st["branches"], "Create the branch feature/eval-set"
assert st["commits"]["main"] == 1, "Your commit landed on main - switch to the new branch BEFORE committing"
assert st["commits"][B] == 2, "Commit your staged changes on feature/eval-set"
assert B in st["pushed"] and st["upstream"].get(B) == "origin", "Push the branch with -u (set upstream): git push -u origin feature/eval-set"
print("✅ All checks passed!")
`},
project:{title:"Your first pull request, and a deliberate merge conflict",
desc:"Practise the full professional loop on one of your GitHub repos: branch → change a prompt → commit → push → open a PR → review the diff → merge → update main. Then create a merge conflict on purpose and resolve it, so the first real one doesn't scare you.",
steps:["Create a branch, change a prompt or README, commit, and push with <code>-u</code>.","Open a PR (<code>gh pr create</code> or the GitHub button), read the “Files changed” tab, and merge it. Then switch to main, pull, and delete the branch.","Conflict drill: make two branches that change the <b>same line</b> of the same file differently, merge the first, then merge the second and resolve the conflict.","Write the PR description like a pro: what changed, why, and how you tested it (e.g. “eval score 0.82 → 0.88”)."],
code:{terminal:py`# Works the same in bash and PowerShell
# --- 1. Branch, commit, push, PR ---
git switch main
git pull
git switch -c feature/friendlier-prompt
# ...edit prompts.py...
git add prompts.py
git commit -m "Make system prompt friendlier; add 'I don't know' rule"
git push -u origin feature/friendlier-prompt
gh pr create --fill              # or open the PR on github.com
gh pr view --web                 # review the diff in the browser
gh pr merge --squash --delete-branch
git switch main
git pull

# --- 2. Conflict drill ---
git switch -c tone-a
# edit line 1 of prompts.py to: SYSTEM = "You are concise."
git commit -am "Tone A: concise"
git switch main
git switch -c tone-b
# edit the SAME line to: SYSTEM = "You are detailed and friendly."
git commit -am "Tone B: detailed"
git switch main
git merge tone-a                  # fast-forward, no problem
git merge tone-b                  # CONFLICT (content): Merge conflict in prompts.py
git status                        # shows "both modified: prompts.py"
# open prompts.py, pick the final text, delete the <<<<<<< ======= >>>>>>> lines
git add prompts.py
git commit -m "Merge tone-b: keep concise tone, add friendliness"
git log --oneline --graph         # see the merge in the history
git branch -d tone-a tone-b
# (git merge --abort would have cancelled the merge instead)
`}}
});
})();
