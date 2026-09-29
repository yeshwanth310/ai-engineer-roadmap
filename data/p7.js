(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
/* ================= TOOLKIT P7 ================= */
W.push({
id:107, phase:0, title:"Talking to web APIs: HTTP, requests, env vars & .env",
skip:"you've called a JSON web API with requests, know what 401 / 429 / 500 mean, and keep keys in environment variables.",
goal:"Understand what really happens when your code “calls an LLM”: an HTTP request with headers and a JSON body, and a response with a status code and JSON. Call one with the requests library, and keep your API keys safe in environment variables and a .env file.",
plan:[["30m","Read & try"],["10m","Quiz"],["40m","Exercise"],["40m","Mini project"]],
analogy:"An <b>HTTP request</b> is a letter you post to a company. The <b>URL</b> is the address, the <b>method</b> (GET or POST) says whether you're asking for something or sending something, the <b>headers</b> are what's written on the envelope (including your membership card, the API key), and the <b>body</b> is the letter itself (JSON). The reply comes with a <b>status code</b> stamped on top: 200 “done”, 401 “who are you?”, 429 “too many letters, slow down”, 500 “our fault, try later”.",
why:"Every LLM SDK is a friendly wrapper around HTTP requests. Knowing what's underneath lets you read error messages, call any API that doesn't have an SDK, debug with curl (P10), and understand rate limits and retries (Week 6). Keeping keys in environment variables is the number one security habit for AI projects.",
explain:`
<p><b>Anatomy of an API call:</b></p>
<ul>
<li><b>URL</b>: where to send it, e.g. <code>https://api.openai.com/v1/responses</code>.</li>
<li><b>Method</b>: <code>GET</code> reads (like loading a web page) and <code>POST</code> sends data. LLM calls are POSTs.</li>
<li><b>Headers</b>: extra information such as <code>Content-Type: application/json</code> and your key (<code>Authorization: Bearer sk-...</code>, or provider-specific headers like <code>x-goog-api-key</code> or <code>x-api-key</code>).</li>
<li><b>Body</b>: the JSON with your model name, prompt and settings.</li>
<li><b>Response</b>: a <b>status code</b> plus a JSON body with the answer and usage, or an error message.</li>
</ul>
<p><b>Status codes in one breath:</b></p>
<ul>
<li><b>2xx</b> means success.</li>
<li><b>400</b> means your request is malformed. Fix the request, because retrying won't help.</li>
<li><b>401/403</b> means a bad or missing key, or no permission. <b>404</b> means the wrong URL or model name.</li>
<li><b>429</b> means you're rate limited. Wait and retry with backoff.</li>
<li><b>5xx</b> means the server had a problem. Retry later.</li>
</ul>
<p><b>The requests library</b> (<code>pip install requests</code>) makes HTTP easy:</p>
<pre class="code">import requests
r = requests.post(url, headers={"x-goog-api-key": key}, json=body, timeout=30)
r.status_code        # e.g. 200
r.json()             # the response body as Python dicts/lists
r.raise_for_status() # raises an exception for 4xx/5xx</pre>
<p>Always set a <code>timeout</code>. Without one, a stuck connection can hang your program forever. <code>json=body</code> converts your dict to JSON and sets the Content-Type header for you.</p>
<p><b>Environment variables</b> are settings that live outside your code, in your terminal session or operating system. Read one with <code>os.environ.get("GEMINI_API_KEY")</code>, which returns None if it isn't set. Set one for the current terminal with <code>export GEMINI_API_KEY=...</code> (bash) or <code>$env:GEMINI_API_KEY = "..."</code> (PowerShell). See P9 and P10.</p>
<p>A <b>.env file</b> is a plain text file of <code>NAME=value</code> lines in your project folder. <code>from dotenv import load_dotenv; load_dotenv()</code> (from the python-dotenv package) copies those lines into environment variables when your program starts. Add <code>.env</code> to <code>.gitignore</code> <b>before your first commit</b> (P11).</p>
<div class="callout"><b>Never paste a key into your code, a screenshot, a chat app or a GitHub repo.</b> Bots scan GitHub for leaked keys within minutes. If a key leaks: revoke it in the provider console, create a new one, and update your .env.</div>`,
concepts:[["HTTP request","URL + method (GET/POST) + headers + JSON body sent to a server."],["Status code","The server's verdict: 2xx ok, 4xx your problem, 429 slow down, 5xx their problem."],["Header","Metadata on a request, e.g. Content-Type or the API key."],["requests","The popular Python HTTP library: requests.post(url, json=..., timeout=...)."],["Environment variable","A named setting outside your code, read with os.environ.get()."],[".env file","NAME=value lines loaded by python-dotenv. Never commit it."]],
resources:[
 {t:"MDN: An overview of HTTP",u:"https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",type:"docs"},
 {t:"MDN: HTTP response status codes",u:"https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",type:"docs"},
 {t:"Requests: Quickstart",u:"https://requests.readthedocs.io/en/latest/user/quickstart/",type:"docs"},
 {t:"python-dotenv on PyPI",u:"https://pypi.org/project/python-dotenv/",type:"docs"},
 {t:"Gemini API reference: generateContent (REST)",u:"https://ai.google.dev/api/generate-content",type:"docs"}
],
quiz:[
 {q:"Your LLM call returns status 429. What should you do?",o:["Fix your JSON","Wait and retry with backoff: you're being rate limited","Get a new key immediately","Nothing, because 429 means success"],a:1,e:"429 means too many requests. Back off and retry (Week 6)."},
 {q:"Status 401 most likely means…",o:["The server crashed","Your API key is missing or wrong","You're too fast","Success"],a:1,e:"401/403 are authentication or permission problems. Check the key and header."},
 {q:"Why always pass <code>timeout=</code> to requests?",o:["It's faster","So a stuck connection can't hang your program forever","The API requires it","To save tokens"],a:1,e:"Without a timeout, requests can wait indefinitely."},
 {q:"What does <code>load_dotenv()</code> do?",o:["Uploads your keys to GitHub","Reads NAME=value lines from .env into environment variables","Encrypts your code","Installs packages"],a:1,e:"Your code can then read them with os.environ.get(...)."},
 {q:"Where should your API key live?",o:["Hard-coded in main.py","In a .env file that is listed in .gitignore (or an environment variable)","In the README","In a public gist"],a:1,e:"Keep secrets out of code and out of git."}
],
exercise:{title:"Keys, .env parsing and an HTTP request, offline",
task:`<p>No internet needed: you'll build and read the same data an HTTP call uses.</p>
<ul>
<li><code>parse_dotenv(text)</code>: turn .env text into a dict. Skip blank lines and lines starting with <code>#</code>, allow an optional <code>export </code> prefix, split on the <b>first</b> <code>=</code>, strip spaces, and remove matching surrounding quotes (<code>"..."</code> or <code>'...'</code>).</li>
<li><code>get_api_key(env, name="GEMINI_API_KEY")</code>: return the stripped value from the dict <code>env</code>. If it's missing or empty, <code>raise RuntimeError</code> with a message containing the name and the word <code>.env</code>.</li>
<li><code>build_request(api_key, prompt, model="gemini-flash-latest")</code>: return a dict with <code>"url"</code> = <code>https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent</code>, <code>"headers"</code> = <code>{"x-goog-api-key": key, "Content-Type": "application/json"}</code>, and <code>"json"</code> = <code>{"contents": [{"parts": [{"text": prompt}]}]}</code>.</li>
<li><code>classify_status(code)</code>: return <code>"ok"</code> (200–299), <code>"auth"</code> (401, 403), <code>"retry"</code> (429 or 500–599), or <code>"fix-request"</code> (any other 4xx).</li>
<li><code>extract_text(body)</code>: return <code>body["candidates"][0]["content"]["parts"][0]["text"]</code>.</li>
</ul>`,
starter:py`def parse_dotenv(text):
    env = {}
    # TODO
    return env


def get_api_key(env, name="GEMINI_API_KEY"):
    return env[name]  # TODO: friendly RuntimeError when missing/empty


def build_request(api_key, prompt, model="gemini-flash-latest"):
    return {}  # TODO


def classify_status(code):
    return "ok"  # TODO


def extract_text(body):
    return ""  # TODO


env = parse_dotenv('# my keys\nGEMINI_API_KEY="abc123"\n')
print(env)
print(build_request(get_api_key(env), "Hello"))
`,
solution:py`def parse_dotenv(text):
    env = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export "):]
        if "=" not in line:
            continue
        name, value = line.split("=", 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        env[name.strip()] = value
    return env


def get_api_key(env, name="GEMINI_API_KEY"):
    value = (env.get(name) or "").strip()
    if not value:
        raise RuntimeError(f"{name} is not set. Add it to your .env file (see Setup).")
    return value


def build_request(api_key, prompt, model="gemini-flash-latest"):
    return {
        "url": f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        "headers": {"x-goog-api-key": api_key, "Content-Type": "application/json"},
        "json": {"contents": [{"parts": [{"text": prompt}]}]},
    }


def classify_status(code):
    if 200 <= code < 300:
        return "ok"
    if code in (401, 403):
        return "auth"
    if code == 429 or 500 <= code < 600:
        return "retry"
    return "fix-request"


def extract_text(body):
    return body["candidates"][0]["content"]["parts"][0]["text"]


env = parse_dotenv('# my keys\nGEMINI_API_KEY="abc123"\n')
print(env)
print(build_request(get_api_key(env), "Hello"))
`,
tests:py`text = '''
# comment line
GEMINI_API_KEY="abc123"
export OPENAI_API_KEY = sk-test
EMPTY=
URL=https://x.io/?a=1&b=2
SINGLE='quoted value'
'''
e = parse_dotenv(text)
assert e.get("GEMINI_API_KEY") == "abc123", "Quotes should be removed: " + repr(e.get("GEMINI_API_KEY"))
assert e.get("OPENAI_API_KEY") == "sk-test", "Handle 'export ' and spaces around '='"
assert e.get("URL") == "https://x.io/?a=1&b=2", "Split only on the FIRST '='"
assert e.get("SINGLE") == "quoted value" and e.get("EMPTY") == "", "Single quotes / empty values"
assert "# comment line" not in e and len(e) == 5, "Comments and blank lines must be skipped: " + repr(e)
assert get_api_key({"GEMINI_API_KEY": "  k1 "}) == "k1"
for bad in [{}, {"GEMINI_API_KEY": "   "}]:
    try:
        get_api_key(bad)
        assert False, "Missing/empty key should raise RuntimeError"
    except RuntimeError as err:
        assert "GEMINI_API_KEY" in str(err) and ".env" in str(err), "Message should name the key and mention .env"
req = build_request("KEY", "Hi", model="m1")
assert req["url"] == "https://generativelanguage.googleapis.com/v1beta/models/m1:generateContent", "url wrong: " + repr(req.get("url"))
assert req["headers"] == {"x-goog-api-key": "KEY", "Content-Type": "application/json"}, "headers wrong"
assert req["json"] == {"contents": [{"parts": [{"text": "Hi"}]}]}, "json body wrong"
cases = {200: "ok", 201: "ok", 401: "auth", 403: "auth", 429: "retry", 500: "retry", 503: "retry", 400: "fix-request", 404: "fix-request"}
for code, want in cases.items():
    assert classify_status(code) == want, f"classify_status({code}) should be {want!r}, got {classify_status(code)!r}"
body = {"candidates": [{"content": {"parts": [{"text": "Hello there!"}], "role": "model"}}], "usageMetadata": {"totalTokenCount": 9}}
assert extract_text(body) == "Hello there!"
print("✅ All checks passed!")
`},
project:{title:"Call an LLM with plain requests (no SDK)",
desc:"Call a real model using only the <code>requests</code> library, so you see the raw HTTP that SDKs hide. Load the key from <code>.env</code>, send the request, handle the status code, and print the text plus token usage. Compare the three providers' shapes in the tabs.",
steps:["<code>pip install requests python-dotenv</code> and put your key in <code>.env</code> (and <code>.env</code> in <code>.gitignore</code>).","Copy the code for your provider into <code>raw_call.py</code> and run it.","Print <code>r.status_code</code>, then break it on purpose: use a wrong key (401) or a made-up model name (404), and read the error JSON.","Stretch goal: add a retry loop for 429/5xx using your <code>classify_status</code> and Week 6's backoff."],
code:{gemini:py`# raw_call.py - Gemini REST API with requests (free key from AI Studio)
import os, requests
from dotenv import load_dotenv

load_dotenv()
key = os.environ.get("GEMINI_API_KEY") or exit("Set GEMINI_API_KEY in .env")
url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"

r = requests.post(
    url,
    headers={"x-goog-api-key": key, "Content-Type": "application/json"},
    json={"contents": [{"parts": [{"text": "Explain HTTP status 429 in one sentence."}]}]},
    timeout=60,
)
print("status:", r.status_code)
data = r.json()
if r.ok:
    print(data["candidates"][0]["content"]["parts"][0]["text"])
    print("usage:", data.get("usageMetadata"))
else:
    print("error:", data.get("error", {}).get("message"))
`,
openai:py`# raw_call.py - OpenAI Responses API with requests (needs API credits)
import os, requests
from dotenv import load_dotenv

load_dotenv()
key = os.environ.get("OPENAI_API_KEY") or exit("Set OPENAI_API_KEY in .env")

r = requests.post(
    "https://api.openai.com/v1/responses",
    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    json={"model": "gpt-6-luna", "input": "Explain HTTP status 429 in one sentence."},
    timeout=60,
)
print("status:", r.status_code)
data = r.json()
if r.ok:
    # output is a list of items; the message item holds output_text parts
    texts = [c["text"] for item in data["output"] if item["type"] == "message"
             for c in item["content"] if c["type"] == "output_text"]
    print("".join(texts))
    print("usage:", data.get("usage"))
else:
    print("error:", data.get("error", {}).get("message"))
`,
anthropic:py`# raw_call.py - Claude Messages API with requests (needs API credits)
import os, requests
from dotenv import load_dotenv

load_dotenv()
key = os.environ.get("ANTHROPIC_API_KEY") or exit("Set ANTHROPIC_API_KEY in .env")

r = requests.post(
    "https://api.anthropic.com/v1/messages",
    headers={"x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
    json={"model": "claude-sonnet-5-5", "max_tokens": 300,
          "messages": [{"role": "user", "content": "Explain HTTP status 429 in one sentence."}]},
    timeout=60,
)
print("status:", r.status_code)
data = r.json()
if r.ok:
    print("".join(b["text"] for b in data["content"] if b["type"] == "text"))
    print("usage:", data.get("usage"))
else:
    print("error:", data.get("error", {}).get("message"))
`}}
});
})();
