(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
/* ================= TOOLKIT P9 ================= */
W.push({
id:109, phase:0, title:"Shell I: PowerShell basics (Windows)",
skip:"you navigate folders, set $env: variables, activate a venv and fix ‘running scripts is disabled’ in PowerShell without help.",
goal:"Feel at home in the Windows terminal: move around folders, manage files, set environment variables like <code>$env:GEMINI_API_KEY</code>, run Python and pip, activate a virtual environment, and understand (and safely fix) the execution-policy error.",
plan:[["30m","Read & try in your terminal"],["10m","Quiz"],["40m","Exercise"],["40m","Mini project"]],
analogy:"The graphical desktop is a restaurant menu with pictures: easy, but you can only order what's shown. The <b>terminal</b> is talking directly to the chef. You type exactly what you want (“make five folders, copy these files, run this program with these settings”) and it happens instantly and repeatably. <b>PowerShell</b> is the language this chef speaks on Windows. Its commands are polite verb-noun phrases like <code>Get-ChildItem</code> (“get the things in here”).",
why:"Every AI tool is installed, configured and run from a terminal: pip, venvs, API keys, git, servers, Docker. Most setup failures beginners hit on Windows (“running scripts is disabled”, “python is not recognized”, “my key isn't found”) are PowerShell issues you'll be able to fix in seconds after this session.",
explain:`
<p><b>Getting started.</b> Open <b>Windows Terminal</b> (or search the Start menu for “PowerShell”). It shows a <b>prompt</b> like <code>PS C:\\Users\\you&gt;</code>: that's your current folder, waiting for a command. Press <b>Tab</b> to auto-complete names, use the <b>↑</b> arrow for previous commands, and press <b>Ctrl+C</b> to stop a running program. PowerShell is not case-sensitive.</p>
<p><b>Cmdlets and aliases.</b> PowerShell commands are <i>Verb-Noun</i>: <code>Get-Location</code>, <code>Set-Location</code>, <code>Get-ChildItem</code>, <code>New-Item</code>, <code>Remove-Item</code>. The familiar short names work too, as aliases: <code>pwd</code>, <code>cd</code>, <code>ls</code>/<code>dir</code>, <code>cat</code>, <code>mkdir</code>, <code>cp</code>, <code>mv</code>, <code>rm</code>. <code>Get-Help Get-ChildItem -Examples</code> shows examples for any command.</p>
<p><b>Paths:</b> <code>C:\\Users\\you\\projects</code> is an absolute path. <code>.</code> means “this folder”, <code>..</code> the parent, and <code>~</code> your home folder. Put paths with spaces in quotes: <code>cd "My Projects"</code>.</p>
<p><b>Files:</b> <code>New-Item notes.txt</code> (an empty file), <code>mkdir data</code>, <code>Copy-Item a.txt b.txt</code>, <code>Move-Item a.txt old\\</code>, and <code>Get-Content log.txt -Tail 20</code> (the last 20 lines). <code>Remove-Item folder -Recurse</code> deletes a folder <b>permanently</b>. There's no Recycle Bin here, so double-check first. Adding <code>-WhatIf</code> to a command shows what it <i>would</i> do.</p>
<p><b>Environment variables</b> live under <code>$env:</code>:</p>
<ul>
<li><code>$env:GEMINI_API_KEY = "your-key"</code> sets it for <b>this terminal window only</b>. It's gone when you close it.</li>
<li><code>$env:GEMINI_API_KEY</code> prints it. <code>Get-ChildItem env:</code> lists them all, and <code>Remove-Item env:GEMINI_API_KEY</code> removes it.</li>
<li>To make it permanent for your user: <code>[Environment]::SetEnvironmentVariable("GEMINI_API_KEY", "your-key", "User")</code>, then open a new terminal. For projects, a <code>.env</code> file (P7) is usually simpler.</li>
</ul>
<p><b>Python, pip and venvs on Windows:</b></p>
<ul>
<li>Run <code>python --version</code>. If it says “not recognized”, reinstall Python with “Add python.exe to PATH” ticked, or use the launcher: <code>py --version</code>. Typing <code>python</code> might open the Microsoft Store instead; that's the Store's placeholder, and you can turn it off under Settings → App execution aliases.</li>
<li><code>python -m venv .venv</code> creates a venv. <code>.\\.venv\\Scripts\\Activate.ps1</code> activates it, and your prompt then starts with <code>(.venv)</code>. <code>deactivate</code> leaves it.</li>
<li><code>python -m pip install requests</code> installs into whichever Python is active. The <code>python -m pip</code> form avoids “wrong pip” confusion.</li>
</ul>
<p><b>“Running scripts is disabled on this system.”</b> Windows blocks <code>.ps1</code> scripts (like Activate.ps1) by default. That setting is called the <b>execution policy</b>, and it's a safety net against accidentally running downloaded scripts. The standard, safe fix for your own account:</p>
<pre class="code">Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser</pre>
<p><i>RemoteSigned</i> means scripts you wrote yourself can run, but scripts downloaded from the internet must be signed. <code>-Scope CurrentUser</code> changes it for you only, with no admin rights needed. Avoid <code>Unrestricted</code> or <code>Bypass</code> as permanent settings. <code>Get-ExecutionPolicy -List</code> shows the current settings.</p>
<p><b>Pipelines pass objects.</b> In PowerShell, <code>|</code> hands whole objects (not just text) to the next command: <code>Get-ChildItem | Sort-Object Length -Descending | Select-Object -First 5</code> lists the 5 biggest files. <code>Select-String "error" log.txt</code> works like grep. <code>Invoke-RestMethod</code> calls web APIs and turns the JSON into objects. In Windows PowerShell 5.1, <code>curl</code> is an alias for Invoke-WebRequest; type <code>curl.exe</code> for the real curl.</p>
<p>See the <a href="#/cheatsheet">PowerShell ↔ bash cheat sheet</a> for a side-by-side reference.</p>`,
concepts:[["Terminal / shell","A text window where you type commands; PowerShell is the shell on Windows."],["Cmdlet & alias","Verb-Noun commands (Get-ChildItem) plus short aliases (ls, cd, cat)."],["Path","Where a file lives: absolute (C:\\...) or relative (., .., ~)."],["$env:NAME","A PowerShell environment variable for the current session."],["Execution policy","A Windows safety setting for scripts; RemoteSigned + CurrentUser is the usual fix."],["Pipeline","cmd1 | cmd2: pass one command's output (objects) to the next."]],
resources:[
 {t:"Microsoft Learn: What is PowerShell?",u:"https://learn.microsoft.com/en-us/powershell/scripting/overview",type:"docs"},
 {t:"Microsoft Learn: about_Execution_Policies",u:"https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies",type:"docs"},
 {t:"Microsoft Learn: about_Environment_Variables",u:"https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables",type:"docs"},
 {t:"Microsoft Learn: PowerShell 101, getting started",u:"https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/01-getting-started",type:"docs"},
 {t:"Python docs: Using Python on Windows",u:"https://docs.python.org/3/using/windows.html",type:"docs"}
],
quiz:[
 {q:"You set <code>$env:GEMINI_API_KEY = \"abc\"</code>, close the terminal and open a new one. Is the key still set?",o:["Yes, forever","No, $env: changes last only for that session","Only after a reboot","Only in admin mode"],a:1,e:"Session-only. Use a .env file or SetEnvironmentVariable(..., \"User\") for persistence."},
 {q:"Activate.ps1 fails with “running scripts is disabled on this system”. The standard safe fix?",o:["Set-ExecutionPolicy Unrestricted -Scope LocalMachine","Set-ExecutionPolicy RemoteSigned -Scope CurrentUser","Reinstall Windows","Rename the file to .txt"],a:1,e:"RemoteSigned for your user only lets your own scripts run while still guarding downloaded ones."},
 {q:"Which command lists files, including hidden ones?",o:["Get-Location","Get-ChildItem -Force","Set-Location -Force","Get-Content"],a:1,e:"Get-ChildItem (alias ls/dir) with -Force shows hidden items like .env and .venv."},
 {q:"Why prefer <code>python -m pip install x</code> over <code>pip install x</code>?",o:["It's faster","It guarantees pip installs into the same Python you'll run","pip is deprecated","It skips the venv"],a:1,e:"It avoids having several Pythons with the wrong pip."},
 {q:"What does <code>Remove-Item build -Recurse</code> do?",o:["Moves build to the Recycle Bin","Permanently deletes the folder and everything inside","Lists the folder","Renames it"],a:1,e:"There's no Recycle Bin in the terminal. Use -WhatIf first if unsure."}
],
exercise:{title:"PowerShell command matcher",
task:`<p>Python can't run PowerShell here, so this exercise checks your <b>commands as text</b>. Fill in the <code>ANSWERS</code> dictionary with the PowerShell command for each task. The checker accepts common variations (aliases, quote styles, extra spaces), and tells you which tasks are wrong, with a hint.</p>
<ol>
<li>Show which folder you are in.</li>
<li>List everything in the current folder, including hidden items.</li>
<li>Go into the subfolder <code>projects</code>.</li>
<li>Create a new folder called <code>notes-app</code>.</li>
<li>Set the environment variable <code>GEMINI_API_KEY</code> to <code>abc123</code> for this session.</li>
<li>Print the value of <code>GEMINI_API_KEY</code>.</li>
<li>Activate the virtual environment in the <code>.venv</code> folder.</li>
<li>Allow your own scripts to run, for your user only (the safe execution-policy fix).</li>
<li>Show the last 5 lines of <code>log.txt</code>.</li>
<li>Install the <code>requests</code> package using the active Python's pip.</li>
</ol>`,
starter:py`ANSWERS = {
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
    7: "",
    8: "",
    9: "",
    10: "",
}

for n, cmd in ANSWERS.items():
    print(n, cmd or "(empty)")
`,
solution:py`ANSWERS = {
    1: "Get-Location",
    2: "Get-ChildItem -Force",
    3: "cd projects",
    4: "mkdir notes-app",
    5: '$env:GEMINI_API_KEY = "abc123"',
    6: "$env:GEMINI_API_KEY",
    7: r".\.venv\Scripts\Activate.ps1",
    8: "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser",
    9: "Get-Content log.txt -Tail 5",
    10: "python -m pip install requests",
}

for n, cmd in ANSWERS.items():
    print(n, cmd or "(empty)")
`,
tests:py`import re
def norm(s):
    return " ".join(str(s).strip().lower().replace("/", "\\").split())
RULES = {
    1: ([r"^(get-location|pwd|gl)$"], "Get-Location (alias pwd)"),
    2: ([r"^(get-childitem|gci|ls|dir)( \.)? -force( \.)?$", r"^(get-childitem|gci|ls|dir) -force$"], "Get-ChildItem with the -Force switch"),
    3: ([r"^(cd|set-location|sl|chdir) (\.\\)?[\"']?projects[\"']?\\?$", r"^set-location -path (\.\\)?[\"']?projects[\"']?$"], "cd projects (or Set-Location projects)"),
    4: ([r"^(mkdir|md) [\"']?notes-app[\"']?$", r"^new-item (-itemtype|-type) directory (-name |-path )?[\"']?notes-app[\"']?$", r"^new-item (-name |-path )?[\"']?notes-app[\"']? (-itemtype|-type) directory$"], "mkdir notes-app (or New-Item -ItemType Directory notes-app)"),
    5: ([r"^\$env:gemini_api_key ?= ?([\"'])abc123\1$"], "$env:GEMINI_API_KEY = \"abc123\" (the value needs quotes)"),
    6: ([r"^(echo |write-output |write-host )?\$env:gemini_api_key$", r"^get-childitem env:gemini_api_key$"], "just type $env:GEMINI_API_KEY"),
    7: ([r"^(& )?(\.\\)?\.venv\\scripts\\activate(\.ps1)?$"], ".\\.venv\\Scripts\\Activate.ps1"),
    8: ([r"^set-executionpolicy( -executionpolicy)? remotesigned -scope currentuser$", r"^set-executionpolicy -scope currentuser( -executionpolicy)? remotesigned$"], "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"),
    9: ([r"^(get-content|gc|cat|type) (\.\\)?log\.txt -tail 5$", r"^(get-content|gc|cat|type) -tail 5 (\.\\)?log\.txt$", r"^(get-content|gc|cat|type) (-path )?(\.\\)?log\.txt -(tail|last) 5$"], "Get-Content log.txt -Tail 5"),
    10: ([r"^(python|py|python3) -m pip install requests$", r"^pip3? install requests$"], "python -m pip install requests"),
}
wrong = []
for n, (patterns, hint) in RULES.items():
    got = norm(ANSWERS.get(n, ""))
    if not any(re.match(p, got) for p in patterns):
        wrong.append(f"  task {n}: got {ANSWERS.get(n, '')!r} - hint: {hint}")
    else:
        print(f"✓ task {n}")
assert not wrong, f"{len(wrong)} task(s) not matched yet:\n" + "\n".join(wrong)
print("✅ All checks passed!")
`},
project:{title:"Set up an AI project from PowerShell, start to finish",
desc:"Do the whole setup routine by hand in PowerShell, once, so it becomes muscle memory: project folder, venv, execution policy (if needed), packages, a .env file, and a test run. The same routine starts every project in this roadmap.",
steps:["Open Windows Terminal (PowerShell) and follow the script line by line, reading the comment above each command before running it.","If Activate.ps1 is blocked, run the execution-policy command once, then activate again.","Create <code>.env</code> and <code>.gitignore</code> from the terminal, then run <code>hello.py</code> from the Setup page.","Try a pipeline: list the 5 biggest files in your Downloads folder."],
code:{powershell:py`# 1. A home for your projects
cd ~
mkdir ai-projects -Force; cd ai-projects
mkdir hello-llm; cd hello-llm
Get-Location

# 2. Virtual environment
python --version                          # or: py --version
python -m venv .venv
.\.venv\Scripts\Activate.ps1              # prompt should now start with (.venv)
# If blocked ("running scripts is disabled"), run this ONCE, then activate again:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. Packages
python -m pip install --upgrade pip
python -m pip install google-genai python-dotenv
python -m pip freeze > requirements.txt

# 4. Secrets: .env for the key, .gitignore so git never uploads it
Set-Content .env 'GEMINI_API_KEY=paste-your-key-here'
Set-Content .gitignore ".env", ".venv/", "__pycache__/"
Get-Content .gitignore
notepad .env                              # paste your real key, save, close

# 5. Session-only variable (alternative to .env)
$env:GEMINI_API_KEY = "paste-your-key-here"
$env:GEMINI_API_KEY

# 6. Run your first script (copy hello.py from the Setup page)
python hello.py

# 7. Bonus pipeline: 5 biggest files in Downloads
Get-ChildItem ~\Downloads -File | Sort-Object Length -Descending | Select-Object -First 5 Name, Length
`}}
});
})();
