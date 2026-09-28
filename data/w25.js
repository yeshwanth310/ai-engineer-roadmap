(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
const api = (setup, gen, stream) => py`# backend.py  —  pip install fastapi uvicorn pydantic python-dotenv
# run:  uvicorn backend:app --reload        docs: http://127.0.0.1:8000/docs
import time
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

load_dotenv()                                   # reads API keys from .env (never commit it!)
` + setup + py`
app = FastAPI(title="My LLM API")
bucket = TokenBucket(capacity=5, refill_per_sec=0.2, clock=time.monotonic)   # your exercise class

class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/chat")
def chat(body: ChatIn):
    if not bucket.allow():
        raise HTTPException(status_code=429, detail="Too many requests, slow down")
` + gen + py`

@app.post("/chat/stream")
def chat_stream(body: ChatIn):
    if not bucket.allow():
        raise HTTPException(status_code=429, detail="Too many requests, slow down")
    def tokens():
` + stream + py`
    return StreamingResponse(tokens(), media_type="text/plain")
`;
W.push({
id:25, phase:9, title:"Deploying: FastAPI backend + Streamlit UI",
goal:"Turn your scripts into a real app: a FastAPI backend with validation, streaming and rate limiting, a Streamlit chat UI, safe secret handling, and a path to deploy it for free.",
plan:[["25m","Read"],["10m","Quiz"],["40m","Exercise"],["45m","Mini project"]],
analogy:"A restaurant: the kitchen is your backend (FastAPI) — it does the real cooking (calling the LLM) and has rules like ‘max 5 orders a minute per table’ (rate limiting). The dining room is your frontend (Streamlit) — pleasant, simple, where customers place orders. Keeping them separate means you can redecorate the dining room without touching the kitchen, and lock the kitchen door (your API keys stay on the server, never in the browser).",
why:"An app only helps people once they can use it. Deployment skills — APIs, UIs, secrets, limits — are what turn a clever notebook into a portfolio project or a product, and they're what employers look for in an AI engineer.",
explain:`
<p>A typical small LLM app has two parts:</p>
<ul>
<li><b>Backend API (FastAPI)</b> — a Python web server with endpoints like <code>POST /chat</code>. It validates input (Pydantic again!), calls the model, applies guardrails and rate limits, logs traces, and keeps API keys secret. FastAPI auto-generates interactive docs at <code>/docs</code>. Streaming uses <code>StreamingResponse</code> to send tokens as they arrive.</li>
<li><b>Frontend UI (Streamlit)</b> — a pure-Python way to build web UIs. <code>st.chat_input</code> and <code>st.chat_message</code> give you a chat interface in ~20 lines; <code>st.session_state</code> remembers the conversation between reruns.</li>
</ul>
<p>For a quick prototype, Streamlit can call the LLM directly (one file!). Add a FastAPI backend when other apps need the same API, you need tighter control, or you'll add a different frontend later.</p>
<p><b>Production must-haves:</b></p>
<ul>
<li><b>Secrets</b> in environment variables / <code>.env</code> (git-ignored) / your host's secret manager (e.g. Streamlit's <code>st.secrets</code>). Never in code, never sent to the browser.</li>
<li><b>Rate limiting</b> — protects your wallet and your free-tier quota from spammers or bugs. A <b>token bucket</b> is the classic algorithm: a bucket holds up to N tokens; each request spends one; tokens trickle back at a steady rate. Bursts are allowed, floods are not.</li>
<li><b>Timeouts, retries and friendly errors</b> (Week 6), <b>logging/tracing</b> (Week 23), <b>guardrails</b> (Week 24).</li>
</ul>
<p><b>Free/cheap hosting:</b> <b>Streamlit Community Cloud</b> (connect a GitHub repo), <b>Hugging Face Spaces</b>, or <b>Google Cloud Run</b> (runs a Docker container, scales to zero, generous free tier) for the FastAPI backend.</p>
<pre class="code"># Dockerfile (for Cloud Run or anywhere)
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["sh", "-c", "uvicorn backend:app --host 0.0.0.0 --port $PORT"]</pre>`,
concepts:[["Backend / API","Server code that exposes endpoints (e.g. POST /chat) and holds secrets."],["Frontend / UI","What users see and click; should never contain API keys."],["Endpoint","A URL + method your API responds to, like POST /chat."],["Rate limiting","Capping how many requests a client can make over time."],["Token bucket","Rate-limit algorithm: spend a token per request, tokens refill steadily."],["Session state","Streamlit's per-user memory between reruns (e.g. chat history)."],["Container (Docker)","A packaged app + dependencies that runs the same anywhere."]],
resources:[
 {t:"FastAPI tutorial",u:"https://fastapi.tiangolo.com/tutorial/",type:"docs"},
 {t:"Streamlit: Build a basic LLM chat app",u:"https://docs.streamlit.io/develop/tutorials/chat-and-llm-apps/build-conversational-apps",type:"docs"},
 {t:"Streamlit Community Cloud (free hosting)",u:"https://docs.streamlit.io/deploy/streamlit-community-cloud",type:"docs"},
 {t:"Google Cloud Run: Deploy a Python service",u:"https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-python-service",type:"docs"},
 {t:"Hugging Face Spaces",u:"https://huggingface.co/docs/hub/spaces",type:"docs"}
],
quiz:[
 {q:"Where should your LLM API key live in a web app?",o:["In the JavaScript sent to the browser","On the server (env vars / secret manager)","In the page title","In a public GitHub repo"],a:1,e:"Anything sent to the browser can be read by users. Keep keys server-side."},
 {q:"What does a token-bucket rate limiter allow?",o:["Unlimited requests","Short bursts up to the bucket size, then a steady rate","Exactly one request per day","Only GET requests"],a:1,e:"Tokens refill steadily; the bucket size sets the burst limit."},
 {q:"Which HTTP status code means ‘too many requests’?",o:["200","404","429","500"],a:2,e:"429 = rate limited, the same code providers send you."},
 {q:"What does st.session_state do in Streamlit?",o:["Stores data per user between reruns, e.g. chat history","Deploys the app","Encrypts the API key","Trains the model"],a:0,e:"Streamlit reruns the script on each interaction; session_state persists data across reruns."},
 {q:"Why validate request bodies with Pydantic in FastAPI?",o:["For decoration","To reject bad input (empty, too long, wrong type) before it reaches the model","It speeds up the LLM","It's required for streaming"],a:1,e:"Validation protects cost, quality and security."}
],
exercise:{title:"Token-bucket rate limiter + request handler",
task:`<p>Implement:</p>
<ul><li><code>TokenBucket(capacity, refill_per_sec, clock)</code> starting <b>full</b>. <code>allow()</code>: first add <code>(now − last) × refill_per_sec</code> tokens (never above capacity) and update last; then if at least 1 token is available, spend it and return <code>True</code>, else <code>False</code>.</li>
<li><code>handle_chat(body, bucket, llm)</code> simulating an endpoint. Return <code>(status_code, payload)</code>:
<ul><li>message missing, not a string, or blank after strip → <code>(422, {"error": "message is required"})</code></li>
<li>longer than 2000 characters → <code>(422, {"error": "message too long"})</code></li>
<li>bucket refuses → <code>(429, {"error": "rate limited"})</code></li>
<li>llm raises → <code>(502, {"error": "upstream error"})</code></li>
<li>otherwise → <code>(200, {"reply": llm(message.strip())})</code></li></ul>
Validate <b>before</b> spending a rate-limit token.</li></ul>`,
starter:py`class TokenBucket:
    def __init__(self, capacity, refill_per_sec, clock):
        self.capacity = capacity
        self.refill_per_sec = refill_per_sec
        self.clock = clock
        self.tokens = capacity
        self.last = clock()

    def allow(self):
        pass

def handle_chat(body, bucket, llm):
    pass

t = {"now": 0}
b = TokenBucket(2, 1.0, lambda: t["now"])
print([b.allow() for _ in range(3)])   # [True, True, False]
`,
solution:py`class TokenBucket:
    def __init__(self, capacity, refill_per_sec, clock):
        self.capacity = capacity
        self.refill_per_sec = refill_per_sec
        self.clock = clock
        self.tokens = capacity
        self.last = clock()

    def allow(self):
        now = self.clock()
        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.refill_per_sec)
        self.last = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False

def handle_chat(body, bucket, llm):
    msg = body.get("message") if isinstance(body, dict) else None
    if not isinstance(msg, str) or not msg.strip():
        return 422, {"error": "message is required"}
    if len(msg) > 2000:
        return 422, {"error": "message too long"}
    if not bucket.allow():
        return 429, {"error": "rate limited"}
    try:
        return 200, {"reply": llm(msg.strip())}
    except Exception:
        return 502, {"error": "upstream error"}
`,
tests:py`t = {"now": 0.0}
clock = lambda: t["now"]
b = TokenBucket(2, 1.0, clock)
r = [b.allow() for _ in range(3)]
assert r == [True, True, False], "Burst of 2 then refuse, got " + repr(r)
t["now"] += 0.5
assert b.allow() is False, "Only half a token after 0.5s"
t["now"] += 0.5
assert b.allow() is True, "One full token after 1s total"
t["now"] += 100
assert [b.allow() for _ in range(3)] == [True, True, False], "Refill must be capped at capacity"
echo = lambda m: "echo: " + m
fresh = lambda: TokenBucket(1, 0.0, clock)
assert handle_chat({"message": "  hi  "}, fresh(), echo) == (200, {"reply": "echo: hi"})
assert handle_chat({}, fresh(), echo) == (422, {"error": "message is required"})
assert handle_chat({"message": "   "}, fresh(), echo) == (422, {"error": "message is required"})
assert handle_chat({"message": 42}, fresh(), echo) == (422, {"error": "message is required"})
assert handle_chat({"message": "x" * 2001}, fresh(), echo) == (422, {"error": "message too long"})
bk = fresh()
handle_chat({"message": ""}, bk, echo)
assert handle_chat({"message": "ok"}, bk, echo)[0] == 200, "Invalid requests must not spend a rate-limit token"
assert handle_chat({"message": "again"}, bk, echo) == (429, {"error": "rate limited"})
def boom(m): raise TimeoutError("provider down")
assert handle_chat({"message": "hi"}, fresh(), boom) == (502, {"error": "upstream error"})
print("✅ All checks passed!")
`},
project:{title:"Ship it: API + chat UI + free hosting",
desc:"Wrap your best project so far (e.g. the RAG assistant) in a FastAPI backend and a Streamlit chat UI, then deploy the UI to Streamlit Community Cloud.",
steps:["backend.py: /health, /chat (JSON) and /chat/stream (streaming) with Pydantic validation and your TokenBucket (code below).","app.py (Streamlit, below): chat UI that streams from your backend.","Run both locally: uvicorn backend:app --reload   and   streamlit run app.py","Push to GitHub (with .env in .gitignore!), deploy on Streamlit Community Cloud and add your key under the app's Secrets. For a public backend, try Cloud Run with the Dockerfile above."],
code:{
gemini: api(py`from google import genai
client = genai.Client()
MODEL = "gemini-flash-latest"
`, py`    r = client.models.generate_content(model=MODEL, contents=body.message)
    return {"reply": r.text}`, py`        for chunk in client.models.generate_content_stream(model=MODEL, contents=body.message):
            yield chunk.text or ""`) + streamlitApp(),
openai: api(py`from openai import OpenAI
client = OpenAI()
MODEL = "gpt-6-luna"
`, py`    r = client.responses.create(model=MODEL, input=body.message)
    return {"reply": r.output_text}`, py`        for event in client.responses.create(model=MODEL, input=body.message, stream=True):
            if event.type == "response.output_text.delta":
                yield event.delta`) + streamlitApp(),
anthropic: api(py`import anthropic
client = anthropic.Anthropic()
MODEL = "claude-sonnet-5-5"
`, py`    r = client.messages.create(model=MODEL, max_tokens=1024,
                               messages=[{"role": "user", "content": body.message}])
    return {"reply": next(b.text for b in r.content if b.type == "text")}`, py`        with client.messages.stream(model=MODEL, max_tokens=1024,
                                    messages=[{"role": "user", "content": body.message}]) as s:
            for text in s.text_stream:
                yield text`) + streamlitApp()
}}
});
function streamlitApp(){ return py`

# ---------------------------------------------------------------
# app.py  —  pip install streamlit requests      run: streamlit run app.py
import requests
import streamlit as st

API = "http://127.0.0.1:8000"
st.title("💬 My AI assistant")
if "history" not in st.session_state:
    st.session_state.history = []

for role, text in st.session_state.history:
    st.chat_message(role).write(text)

if prompt := st.chat_input("Ask me anything"):
    st.chat_message("user").write(prompt)
    with st.chat_message("assistant"):
        resp = requests.post(f"{API}/chat/stream", json={"message": prompt}, stream=True, timeout=60)
        if resp.status_code == 429:
            answer = "⏳ Too many requests — try again in a moment."
            st.write(answer)
        else:
            answer = st.write_stream(resp.iter_content(chunk_size=None, decode_unicode=True))
    st.session_state.history += [("user", prompt), ("assistant", answer)]
`; }
})();
