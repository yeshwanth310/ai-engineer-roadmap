(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
/* ================= TOOLKIT P11 ================= */
W.push({
id:111, phase:0, title:"Git I: version control, commits, GitHub & keeping secrets out",
skip:"you use git init/clone, add, commit, push and pull daily, and your .gitignore always covers .env and .venv.",
goal:"Understand what version control is and why every AI project needs it. Use the core git loop (clone or init, status, add, commit, push, pull), put a project on GitHub, and make sure API keys and .env files never end up in your history.",
plan:[["30m","Read & try"],["10m","Quiz"],["40m","Exercise"],["40m","Mini project"]],
analogy:"Git is a <b>save-game system</b> for your project. Each <b>commit</b> is a save point with a note (“prompt v3: added examples”), and you can always reload an old save. The <b>staging area</b> is packing a box before you seal it: <code>git add</code> puts items in the box, <code>git commit</code> seals and labels it. <b>GitHub</b> is a cloud storage unit for your boxes: <code>push</code> sends sealed boxes there, <code>pull</code> fetches boxes other people (or your other laptop) added. <b>.gitignore</b> is the list of things that must never go in a box, starting with your house keys (the .env file).",
why:"Prompts, eval sets and agent code change constantly, and “it worked yesterday” is only fixable if you can see exactly what changed. Every job, open-source project and deployment platform (including GitHub Pages, where this site is hosted) runs on git. Leaked API keys in public repos are one of the most common and expensive beginner mistakes, and they're 100% preventable.",
explain:`
<p><b>Key words:</b></p>
<ul>
<li>A <b>repository</b> (repo) is a project folder whose history git tracks. The history lives in a hidden <code>.git</code> folder.</li>
<li>A <b>commit</b> is a snapshot of your files plus a message, an author and a unique ID (a <i>hash</i> like <code>3f2a9c1</code>).</li>
<li>A <b>remote</b> is a copy of the repo somewhere else, usually on GitHub, and is conventionally named <code>origin</code>.</li>
</ul>
<p><b>One-time setup:</b> install git (<a href="https://git-scm.com/downloads" target="_blank" rel="noopener">git-scm.com</a>), then tell it who you are:</p>
<pre class="code">git config --global user.name "Your Name"
git config --global user.email "you@example.com"</pre>
<p><b>The everyday loop:</b></p>
<pre class="code">git init                      # start tracking this folder (once)   - or: git clone URL
git status                    # what changed? (run this constantly)
git add app.py prompts/       # stage specific files      (git add . = everything not ignored)
git commit -m "Add grounding rules to RAG prompt"
git push                      # upload commits to GitHub
git pull                      # download + merge others' commits</pre>
<ul>
<li><code>git status</code> is your dashboard: it shows untracked, modified and staged files.</li>
<li><code>git diff</code> shows exact line changes before you stage them. <code>git diff --staged</code> shows what you're about to commit.</li>
<li><code>git log --oneline</code> lists history compactly.</li>
<li><b>Good commit messages</b> say what changed and why, in the imperative: “Limit agent to 8 steps”, not “stuff”. Commit small, logical steps.</li>
<li><code>git restore file.py</code> throws away uncommitted changes to a file (carefully!). <code>git restore --staged file.py</code> unstages it.</li>
</ul>
<p><b>Cloning and GitHub.</b> <code>git clone https://github.com/user/repo.git</code> downloads a repo with its full history, which is how you get course code and open-source tools. To publish your own project: create an empty repo on GitHub (or run <code>gh repo create</code> with the GitHub CLI), then <code>git remote add origin URL</code> and <code>git push -u origin main</code>. For authentication, GitHub no longer accepts account passwords for git over HTTPS. Use the GitHub CLI (<code>gh auth login</code>), Git Credential Manager (bundled with Git for Windows), or SSH keys.</p>
<p><b>.gitignore</b> is a file listing patterns git should never track:</p>
<pre class="code">.env
.venv/
__pycache__/
*.log
data/raw/
*.ckpt</pre>
<p>A pattern like <code>*.log</code> matches file names anywhere. A trailing <code>/</code> means “this folder (and everything inside)”. A leading <code>/</code> anchors the pattern to the repo root. <code>!keep.log</code> re-includes a file. GitHub keeps a ready-made <a href="https://github.com/github/gitignore/blob/main/Python.gitignore" target="_blank" rel="noopener">Python .gitignore</a>. Create your .gitignore <b>before the first commit</b>: once a file is tracked, adding it to .gitignore doesn't untrack it.</p>
<div class="callout"><b>If you ever commit a key:</b> (1) <b>revoke it immediately</b> in the provider's console and create a new one, because deleting the file doesn't remove it from history and bots scan GitHub within minutes; (2) <code>git rm --cached .env</code>, add <code>.env</code> to .gitignore, and commit; (3) for a public repo, consider rewriting history or recreating the repo. GitHub's <b>secret scanning / push protection</b> can block some known key formats, but don't rely on it.</div>`,
concepts:[["Repository","A project folder whose history git tracks (inside the hidden .git folder)."],["Commit","A saved snapshot with a message and a unique hash."],["Staging area","Where you gather changes (git add) before committing them."],["Remote / origin","A copy of the repo elsewhere (GitHub); push uploads, pull downloads."],["Clone","Download a repo and its full history: git clone URL."],[".gitignore","Patterns for files git must never track: .env, .venv/, logs, big data."]],
resources:[
 {t:"Pro Git book (free): Getting started, about version control",u:"https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control",type:"book"},
 {t:"Pro Git: Recording changes to the repository",u:"https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository",type:"book"},
 {t:"GitHub Docs: Ignoring files",u:"https://docs.github.com/en/get-started/git-basics/ignoring-files",type:"docs"},
 {t:"GitHub Docs: About secret scanning",u:"https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning",type:"docs"},
 {t:"MIT Missing Semester: Version control (git)",u:"https://missing.csail.mit.edu/2020/version-control/",type:"course"}
],
quiz:[
 {q:"What does <code>git add</code> do?",o:["Uploads to GitHub","Stages changes so the next commit includes them","Creates a repo","Deletes files"],a:1,e:"add = put it in the box; commit = seal the box; push = ship it."},
 {q:"You committed <code>.env</code> with a real key and pushed to a public repo. What's the FIRST thing to do?",o:["Delete the file and push again","Revoke/rotate the key in the provider console","Make the repo private later","Nothing"],a:1,e:"The key is already exposed and still in history. Revoke it first, then clean up."},
 {q:"You add <code>.env</code> to .gitignore, but git still shows changes to it. Why?",o:["gitignore is broken","It was already tracked; run git rm --cached .env to stop tracking it","You need to reboot","The pattern must be *.env"],a:1,e:".gitignore only affects untracked files."},
 {q:"Which is the best commit message?",o:["\"update\"","\"Limit agent loop to 8 steps to prevent runaway costs\"","\"asdf\"","\"final final v2\""],a:1,e:"Say what changed and why. Future you will thank you."},
 {q:"What does <code>git pull</code> do?",o:["Uploads your commits","Fetches commits from the remote and merges them into your branch","Deletes the remote","Stages files"],a:1,e:"pull = fetch + merge. push is the upload direction."}
],
exercise:{title:"Is it safe to commit? (.gitignore + secret scanner)",
task:`<p>Build two safety checks every AI project should have. They use a simplified .gitignore with four kinds of rule:</p>
<ul>
<li><code>*.log</code> or <code>.env</code> (no slash): match the <b>name of any part</b> of the path (use <code>fnmatch</code>).</li>
<li><code>.venv/</code> (trailing slash): match a <b>folder</b> with that name anywhere in the path. A file inside it is ignored, but a file called <code>.venv</code> isn't.</li>
<li><code>/build</code> (leading slash): match only from the repo root (the whole path, or the start of it).</li>
<li><code>!keep.log</code>: re-include matching paths. <b>The last matching rule wins.</b> Blank lines and <code>#</code> comments are skipped.</li>
</ul>
<p>Implement:</p>
<ol>
<li><code>is_ignored(path, patterns)</code>: True if the path is ignored. Paths look like <code>"src/app.py"</code>.</li>
<li><code>find_secrets(files)</code>: <code>files</code> maps path → text. Return a <b>sorted</b> list of paths whose text contains a likely secret: a Google-style key (<code>AIza</code> + 30 or more letters, digits, <code>_</code> or <code>-</code>), an OpenAI-style key (<code>sk-</code> + 20 or more of those characters), or a line like <code>SOMETHING_KEY = "value"</code> / <code>TOKEN=value</code> where the value is 16 or more of those characters.</li>
<li><code>danger_files(files, patterns)</code>: sorted paths that contain secrets <b>and</b> are not ignored, i.e. what would leak.</li>
</ol>`,
starter:py`import fnmatch
import re


def is_ignored(path, patterns):
    return False  # TODO


def find_secrets(files):
    return []  # TODO


def danger_files(files, patterns):
    return []  # TODO


GITIGNORE = [".env", ".venv/", "*.log", "# comment", "", "!keep.log", "/build"]
print(is_ignored(".env", GITIGNORE), is_ignored("src/app.py", GITIGNORE))
`,
solution:py`import fnmatch
import re


def _matches(path, pattern):
    parts = path.strip("/").split("/")
    if pattern.endswith("/"):                      # folder rule: any folder part (not the last = file name)
        name = pattern.rstrip("/").lstrip("/")
        return any(fnmatch.fnmatch(p, name) for p in parts[:-1])
    if pattern.startswith("/"):                    # anchored to the repo root
        pat = pattern[1:]
        return fnmatch.fnmatch(path, pat) or path.startswith(pat.rstrip("/") + "/")
    return any(fnmatch.fnmatch(p, pattern) for p in parts)


def is_ignored(path, patterns):
    ignored = False
    for raw in patterns:
        rule = raw.strip()
        if not rule or rule.startswith("#"):
            continue
        negate = rule.startswith("!")
        if negate:
            rule = rule[1:]
        if _matches(path, rule):
            ignored = not negate                   # last matching rule wins
    return ignored


SECRET_PATTERNS = [
    re.compile(r"AIza[0-9A-Za-z_\-]{30,}"),
    re.compile(r"sk-[0-9A-Za-z_\-]{20,}"),
    re.compile(r"(?im)^\s*(export\s+)?[A-Z0-9_]*(KEY|TOKEN|SECRET)\s*=\s*['\"]?[0-9A-Za-z_\-]{16,}"),
]


def find_secrets(files):
    return sorted(p for p, text in files.items() if any(rx.search(text) for rx in SECRET_PATTERNS))


def danger_files(files, patterns):
    return sorted(p for p in find_secrets(files) if not is_ignored(p, patterns))


GITIGNORE = [".env", ".venv/", "*.log", "# comment", "", "!keep.log", "/build"]
print(is_ignored(".env", GITIGNORE), is_ignored("src/app.py", GITIGNORE))
`,
tests:py`G = [".env", ".venv/", "*.log", "# comment", "", "!keep.log", "/build", "__pycache__/"]
cases = {
    ".env": True, "config/.env": True, "src/app.py": False, "debug.log": True, "logs/2026/run.log": True,
    "keep.log": False, "logs/keep.log": False, ".venv/lib/site.py": True, "tools/.venv/x": True,
    "build": True, "build/out.js": True, "src/build/out.js": False, "src/__pycache__/a.pyc": True,
    ".env.example": False, "README.md": False,
}
for path, want in cases.items():
    got = is_ignored(path, G)
    assert got == want, f"is_ignored({path!r}) should be {want}, got {got}"
assert is_ignored(".venv", [".venv/"]) is False, "A trailing-slash rule only matches folders, not a file named .venv"
assert is_ignored("a.log", ["*.log", "!a.log", "*.log"]) is True, "The LAST matching rule wins"
FILES = {
    ".env": "GEMINI_API_KEY=AIzaSyA1b2C3d4E5f6G7h8I9j0KlMnOpQrStUvW",
    "config.py": 'OPENAI_API_KEY = "sk-proj-abcdefghijklmnopqrstuvwxyz123456"',
    "settings.py": "API_TOKEN = 'abcd1234efgh5678ijkl'",
    "app.py": 'key = os.environ["GEMINI_API_KEY"]\nprint("hello")',
    ".env.example": "GEMINI_API_KEY=your_key_here",
    "notes.md": "Remember: never commit sk- keys!",
    "debug.log": "sent header sk-abcdefghijklmnopqrstuvwx",
}
assert find_secrets(FILES) == [".env", "config.py", "debug.log", "settings.py"], "find_secrets gave " + repr(find_secrets(FILES))
assert danger_files(FILES, G) == ["config.py", "settings.py"], "danger_files gave " + repr(danger_files(FILES, G))
print("✅ All checks passed!")
`},
project:{title:"Put your project on GitHub, safely",
desc:"Take one of your earlier projects (e.g. the notes app from P4) and publish it to GitHub the right way: .gitignore first, a clear first commit, a remote, a push, then a change-commit-push cycle and a pull. Finish by rehearsing the “I committed a key” recovery on a throwaway file.",
steps:["Install git, set your name and email, and sign in to GitHub (the GitHub CLI's <code>gh auth login</code> is easiest).","In your project folder, create .gitignore <b>first</b>, then init, add, check <code>git status</code> (.env must NOT be listed) and commit.","Create the GitHub repo and push. Refresh the GitHub page and confirm .env isn't there.","Edit README.md on github.com, then <code>git pull</code> locally. Edit locally, commit and push. Watch both directions work."],
code:{bash:py`# One-time setup
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
gh auth login                     # GitHub CLI: easiest way to authenticate (https://cli.github.com)

# In your project folder
cd notes-app
printf ".env\n.venv/\n__pycache__/\n*.log\n" > .gitignore     # BEFORE the first commit
git init -b main
git status                        # .env and .venv must NOT appear
git add .
git status                        # double-check what is staged
git commit -m "Initial commit: notes app with JSON storage"

# Publish (pick one)
gh repo create notes-app --private --source=. --push
# ...or create an empty repo on github.com, then:
# git remote add origin https://github.com/YOU/notes-app.git
# git push -u origin main

# Daily loop
git pull                          # get changes made elsewhere
echo "## Usage" >> README.md
git add README.md
git commit -m "Document usage in README"
git push
git log --oneline

# Oops: a tracked file that should be ignored
git rm --cached secrets.txt       # stop tracking (keeps your local copy)
echo "secrets.txt" >> .gitignore
git commit -am "Stop tracking secrets.txt"
# If it contained a real key: REVOKE the key at the provider first!
`,
powershell:py`# One-time setup
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
gh auth login                     # or let Git Credential Manager prompt you on first push

# In your project folder
cd notes-app
Set-Content .gitignore ".env", ".venv/", "__pycache__/", "*.log"   # BEFORE the first commit
git init -b main
git status                        # .env and .venv must NOT appear
git add .
git commit -m "Initial commit: notes app with JSON storage"

# Publish (pick one)
gh repo create notes-app --private --source=. --push
# git remote add origin https://github.com/YOU/notes-app.git
# git push -u origin main

# Daily loop
git pull
Add-Content README.md "## Usage"
git add README.md
git commit -m "Document usage in README"
git push
git log --oneline

# Oops: a tracked file that should be ignored
git rm --cached secrets.txt
Add-Content .gitignore "secrets.txt"
git commit -am "Stop tracking secrets.txt"
`}}
});
})();
