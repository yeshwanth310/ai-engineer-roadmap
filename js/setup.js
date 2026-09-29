/* Setup page */
(function(){
const { codeBlock, esc } = App;
const py = String.raw;
const sh = (c) => codeBlock(c, "shell");

function render(){
  return `<div class="wrap fade-in" style="max-width:900px">
  <span class="eyebrow">// one-time setup · about 30 minutes</span>
  <h1>Setup</h1>
  <p class="lead">Everything you need to run the mini projects on your own computer. The in-browser exercises need nothing — they run Python right in the page.</p>
  <div class="callout optional" style="margin-top:1.2rem"><b>New to any of this?</b> The optional <b>Phase 0 toolkit</b> covers it step by step: <a href="#/week/p1">Python from scratch (P1–P8)</a>, <a href="#/week/p9">PowerShell (P9)</a>, <a href="#/week/p10">Linux / bash (P10)</a> and <a href="#/week/p11">git &amp; GitHub (P11–P12)</a>. Keep the <a href="#/cheatsheet">PowerShell ↔ bash cheat sheet</a> handy while you set up.</div>

  <div class="steps-list" style="margin-top:2rem">
  <div class="step"><h3>Install Python 3.11+ and an editor</h3>
    <p>Download Python from <a href="https://www.python.org/downloads/" target="_blank" rel="noopener">python.org</a> (on Windows, tick “Add python.exe to PATH”). Check it with <code>python --version</code> (or <code>python3 --version</code> on macOS/Linux). Any editor is fine; <a href="https://code.visualstudio.com/docs/python/python-tutorial" target="_blank" rel="noopener">VS Code with the Python extension</a> is a good default.</p></div>

  <div class="step"><h3>Make a project folder with a virtual environment</h3>
    <p>A <b>virtual environment</b> is a private box of libraries for one project, so projects don't break each other (explained in <a href="#/week/p4">Toolkit P4</a>). New to the terminal? See <a href="#/week/p9">P9 (PowerShell)</a> or <a href="#/week/p10">P10 (bash)</a>.</p>
    ${sh("mkdir ai-roadmap && cd ai-roadmap\npython -m venv .venv\n\n# activate it (do this every time you open a new terminal)\n# macOS / Linux:\nsource .venv/bin/activate\n# Windows (PowerShell):\n.venv\\Scripts\\Activate.ps1")}
    <p>Then install the libraries used across the roadmap:</p>
    ${sh("pip install google-genai openai anthropic pydantic python-dotenv")}
    <p class="small muted"><b>Windows:</b> if activation fails with “running scripts is disabled on this system”, run <code>Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser</code> once (why this is safe: <a href="#/week/p9">P9</a>).</p>
    <p class="small muted">Later weeks add a few more (e.g. <code>chromadb</code>, <code>voyageai</code>, <code>langgraph</code>, <code>openai-agents</code>, <code>google-adk</code>, <code>mcp</code>, <code>fastapi</code>, <code>streamlit</code>) — each week tells you what to install.</p></div>

  <div class="step"><h3>Get a free Gemini API key (the main provider in this roadmap)</h3>
    <ol>
      <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio → API keys</a> and sign in with a Google account.</li>
      <li>Click <b>Create API key</b> and copy it. Keys created in AI Studio are restricted to the Gemini API by default — keep it that way.</li>
    </ol>
    <p>The free tier needs no credit card, but it has <b>rate limits</b> (requests per minute and per day — see the <a href="https://ai.google.dev/gemini-api/docs/rate-limits" target="_blank" rel="noopener">rate limits page</a>) and Google may use free-tier prompts to improve its products, so <b>don't send private or sensitive data</b> on the free tier (<a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener">terms</a>).</p></div>

  <div class="step"><h3>Store keys safely in a <code>.env</code> file</h3>
    <p>An API key is like a credit card number: anyone who has it can spend your quota. Put keys in a file named <code>.env</code> in your project folder:</p>
    ${sh("GEMINI_API_KEY=paste-your-gemini-key-here\n# optional — only if you buy API credits:\nOPENAI_API_KEY=\nANTHROPIC_API_KEY=\nXAI_API_KEY=")}
    <p>…and make sure git never uploads it by adding a <code>.gitignore</code> file:</p>
    ${sh(".env\n.venv/\n__pycache__/")}
    <p class="small muted">Using git? Create the .gitignore <b>before your first commit</b>, and never commit keys. <a href="#/week/p11">Toolkit P11</a> covers git, GitHub and what to do if a key leaks. Setting a key for just one terminal session: <code>$env:GEMINI_API_KEY = "..."</code> (PowerShell) or <code>export GEMINI_API_KEY=...</code> (bash).</p></div>

  <div class="step"><h3>Test that it works</h3>
    <p>Save this as <code>hello.py</code> and run <code>python hello.py</code>:</p>
    ${codeBlock(py`from dotenv import load_dotenv
from google import genai

load_dotenv()                      # reads .env into environment variables
client = genai.Client()            # finds GEMINI_API_KEY automatically
resp = client.models.generate_content(
    model="gemini-flash-latest",   # alias for the current Flash model
    contents="Say hello to a new AI engineer in one sentence.",
)
print(resp.text)`)}
    <p class="small muted">Error 429 = you hit the free-tier rate limit (wait a minute). Error 400/403 about the key = check the key in <code>.env</code>. Model names change over time — if a model isn't found, check the <a href="https://ai.google.dev/gemini-api/docs/models" target="_blank" rel="noopener">Gemini models page</a>.</p></div>

  <div class="step" id="subscriptions"><h3>Chat subscriptions vs. API billing (important!)</h3>
    <p>You may pay for <b>ChatGPT</b>, <b>Claude Pro</b>, <b>Gemini</b> (Google AI plans) or <b>SuperGrok</b>. Those subscriptions cover the <i>chat apps</i> — the websites and phone apps. <b>They do not include API access.</b> Calling a model from your own Python code is billed separately, per token, through each company's developer platform — like having a gym membership versus renting the gym for your own class.</p>
    <div class="table-scroll"><table class="tbl">
      <tr><th>Subscription (chat app)</th><th>API for your code</th><th>Where to get a key</th></tr>
      <tr><td>Gemini / Google AI plans</td><td>Gemini API — <b>free tier available</b></td><td><a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com</a></td></tr>
      <tr><td>ChatGPT Plus / Pro</td><td>OpenAI API — prepaid credits</td><td><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com</a></td></tr>
      <tr><td>Claude Pro / Max</td><td>Claude API — prepaid credits</td><td><a href="https://console.anthropic.com/" target="_blank" rel="noopener">console.anthropic.com</a></td></tr>
      <tr><td>SuperGrok</td><td>xAI API — prepaid credits</td><td><a href="https://console.x.ai/" target="_blank" rel="noopener">console.x.ai</a></td></tr>
    </table></div>
    <p style="margin-top:.8rem">That's why every mini project has a <b>Gemini (free)</b> tab first. The OpenAI and Claude tabs show the same idea for when you have credits. Your subscriptions are still very useful: use the chat apps as a <b>study buddy</b> to explain concepts and review your code (each lesson has a tip).</p>
    <p><b>Bonus — Grok from Python:</b> xAI's API is <i>OpenAI-compatible</i>, so you can use the <code>openai</code> library you already installed. Just point it at xAI's address and use an xAI key. Any OpenAI-tab code that uses <code>client.responses.create(...)</code> will mostly work this way (a few OpenAI-only features may differ).</p>
    ${codeBlock(py`import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["XAI_API_KEY"],     # from console.x.ai (needs API credits)
    base_url="https://api.x.ai/v1",        # send requests to xAI instead of OpenAI
)
resp = client.responses.create(
    model="grok-4.6",                      # current flagship as of Sep 2026 — check docs.x.ai/developers/models
    input="Explain what an API is in one sentence.",
)
print(resp.output_text)`)}
    <p class="small muted">Model names change often; see the <a href="https://docs.x.ai/developers/models" target="_blank" rel="noopener">xAI models page</a> and the <a href="https://docs.x.ai" target="_blank" rel="noopener">xAI docs</a> for current names and prices.</p></div>

  <div class="step"><h3>How to use this site</h3>
    <ul>
      <li>Do <b>one week per session (~2 hours)</b>: read → quiz → exercise → mini project. Each week page shows a time plan.</li>
      <li>The <b>exercise</b> runs real Python in your browser (Pyodide, downloaded once from a CDN — needs internet the first time). Press <b>Check</b> to run the automatic tests. Your code is saved as you type.</li>
      <li>The <b>mini project</b> runs on your computer with a real API key. Pick your provider tab — the site remembers your choice.</li>
      <li>Progress (quiz scores, exercises, completed weeks) is saved in <b>this browser</b>. Use <a href="#/progress">Progress → Export</a> to back it up or move it to another device (e.g. phone ↔ laptop).</li>
      <li>Unsure about a word? Check the <a href="#/glossary">Glossary</a>.</li>
      <li>Phase 0 (the Python / shell / git toolkit) is <b>optional</b> and tracked separately, so the main progress bar only counts the 27 core weeks.</li>
    </ul></div>
  </div></div>`;
}
App.setup = { render };
})();
