/* PowerShell vs bash side-by-side. [task, PowerShell, bash] grouped by section. */
window.CHEATSHEET = [
["Navigation", [
 ["Where am I?", "Get-Location   (pwd)", "pwd"],
 ["List files (incl. hidden)", "Get-ChildItem -Force   (ls -Force)", "ls -la"],
 ["Change folder / go up / home", "cd folder · cd .. · cd ~", "cd folder · cd .. · cd ~"],
 ["Clear the screen", "Clear-Host   (cls)", "clear   (Ctrl+L)"],
 ["Help for a command", "Get-Help Get-ChildItem -Examples", "man ls · ls --help · tldr ls"]
]],
["Files & folders", [
 ["Make a folder (nested)", "mkdir data\\raw   (New-Item -ItemType Directory)", "mkdir -p data/raw"],
 ["Create an empty file", "New-Item notes.txt", "touch notes.txt"],
 ["Copy / copy a folder", "Copy-Item a.txt b.txt · Copy-Item src dst -Recurse", "cp a.txt b.txt · cp -r src dst"],
 ["Move / rename", "Move-Item old.txt new.txt", "mv old.txt new.txt"],
 ["Delete a file / folder (permanent!)", "Remove-Item f.txt · Remove-Item dir -Recurse", "rm f.txt · rm -r dir"],
 ["Dry run before deleting", "Remove-Item dir -Recurse -WhatIf", "ls dir   (look first!)"]
]],
["Reading & searching", [
 ["Print a file", "Get-Content f.txt   (cat)", "cat f.txt"],
 ["Scroll through a file", "Get-Content f.txt | more", "less f.txt"],
 ["First / last 20 lines", "Get-Content f.txt -TotalCount 20 · -Tail 20", "head -n 20 f.txt · tail -n 20 f.txt"],
 ["Follow a growing log", "Get-Content app.log -Wait -Tail 20", "tail -f app.log"],
 ["Search text in files", "Select-String \"error\" *.log", "grep -n \"error\" *.log"],
 ["Search a whole folder", "Get-ChildItem -Recurse | Select-String \"API_KEY\"", "grep -rn \"API_KEY\" ."],
 ["Find files by name", "Get-ChildItem -Recurse -Filter *.py", "find . -name \"*.py\""],
 ["Count lines", "(Get-Content data.jsonl).Count", "wc -l data.jsonl"]
]],
["Pipes & redirection", [
 ["Pipe output onward", "cmd1 | cmd2   (passes objects)", "cmd1 | cmd2   (passes text)"],
 ["Write / append to a file", "cmd > out.txt · cmd >> out.txt", "cmd > out.txt · cmd >> out.txt"],
 ["Output + errors to a file", "cmd *> all.txt", "cmd > all.txt 2>&1"],
 ["Sort / first N", "Sort-Object Length -Descending | Select-Object -First 5", "sort -n | head -n 5"]
]],
["Environment variables", [
 ["Set for this session", "$env:GEMINI_API_KEY = \"abc123\"", "export GEMINI_API_KEY=abc123"],
 ["Print one", "$env:GEMINI_API_KEY", "echo $GEMINI_API_KEY"],
 ["List all", "Get-ChildItem env:", "env   (or printenv)"],
 ["Remove", "Remove-Item env:GEMINI_API_KEY", "unset GEMINI_API_KEY"],
 ["Make permanent (user)", "[Environment]::SetEnvironmentVariable(\"GEMINI_API_KEY\",\"abc123\",\"User\")", "echo 'export GEMINI_API_KEY=abc123' >> ~/.bashrc"]
]],
["Python, pip & venv", [
 ["Check Python", "python --version · py --version", "python3 --version"],
 ["Create a venv", "python -m venv .venv", "python3 -m venv .venv"],
 ["Activate / leave", ".\\.venv\\Scripts\\Activate.ps1 · deactivate", "source .venv/bin/activate · deactivate"],
 ["Install packages", "python -m pip install requests", "python -m pip install requests"],
 ["Save / restore packages", "pip freeze > requirements.txt · pip install -r requirements.txt", "pip freeze > requirements.txt · pip install -r requirements.txt"],
 ["Which Python is running?", "Get-Command python", "which python"],
 ["Scripts blocked?", "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser", "chmod +x run.sh   (then ./run.sh)"]
]],
["Web & APIs", [
 ["Call a JSON API", "Invoke-RestMethod https://api.github.com/users/octocat", "curl -s https://api.github.com/users/octocat"],
 ["Pick a field from JSON", "(Invoke-RestMethod URL).name", "curl -s URL | jq -r .name"],
 ["Download a file", "Invoke-WebRequest URL -OutFile data.zip", "wget URL   ·   curl -LO URL"],
 ["Real curl on Windows", "curl.exe -s URL", "curl -s URL"],
 ["GitHub API with your token", "Invoke-RestMethod https://api.github.com/repos/OWNER/REPO -Headers @{Authorization = \"Bearer $env:GITHUB_TOKEN\"; \"X-GitHub-Api-Version\" = \"2026-03-10\"}", "curl -s -H \"Authorization: Bearer $GITHUB_TOKEN\" -H \"X-GitHub-Api-Version: 2026-03-10\" https://api.github.com/repos/OWNER/REPO"],
 ["GitHub API via gh (any shell)", "gh api repos/OWNER/REPO/issues --paginate", "gh api repos/OWNER/REPO/issues --paginate"]
]],
["Processes & system", [
 ["Running processes", "Get-Process python", "ps aux | grep python"],
 ["Stop a process", "Stop-Process -Id 1234", "kill 1234   (kill -9 to force)"],
 ["Live CPU / memory", "Task Manager · Get-Process | Sort-Object CPU -Desc", "top · htop"],
 ["Disk space", "Get-PSDrive C", "df -h · du -sh *"],
 ["GPU status (NVIDIA)", "nvidia-smi", "nvidia-smi · watch -n 1 nvidia-smi"],
 ["Run in background", "Start-Job { python train.py }", "nohup python train.py > train.log 2>&1 &"]
]],
["Archives & remote", [
 ["Extract zip", "Expand-Archive data.zip -DestinationPath data", "unzip data.zip -d data"],
 ["Create zip", "Compress-Archive folder out.zip", "zip -r out.zip folder"],
 ["Extract .tar.gz", "tar -xzf data.tar.gz   (tar ships with Windows 10+)", "tar -xzf data.tar.gz"],
 ["Log in to a server", "ssh user@host", "ssh user@host"],
 ["Copy a file to a server", "scp file.txt user@host:~/", "scp file.txt user@host:~/"],
 ["Keep sessions alive", "ssh user@host, then run tmux on the server", "tmux new -s work · Ctrl+B D · tmux attach -t work"]
]]
];
