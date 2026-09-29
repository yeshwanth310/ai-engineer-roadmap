(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
/* ================= TOOLKIT P4 ================= */
W.push({
id:104, phase:0, title:"Files, JSON, modules, pip & virtual environments",
skip:"you can read and write JSON files, split code into modules with imports, and create a venv and install packages with pip.",
goal:"Save and load data (plain text, JSON, JSON Lines), split your code into modules you can import, and install libraries safely inside a virtual environment. That's the everyday plumbing of every AI project.",
plan:[["30m","Read & try"],["10m","Quiz"],["40m","Exercise"],["40m","Mini project"]],
analogy:"<b>JSON</b> is a universal shipping box: any language can pack and unpack it, and LLM APIs send almost everything in it. A <b>module</b> is a drawer in your toolbox: <code>import</code> opens the drawer and takes out the tools. <b>pip</b> is the hardware shop where you get new tools. A <b>virtual environment</b> is a separate toolbox for each project, so the drill you bought for project A (version 1) doesn't clash with the one project B needs (version 2).",
why:"You'll constantly save prompts, results, eval datasets and chat logs to files. JSON and JSON Lines are the standard formats for this. Every mini project in this roadmap starts with “create a venv and pip install ...”, so understanding what that actually does prevents a whole class of ‘it works on my machine’ problems.",
explain:`
<p><b>Reading and writing files.</b> Always use <code>with</code>, which closes the file for you even if an error happens:</p>
<pre class="code">with open("notes.txt", "w", encoding="utf-8") as f:   # "w" = write (replaces), "a" = append
    f.write("first line\n")
with open("notes.txt", encoding="utf-8") as f:        # default mode is read
    text = f.read()</pre>
<p><code>from pathlib import Path</code> gives a friendlier way to do the same: <code>Path("notes.txt").read_text(encoding="utf-8")</code>, <code>Path("data").mkdir(exist_ok=True)</code> and <code>Path("notes.txt").exists()</code>. Always pass <code>encoding="utf-8"</code>, because LLM output often contains emoji and non-English text.</p>
<p><b>JSON</b> looks almost exactly like Python dicts and lists. The <code>json</code> module converts between the two:</p>
<ul>
<li><code>json.dumps(obj, indent=2)</code> turns an object into text and <code>json.loads(text)</code> turns text back into an object. The <b>s</b> means “string”.</li>
<li><code>json.dump(obj, f)</code> and <code>json.load(f)</code> do the same with files directly.</li>
<li>JSON uses <code>true/false/null</code> where Python uses <code>True/False/None</code>, and JSON keys are always strings. Bad JSON raises <code>json.JSONDecodeError</code>, a kind of ValueError, which is why Week 7 is all about defensive parsing.</li>
<li><b>JSON Lines</b> (<code>.jsonl</code>) is one JSON object per line. It's the standard format for datasets, eval sets and logs, because you can add a line without rewriting the whole file.</li>
</ul>
<p><b>Modules and imports.</b> Any <code>.py</code> file is a module. If <code>helpers.py</code> defines <code>clean_prompt</code>, then another file in the same folder can use <code>from helpers import clean_prompt</code>. Python also ships with a huge <b>standard library</b> (<code>json</code>, <code>pathlib</code>, <code>math</code>, <code>datetime</code>, <code>asyncio</code>, and more). The line <code>if __name__ == "__main__":</code> means “only run this when the file is run directly, not when it's imported”.</p>
<p><b>pip and virtual environments.</b> Extra libraries such as <code>google-genai</code> and <code>requests</code> come from PyPI and are installed with <code>pip install name</code>. To keep each project's libraries separate:</p>
<ol>
<li>Create a venv once per project: <code>python -m venv .venv</code>.</li>
<li>Activate it in every new terminal: <code>source .venv/bin/activate</code> (macOS/Linux) or <code>.venv\\Scripts\\Activate.ps1</code> (Windows PowerShell; see Toolkit P9). Your prompt then shows <code>(.venv)</code>.</li>
<li>Install packages: <code>pip install google-genai</code>.</li>
<li>Record them: <code>pip freeze > requirements.txt</code>. Later, or on another computer, run <code>pip install -r requirements.txt</code>.</li>
</ol>
<div class="callout"><b>“ModuleNotFoundError” but I installed it!</b> Nine times out of ten, the venv isn't activated, or your editor is using a different Python. Check with <code>python -c "import sys; print(sys.executable)"</code>. The path should point inside <code>.venv</code>.</div>`,
concepts:[["with open(...)","Opens a file and closes it automatically. Modes: r (read), w (write), a (append)."],["JSON","A text format for dicts and lists; json.dumps/loads convert to and from Python objects."],["JSON Lines","One JSON object per line (.jsonl); the usual format for datasets and logs."],["Module / import","A .py file whose functions you reuse with import or from x import y."],["pip","Installs packages from PyPI: pip install requests."],["Virtual environment","A per-project folder (.venv) of installed packages, activated in each terminal."]],
resources:[
 {t:"The Python Tutorial: Reading and writing files (and JSON)",u:"https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files",type:"docs"},
 {t:"The Python Tutorial: Modules",u:"https://docs.python.org/3/tutorial/modules.html",type:"docs"},
 {t:"The Python Tutorial: Virtual environments and packages",u:"https://docs.python.org/3/tutorial/venv.html",type:"docs"},
 {t:"Python Packaging User Guide: Installing packages",u:"https://packaging.python.org/en/latest/tutorials/installing-packages/",type:"docs"}
],
quiz:[
 {q:"Why use <code>with open(...) as f:</code>?",o:["It's faster","It closes the file automatically, even if an error happens","It's required for JSON","It encrypts the file"],a:1,e:"The with block guarantees clean-up."},
 {q:"What does <code>json.loads('{\"ok\": true}')</code> return?",o:["The string unchanged","{'ok': True} (a Python dict)","An error, because true must be True","A list"],a:1,e:"loads turns JSON text into Python objects; JSON true becomes Python True."},
 {q:"Why are eval datasets often stored as JSON Lines?",o:["It's smaller than CSV","One object per line, so you can append and stream records easily","Only Python can read it","It's encrypted"],a:1,e:"Each line stands alone, which makes appending and processing big files easy."},
 {q:"You pip-installed a package but get ModuleNotFoundError. Most likely cause?",o:["The package is broken","Your virtual environment isn't activated (or the editor uses another Python)","JSON error","You need to reboot"],a:1,e:"Check which Python is running, and activate .venv."},
 {q:"What is <code>requirements.txt</code> for?",o:["Storing API keys","Listing the project's packages so anyone can recreate the environment","Python syntax rules","Git settings"],a:1,e:"pip freeze > requirements.txt, then pip install -r requirements.txt elsewhere."}
],
exercise:{title:"A tiny JSON notes store",
task:`<p>The browser gives Python a small private file system, so real file code works here. Implement:</p>
<ul>
<li><code>save_notes(path, notes)</code>: write the list of dicts to <code>path</code> as JSON (use <code>indent=2</code>).</li>
<li><code>load_notes(path)</code>: return the list from the file. If the file doesn't exist, return <code>[]</code>. If it contains invalid JSON, <code>raise ValueError(f"{path} is not valid JSON")</code>.</li>
<li><code>add_note(path, text, tags=None)</code>: load, append <code>{"id": next_id, "text": text, "tags": tags or []}</code> where next_id is one more than the biggest existing id (or 1), save, and return the new note.</li>
<li><code>read_jsonl(path)</code>: return a list with one dict per non-blank line of a JSON Lines file.</li>
</ul>`,
starter:py`import json
from pathlib import Path


def save_notes(path, notes):
    pass  # TODO: write JSON


def load_notes(path):
    # TODO: return [] if missing; raise ValueError on bad JSON
    return None


def add_note(path, text, tags=None):
    pass  # TODO


def read_jsonl(path):
    return []  # TODO


add_note("notes.json", "Tokens are ~4 characters", ["llm"])
print(load_notes("notes.json"))
`,
solution:py`import json
from pathlib import Path


def save_notes(path, notes):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(notes, f, indent=2, ensure_ascii=False)


def load_notes(path):
    p = Path(path)
    if not p.exists():
        return []
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        raise ValueError(f"{path} is not valid JSON")


def add_note(path, text, tags=None):
    notes = load_notes(path)
    next_id = max((n["id"] for n in notes), default=0) + 1
    note = {"id": next_id, "text": text, "tags": tags or []}
    notes.append(note)
    save_notes(path, notes)
    return note


def read_jsonl(path):
    rows = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.strip():
                rows.append(json.loads(line))
    return rows


add_note("notes.json", "Tokens are ~4 characters", ["llm"])
print(load_notes("notes.json"))
`,
tests:py`import os, json
for f in ["t_notes.json", "t_bad.json", "t_data.jsonl"]:
    if os.path.exists(f): os.remove(f)
assert load_notes("t_notes.json") == [], "A missing file should give []"
n1 = add_note("t_notes.json", "first", ["a"])
n2 = add_note("t_notes.json", "second")
assert n1 == {"id": 1, "text": "first", "tags": ["a"]}, "First note wrong: " + repr(n1)
assert n2 == {"id": 2, "text": "second", "tags": []}, "Second note should get id 2 and tags []: " + repr(n2)
raw = open("t_notes.json", encoding="utf-8").read()
assert json.loads(raw) == [n1, n2], "The file should contain both notes as JSON"
assert "\n  " in raw, "Use indent=2 so the file is readable"
save_notes("t_notes.json", [{"id": 7, "text": "x", "tags": []}])
assert add_note("t_notes.json", "y")["id"] == 8, "next id = biggest id + 1"
open("t_bad.json", "w").write("{not json")
try:
    load_notes("t_bad.json")
    assert False, "Invalid JSON should raise ValueError"
except ValueError as e:
    assert "not valid JSON" in str(e), "Message should say the file is not valid JSON"
open("t_data.jsonl", "w").write('{"q": "hi", "a": "hello"}\n\n{"q": "2+2", "a": "4"}\n')
assert read_jsonl("t_data.jsonl") == [{"q": "hi", "a": "hello"}, {"q": "2+2", "a": "4"}], "read_jsonl should skip blank lines"
print("✅ All checks passed!")
`},
project:{title:"A notes tool split into modules, in its own venv",
desc:"Turn today's functions into a small real project: a module with the storage code, a main script that imports it, its own virtual environment, and a requirements file. This is the layout you'll reuse for every later project.",
steps:["Create a folder <code>notes-app</code>, make a venv inside it, and activate it (see the bash / PowerShell tabs).","Put <code>load_notes</code>, <code>save_notes</code> and <code>add_note</code> in <code>notes_store.py</code>.","Write <code>main.py</code>, which imports them. <code>python main.py add \"text\" tag1 tag2</code> adds a note and <code>python main.py list</code> prints them.","<code>pip install python-dotenv</code> (you'll need it in P7), then run <code>pip freeze > requirements.txt</code> and look at the file."],
code:{python:py`# main.py - usage:  python main.py add "Tokens are ~4 chars" llm basics
#                   python main.py list
import sys
from notes_store import add_note, load_notes   # our own module (notes_store.py)

PATH = "notes.json"

def main(args):
    if len(args) >= 2 and args[0] == "add":
        note = add_note(PATH, args[1], args[2:])
        print(f"Added note #{note['id']}")
    elif args[:1] == ["list"]:
        for n in load_notes(PATH):
            tags = ", ".join(n["tags"]) or "-"
            print(f"#{n['id']:<3} {n['text']}  [{tags}]")
    else:
        print('usage: python main.py add "text" [tags...]   |   python main.py list')

if __name__ == "__main__":        # only runs when executed directly, not when imported
    main(sys.argv[1:])
`,
bash:py`# macOS / Linux terminal
mkdir notes-app && cd notes-app
python3 -m venv .venv              # create the virtual environment (once)
source .venv/bin/activate          # activate it (every new terminal)
which python                       # should point into .venv
pip install python-dotenv
pip freeze > requirements.txt
cat requirements.txt
python main.py add "Tokens are ~4 characters" llm
python main.py list
deactivate                         # leave the venv when done
`,
powershell:py`# Windows PowerShell
mkdir notes-app; cd notes-app
python -m venv .venv                     # create the virtual environment (once)
.\.venv\Scripts\Activate.ps1             # activate it (see Toolkit P9 if scripts are blocked)
Get-Command python                       # Source should point into .venv
pip install python-dotenv
pip freeze > requirements.txt
Get-Content requirements.txt
python main.py add "Tokens are ~4 characters" llm
python main.py list
deactivate
`}}
});
})();
