(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
/* ================= TOOLKIT P10 ================= */
W.push({
id:110, phase:0, title:"Shell II: Linux & bash commands for AI work",
skip:"you're comfortable with grep, pipes and redirection, export, curl + jq, ssh, and running long jobs with nohup or tmux.",
goal:"Learn the Linux/bash commands you'll actually use for LLM and AI work: moving around and managing files, searching logs, pipes and redirection, environment variables, calling APIs with curl and jq, working on remote GPU machines over ssh, keeping long jobs running, and checking disk, memory, processes and GPUs.",
plan:[["35m","Read & try"],["10m","Quiz"],["40m","Exercise"],["35m","Mini project"]],
analogy:"Bash commands are small, sharp kitchen tools: one peels (<code>grep</code> keeps matching lines), one slices (<code>head</code>), one counts (<code>wc</code>). The <b>pipe</b> <code>|</code> is a conveyor belt between them, so you build a whole food-processing line from simple tools: <code>cat log | grep error | wc -l</code>. <b>Redirection</b> <code>&gt;</code> is putting the finished dish into a container (a file) instead of onto the counter (the screen).",
why:"Cloud servers, GPU boxes, Docker containers, CI pipelines and most AI tooling run Linux. Even on Windows you'll meet bash in Git Bash, WSL, Colab (<code>!ls</code>), and every README's install instructions. Being able to read logs, call an API with curl, and keep a long job alive over ssh is everyday AI-engineering work.",
explain:`
<p><b>Where to practise:</b> macOS Terminal (zsh accepts nearly all of this), Linux, <b>WSL</b> on Windows (<code>wsl --install</code>), Git Bash, or a Google Colab cell with a leading <code>!</code>. Tab completion, ↑ for history and Ctrl+C to stop work the same as in PowerShell. Bash <b>is</b> case-sensitive.</p>
<h3>1. Moving around and managing files</h3>
<ul>
<li><code>pwd</code> (where am I?), <code>ls -la</code> (list everything, with details and hidden files), <code>cd folder</code>, <code>cd ..</code>, <code>cd ~</code>.</li>
<li><code>mkdir -p data/raw</code> creates nested folders. <code>cp a.txt b.txt</code> copies (<code>cp -r</code> for folders). <code>mv old new</code> moves or renames.</li>
<li><code>rm file</code> and <code>rm -r folder</code> delete <b>permanently</b>, with no trash. Be very careful with <code>rm -rf</code> and never run it on a path you haven't double-checked.</li>
</ul>
<h3>2. Looking inside files</h3>
<ul>
<li><code>cat file</code> prints the whole file. <code>less file</code> scrolls through it (press q to quit, /word to search).</li>
<li><code>head -n 20 file</code> shows the first lines. <code>tail -n 20 file</code> shows the last lines, and <code>tail -f app.log</code> <b>follows</b> a growing log live.</li>
<li><code>wc -l file</code> counts lines, which is handy for a .jsonl dataset.</li>
</ul>
<h3>3. Searching</h3>
<ul>
<li><code>grep "error" app.log</code> shows matching lines. <code>-i</code> ignores case, <code>-n</code> shows line numbers, <code>-r</code> searches a whole folder, and <code>-v</code> shows lines that <i>don't</i> match. For example, <code>grep -rn "API_KEY" .</code> checks you haven't hard-coded a key anywhere!</li>
<li><code>find . -name "*.py"</code> finds files by name. Quote the pattern so the shell doesn't expand it first.</li>
</ul>
<h3>4. Pipes and redirection</h3>
<ul>
<li><code>cmd1 | cmd2</code> sends cmd1's output into cmd2: <code>grep error app.log | wc -l</code> counts the errors.</li>
<li><code>cmd &gt; out.txt</code> writes output to a file (replacing it), and <code>&gt;&gt;</code> appends. <code>2&gt;&amp;1</code> sends errors to the same place as normal output.</li>
</ul>
<h3>5. Permissions and environment variables</h3>
<ul>
<li><code>chmod +x run.sh</code> makes a script executable, so you can run it with <code>./run.sh</code>. <code>chmod 600 .env</code> makes a secrets file readable only by you.</li>
<li><code>export GEMINI_API_KEY=abc123</code> sets a variable for this shell <i>and</i> every program it starts. <code>echo $GEMINI_API_KEY</code> prints it.</li>
<li>To make a variable permanent, add the export line to <code>~/.bashrc</code> (or <code>~/.zshrc</code> on macOS). <code>env | grep GEMINI</code> checks what's set.</li>
</ul>
<h3>6. Talking to APIs: curl, wget and jq</h3>
<ul>
<li><code>curl -s URL</code> fetches a URL. Add <code>-H "Header: value"</code> for headers and <code>-d '{"json": "body"}'</code> to POST data. This is the quickest way to test an LLM API without writing Python.</li>
<li><code>jq</code> filters and pretty-prints JSON: <code>curl -s ... | jq '.candidates[0].content.parts[0].text'</code>. Add <code>-r</code> for raw text without quotes.</li>
<li><code>wget URL</code> downloads a file, which is common for datasets and model weights.</li>
</ul>
<h3>7. Remote machines (e.g. a cloud GPU)</h3>
<ul>
<li><code>ssh user@host</code> logs in to a remote shell. <code>scp file.txt user@host:~/data/</code> copies a file there, and <code>scp user@host:~/out.txt .</code> copies one back. ssh keys (<code>ssh-keygen</code>) replace passwords.</li>
<li>Long jobs die when your connection drops unless you protect them. <code>nohup python train.py &gt; train.log 2&gt;&amp;1 &amp;</code> runs the job in the background (<code>&amp;</code>) and ignores the hang-up (<code>nohup</code>). Then watch it with <code>tail -f train.log</code>.</li>
<li><b>tmux</b> keeps whole terminal sessions alive. Start one with <code>tmux new -s work</code>, detach with <b>Ctrl+B then D</b>, and later run <code>tmux attach -t work</code> to find everything still running.</li>
</ul>
<h3>8. Checking the machine</h3>
<ul>
<li><code>df -h</code> shows free disk space (models are big!). <code>du -sh *</code> shows what's using it.</li>
<li><code>top</code> or <code>htop</code> show live CPU and memory use (press q to quit). <code>free -h</code> shows memory.</li>
<li><code>ps aux | grep python</code> finds running processes. <code>kill 1234</code> stops one by its PID, and <code>kill -9 1234</code> forces it.</li>
<li><code>nvidia-smi</code> shows your GPUs, their memory and which processes use them. <code>watch -n 1 nvidia-smi</code> refreshes it every second.</li>
</ul>
<h3>9. Archives</h3>
<ul>
<li><code>tar -xzf data.tar.gz</code> extracts: x for extract, z for gzip, f for file. <code>tar -czf backup.tar.gz folder/</code> creates an archive.</li>
<li><code>unzip file.zip</code> and <code>zip -r out.zip folder/</code> handle zip files.</li>
</ul>
<p>Keep the <a href="#/cheatsheet">PowerShell ↔ bash cheat sheet</a> open while you practise. <a href="https://tldr.sh/" target="_blank" rel="noopener">tldr</a> and <code>man grep</code> (press q to quit) explain any command.</p>`,
concepts:[["Pipe |","Feed one command's output into the next: grep err log | wc -l."],["Redirection > >> 2>&1","Send output to a file (replace / append), and merge errors into it."],["export","Set an environment variable for this shell and its child programs."],["curl + jq","Call HTTP APIs from the terminal and pick fields out of the JSON reply."],["ssh / scp","Log in to and copy files to or from a remote machine."],["nohup, & and tmux","Keep long jobs running in the background, even after you disconnect."]],
resources:[
 {t:"MIT Missing Semester: The shell",u:"https://missing.csail.mit.edu/2020/course-shell/",type:"course"},
 {t:"MIT Missing Semester: Shell tools and scripting",u:"https://missing.csail.mit.edu/2020/shell-tools/",type:"course"},
 {t:"LinuxCommand.org: Learning the shell",u:"https://linuxcommand.org/lc3_learning_the_shell.php",type:"article"},
 {t:"jq manual",u:"https://jqlang.org/manual/",type:"docs"},
 {t:"tmux wiki: Getting started",u:"https://github.com/tmux/tmux/wiki/Getting-Started",type:"docs"}
],
quiz:[
 {q:"What does <code>grep -rn \"API_KEY\" .</code> do?",o:["Deletes API keys","Searches every file under the current folder for API_KEY and shows line numbers","Creates an env var","Downloads a key"],a:1,e:"-r searches recursively and -n adds line numbers. It's a great pre-commit check for hard-coded keys."},
 {q:"<code>python train.py &gt; train.log 2&gt;&amp;1</code>. Where do error messages go?",o:["The screen","Into train.log along with normal output","They're discarded","A separate errors file"],a:1,e:"2>&1 sends stderr (errors) to wherever stdout goes, which is train.log here."},
 {q:"Your training job over ssh dies whenever your Wi-Fi drops. Best fix?",o:["Use a faster laptop","Run it in tmux (or with nohup ... &) so it survives disconnection","Use rm -rf","Run it twice"],a:1,e:"tmux sessions and nohup'd jobs keep running on the server after you disconnect."},
 {q:"You <code>export GEMINI_API_KEY=abc</code> and then run <code>python app.py</code> in the same shell. Can app.py read it?",o:["No","Yes, because exported variables are passed to programs started from that shell","Only with sudo","Only after a reboot"],a:1,e:"export makes the variable available to child processes."},
 {q:"Which command shows GPU memory use and the processes using it?",o:["df -h","nvidia-smi","top -gpu","ls /gpu"],a:1,e:"nvidia-smi is the standard NVIDIA GPU status tool."}
],
exercise:{title:"Bash command matcher",
task:`<p>Fill in <code>ANSWERS</code> with a bash command for each task. The checker accepts common variations (flag order, quotes, python vs python3) and gives a hint for each miss.</p>
<ol>
<li>List everything in the current folder, including hidden files, with details.</li>
<li>Create the nested folders <code>data/raw</code> in one command.</li>
<li>Follow <code>app.log</code> live, starting from its last 20 lines.</li>
<li>Search all files under the current folder for <code>OPENAI_API_KEY</code>.</li>
<li>Find every <code>.py</code> file under the current folder (quote the pattern).</li>
<li>Count the lines in <code>data.jsonl</code>.</li>
<li>Save the output of <code>pip freeze</code> to <code>requirements.txt</code>.</li>
<li>Set <code>GEMINI_API_KEY</code> to <code>abc123</code> for this shell and the programs it starts.</li>
<li>Make <code>run.sh</code> executable.</li>
<li>Run <code>python train.py</code> in the background so it survives logout, with all output (including errors) going to <code>train.log</code>.</li>
<li>Show the GPUs and their memory use.</li>
<li>Show free disk space in human-readable units.</li>
<li>Extract <code>data.tar.gz</code>.</li>
<li>Fetch <code>https://api.github.com/users/octocat</code> quietly with curl and print only the <code>name</code> field with jq.</li>
</ol>`,
starter:py`ANSWERS = {
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "",
    8: "", 9: "", 10: "", 11: "", 12: "", 13: "", 14: "",
}

for n, cmd in ANSWERS.items():
    print(n, cmd or "(empty)")
`,
solution:py`ANSWERS = {
    1: "ls -la",
    2: "mkdir -p data/raw",
    3: "tail -n 20 -f app.log",
    4: 'grep -r "OPENAI_API_KEY" .',
    5: 'find . -name "*.py"',
    6: "wc -l data.jsonl",
    7: "pip freeze > requirements.txt",
    8: "export GEMINI_API_KEY=abc123",
    9: "chmod +x run.sh",
    10: "nohup python train.py > train.log 2>&1 &",
    11: "nvidia-smi",
    12: "df -h",
    13: "tar -xzf data.tar.gz",
    14: "curl -s https://api.github.com/users/octocat | jq .name",
}

for n, cmd in ANSWERS.items():
    print(n, cmd or "(empty)")
`,
tests:py`import re
def norm(s):
    return " ".join(str(s).strip().split())
def has_all(cluster, letters):
    return all(c in cluster for c in letters)
RULES = {
    1: (lambda c: bool(re.match(r"^ls( -[lah]+)+$", c)) and has_all(c, "la"), "ls -la (both -l and -a)"),
    2: (lambda c: bool(re.match(r"^mkdir -p (\./)?data/raw/?$", c)), "mkdir -p data/raw"),
    3: (lambda c: bool(re.match(r"^tail (-n ?20 -f|-f -n ?20|-20f|-fn ?20|-f -20|-20 -f|-nf ?20) (\./)?app\.log$", c)), "tail -n 20 -f app.log"),
    4: (lambda c: bool(re.match(r"^grep -[rRnIi]*[rR][rRnIi]* ([\"']?)OPENAI_API_KEY\1( \.)?$", c)), "grep -r \"OPENAI_API_KEY\" ."),
    5: (lambda c: bool(re.match(r"^find (\.|\./) -i?name ([\"'])\*\.py\2$", c)), "find . -name \"*.py\" (with quotes)"),
    6: (lambda c: bool(re.match(r"^(wc -l <? ?(\./)?data\.jsonl|cat (\./)?data\.jsonl \| wc -l)$", c)), "wc -l data.jsonl"),
    7: (lambda c: bool(re.match(r"^((python3?|py) -m )?pip3? freeze ?> ?requirements\.txt$", c)), "pip freeze > requirements.txt"),
    8: (lambda c: bool(re.match(r"^export GEMINI_API_KEY=([\"']?)abc123\1$", c)), "export GEMINI_API_KEY=abc123 (no spaces around =)"),
    9: (lambda c: bool(re.match(r"^chmod (\+x|u\+x|a\+x|755|700|744) (\./)?run\.sh$", c)), "chmod +x run.sh"),
    10: (lambda c: bool(re.match(r"^nohup python3? train\.py (> ?train\.log 2> ?&1|&> ?train\.log) ?&$", c)), "nohup python train.py > train.log 2>&1 &"),
    11: (lambda c: c in ("nvidia-smi", "watch nvidia-smi", "watch -n 1 nvidia-smi", "watch -n1 nvidia-smi"), "nvidia-smi"),
    12: (lambda c: bool(re.match(r"^df -h( /)?$", c)), "df -h"),
    13: (lambda c: bool(re.match(r"^tar -?[xzfv]+ (\./)?data\.tar\.gz( -C \S+)?$", c)) and has_all(c.split()[1], "xf") and c.split()[1].rstrip("f").count("f") == 0, "tar -xzf data.tar.gz (the f must come last, right before the file name)"),
    14: (lambda c: bool(re.match(r"^curl -s[L]* ([\"']?)https://api\.github\.com/users/octocat\1 \| jq( -r)? ([\"']?)\.name\3$", c)), "curl -s https://api.github.com/users/octocat | jq .name"),
}
wrong = []
for n, (ok, hint) in RULES.items():
    got = norm(ANSWERS.get(n, ""))
    if got and ok(got):
        print(f"✓ task {n}")
    else:
        wrong.append(f"  task {n}: got {ANSWERS.get(n, '')!r} - hint: {hint}")
assert not wrong, f"{len(wrong)} task(s) not matched yet:\n" + "\n".join(wrong)
print("✅ All checks passed!")
`},
project:{title:"Call an LLM from the terminal, then babysit a long job",
desc:"Use only the terminal: call the Gemini API with curl and pull the answer out with jq, save replies to a JSON Lines log, then practise running a (fake) long job in the background and monitoring it, the way you would on a cloud GPU box.",
steps:["Install jq if needed (<code>sudo apt install jq</code>, <code>brew install jq</code>, or it's already in Colab). Export your key in the terminal.","Run the curl call, then change the prompt and pipe the reply into a file with <code>&gt;&gt;</code>.","Start the fake long job with nohup, follow its log with <code>tail -f</code>, find it with <code>ps</code>, then stop it with <code>kill</code>.","Bonus: repeat the long job inside <code>tmux</code>, detach, re-attach, and check <code>df -h</code> and <code>nvidia-smi</code> (if you have a GPU)."],
code:{bash:py`# --- 1. Call Gemini with curl + jq (free AI Studio key) ---
export GEMINI_API_KEY="paste-your-key"
URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"

curl -s "$URL" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Give me one tip for learning bash."}]}]}' \
  | jq -r '.candidates[0].content.parts[0].text'

# Save each full reply as one JSON line (a mini log) and count them
curl -s "$URL" -H "x-goog-api-key: $GEMINI_API_KEY" -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Name a Linux command."}]}]}' | jq -c . >> replies.jsonl
wc -l replies.jsonl
jq -r '.usageMetadata.totalTokenCount' replies.jsonl      # tokens used per call

# --- 2. A fake long job, run safely in the background ---
cat > long_job.py <<'PY'
import time
for step in range(1, 61):
    print(f"step {step}/60 loss={1/step:.3f}", flush=True)
    time.sleep(1)
PY
nohup python3 long_job.py > job.log 2>&1 &
echo "started job with PID $!"
tail -f job.log                 # Ctrl+C stops watching (the job keeps running)
ps aux | grep long_job.py       # find its PID
# kill <PID>                    # stop it

# --- 3. Health checks ---
df -h .            # disk space
du -sh *           # what is big in this folder
free -h            # memory (Linux)
nvidia-smi         # GPUs (only on machines with NVIDIA GPUs)

# --- 4. tmux: sessions that survive disconnects ---
# tmux new -s work       (run something)   Ctrl+B then D to detach
# tmux attach -t work    (come back later)
`}}
});
})();
