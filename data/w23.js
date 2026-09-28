(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
W.push({
id:23, phase:7, title:"Observability, cost, latency & caching",
goal:"See inside your app with tracing, measure latency and cost per request, and use caching (your own + provider prompt caching) to make apps faster and cheaper.",
plan:[["25m","Read"],["10m","Quiz"],["45m","Exercise"],["40m","Mini project"]],
analogy:"Tracing is a flight recorder (black box) for your app: when something goes wrong, you replay exactly what happened — which prompt was sent, what came back, which tool ran, how long each step took. Caching is like a shop keeping popular items at the counter instead of fetching them from the warehouse every time.",
why:"In production, “the bot gave a weird answer” is impossible to fix without a trace. And costs/latency creep up silently — a single agent run can make 15 model calls. Measuring and caching often cut bills and wait times dramatically with zero loss of quality.",
explain:`
<h3>Observability & tracing</h3>
<p><b>Observability</b> means being able to answer “what happened and why?” from your logs. For LLM apps, a <b>trace</b> is the full story of one request, made of <b>spans</b> — timed steps like <i>retrieve → llm call → tool call → llm call</i>. Each span records inputs, outputs, duration, tokens and errors. Tools like <b>Langfuse</b> (open source), <b>LangSmith</b>, <b>Arize Phoenix</b>, the OpenAI Agents SDK's built-in tracing and ADK's dev UI give you this with a few lines of code. You can also start with simple structured logs (one JSON line per span).</p>
<h3>Latency (speed)</h3>
<ul><li><b>Time to first token</b> — how quickly text starts appearing (streaming helps perceived speed).</li>
<li><b>Total time</b> — grows with output length, number of sequential calls, and ‘thinking’ effort.</li>
<li>Speed-ups: smaller/faster models for easy steps, shorter outputs, fewer sequential calls, running independent calls in parallel, lower reasoning/thinking settings, and caching.</li></ul>
<h3>Cost</h3>
<p>Cost per request = input tokens × input price + output tokens × output price, summed over <i>every</i> call in the request (agents make many). Track it per feature and per user. Batch APIs (results within hours, ~50% cheaper) suit non-urgent jobs.</p>
<h3>Caching</h3>
<ul><li><b>Response caching (yours)</b> — if the exact same request was answered recently, return the saved answer: instant and free. Normalise the key (trim spaces) and set an expiry time.</li>
<li><b>Prompt caching (provider)</b> — when many requests start with the same long prefix (system prompt, big document), providers can reuse the processed prefix at a big discount. OpenAI and Gemini do this automatically for long repeated prefixes; Claude lets you mark the cacheable part with <code>cache_control</code>. Put stable content <b>first</b> and variable content <b>last</b> to benefit.</li>
<li><b>Semantic caching</b> — reuse answers for questions that <i>mean</i> the same (using embeddings). Powerful but riskier: “cancel my order” ≠ “don't cancel my order”.</li></ul>`,
concepts:[["Trace","The recorded story of one request through your app."],["Span","One timed step within a trace (an LLM call, a tool call, a retrieval)."],["Latency","How long the user waits. Time-to-first-token vs total time."],["Response cache","Storing answers to identical requests to return them instantly."],["Prompt caching","Provider-side reuse of a repeated prompt prefix for lower cost/latency."],["TTL","Time-to-live: how long a cached item stays valid."],["Batch API","Cheaper, slower processing of many requests at once."]],
resources:[
 {t:"Langfuse docs (open-source LLM observability)",u:"https://langfuse.com/docs",type:"docs"},
 {t:"Gemini API: Context caching",u:"https://ai.google.dev/gemini-api/docs/caching",type:"docs"},
 {t:"Claude docs: Prompt caching",u:"https://docs.claude.com/en/docs/build-with-claude/prompt-caching",type:"docs"},
 {t:"OpenAI: Prompt caching",u:"https://platform.openai.com/docs/guides/prompt-caching",type:"docs"},
 {t:"OpenAI: Latency optimization",u:"https://platform.openai.com/docs/guides/latency-optimization",type:"docs"}
],
quiz:[
 {q:"What is a span in a trace?",o:["A type of token","One timed step within a request, like an LLM or tool call","A vector database","A pricing tier"],a:1,e:"Traces are made of spans; each records inputs, outputs and timing."},
 {q:"To benefit from provider prompt caching you should put…",o:["Variable content first, stable content last","Stable content (system prompt, docs) first, variable content last","Everything in random order","Only images"],a:1,e:"Caching works on repeated prefixes."},
 {q:"An agent makes 12 model calls per request. How do you compute its cost?",o:["Only the last call's tokens","Sum input and output token costs over all 12 calls","Count the words in the answer","It's free"],a:1,e:"Every call costs; agents multiply costs."},
 {q:"Which is a risk of semantic caching?",o:["It's too slow","Similar-looking questions with different meaning may get the wrong cached answer","It uses no memory","It can't store text"],a:1,e:"Meaning-based matching can confuse near-opposites; use carefully."},
 {q:"Users complain the app ‘feels slow’ but total time is fine. Best first fix?",o:["Stream the output to cut time-to-first-token","Use a bigger model","Add more agents","Remove caching"],a:0,e:"Streaming improves perceived speed dramatically."}
],
exercise:{title:"Tracer, cost meter & TTL cache",
task:`<p>Build three small observability tools (a fake <code>clock()</code> is passed in so tests are instant):</p>
<ol><li><code>Tracer(clock)</code>: <code>with tracer.span(name):</code> records <code>{"name", "ms"}</code> into <code>tracer.spans</code>, where ms = (end − start) × 1000 using <code>clock()</code> (seconds), rounded to an int. Spans must be recorded even if the block raises (and the error must still propagate). <code>tracer.total_ms()</code> sums them. (Use <code>contextlib.contextmanager</code> with try/finally.)</li>
<li><code>cost_usd(usage, prices)</code>: usage = <code>{"input": tokens, "output": tokens}</code>, prices per <b>million</b> tokens <code>{"input": 0.5, "output": 3.0}</code> → dollars rounded to 6 dp.</li>
<li><code>CachedLLM(llm, clock, ttl)</code>: <code>ask(prompt)</code> uses <code>prompt.strip()</code> as the key; returns the cached answer if stored less than <code>ttl</code> seconds ago, else calls <code>llm(key)</code> and stores it. Track <code>hits</code> and <code>misses</code>.</li></ol>`,
starter:py`import contextlib

class Tracer:
    def __init__(self, clock):
        self.clock = clock
        self.spans = []

    @contextlib.contextmanager
    def span(self, name):
        # record start, yield, and ALWAYS record the span (try/finally)
        yield

    def total_ms(self):
        pass

def cost_usd(usage, prices):
    pass

class CachedLLM:
    def __init__(self, llm, clock, ttl):
        self.llm, self.clock, self.ttl = llm, clock, ttl
        self.store = {}           # key -> (answer, time_stored)
        self.hits = self.misses = 0

    def ask(self, prompt):
        pass

print(cost_usd({"input": 12000, "output": 800}, {"input": 0.5, "output": 3.0}))  # 0.0084
`,
solution:py`import contextlib

class Tracer:
    def __init__(self, clock):
        self.clock = clock
        self.spans = []

    @contextlib.contextmanager
    def span(self, name):
        start = self.clock()
        try:
            yield
        finally:
            self.spans.append({"name": name, "ms": round((self.clock() - start) * 1000)})

    def total_ms(self):
        return sum(s["ms"] for s in self.spans)

def cost_usd(usage, prices):
    return round(usage["input"] / 1e6 * prices["input"] + usage["output"] / 1e6 * prices["output"], 6)

class CachedLLM:
    def __init__(self, llm, clock, ttl):
        self.llm, self.clock, self.ttl = llm, clock, ttl
        self.store = {}
        self.hits = self.misses = 0

    def ask(self, prompt):
        key = prompt.strip()
        now = self.clock()
        if key in self.store and now - self.store[key][1] < self.ttl:
            self.hits += 1
            return self.store[key][0]
        self.misses += 1
        answer = self.llm(key)
        self.store[key] = (answer, now)
        return answer
`,
tests:py`t = {"now": 0.0}
clock = lambda: t["now"]
tr = Tracer(clock)
with tr.span("retrieve"):
    t["now"] += 0.120
with tr.span("llm"):
    t["now"] += 1.5
assert tr.spans == [{"name": "retrieve", "ms": 120}, {"name": "llm", "ms": 1500}], "Spans wrong: " + repr(tr.spans)
assert tr.total_ms() == 1620
try:
    with tr.span("tool"):
        t["now"] += 0.05
        raise RuntimeError("tool failed")
except RuntimeError:
    pass
else:
    assert False, "Errors inside a span must propagate"
assert tr.spans[-1] == {"name": "tool", "ms": 50}, "Span must be recorded even when the block raises"
assert cost_usd({"input": 12000, "output": 800}, {"input": 0.5, "output": 3.0}) == 0.0084, "cost wrong: " + repr(cost_usd({"input": 12000, "output": 800}, {"input": 0.5, "output": 3.0}))
assert cost_usd({"input": 0, "output": 0}, {"input": 1, "output": 1}) == 0
calls = []
def llm(p):
    calls.append(p); return "answer to " + p
c = CachedLLM(llm, clock, ttl=60)
assert c.ask("  What is RAG? ") == "answer to What is RAG?", "Key should be stripped before calling llm"
assert c.ask("What is RAG?") == "answer to What is RAG?"
assert (c.hits, c.misses) == (1, 1) and len(calls) == 1, "Second identical ask should be a cache hit"
t["now"] += 61
c.ask("What is RAG?")
assert (c.hits, c.misses) == (1, 2) and len(calls) == 2, "Expired entries (older than ttl) must be refreshed"
print("✅ All checks passed!")
`},
project:{title:"Add a flight recorder & cache to your RAG app",
desc:"Instrument your RAG app: a span per step with timings and token counts written as JSON lines, a cost report, a response cache, and a check that provider prompt caching kicks in.",
steps:["Wrap retrieve / generate in tracer spans; append each trace as one JSON line to traces.jsonl.","Record token usage from every response and compute cost with your cost_usd.","Put CachedLLM in front of generation; ask the same question twice and compare latency.","Move your long, stable instructions to the start of the prompt and look for cached-token counts in the usage data (code below).","Optional: sign up for Langfuse's free tier and send the same traces there."],
code:{gemini:py`import time
from google import genai
from google.genai import types

client = genai.Client()
tracer = Tracer(time.perf_counter)
SYSTEM = open("long_instructions.txt").read()      # big, stable prefix -> cache-friendly

def generate(prompt):
    with tracer.span("llm"):
        r = client.models.generate_content(
            model="gemini-flash-latest", contents=prompt,
            config=types.GenerateContentConfig(system_instruction=SYSTEM))
    u = r.usage_metadata
    print("tokens in/out:", u.prompt_token_count, u.candidates_token_count,
          "| cached:", u.cached_content_token_count)   # implicit caching on repeated prefixes
    return r.text

cached = CachedLLM(generate, time.monotonic, ttl=3600)
for q in ["What is our refund policy?", "What is our refund policy?"]:
    t0 = time.perf_counter(); cached.ask(q)
    print(f"{(time.perf_counter() - t0) * 1000:.0f} ms  hits={cached.hits}")
print(tracer.spans)
`,
openai:py`import time
from openai import OpenAI

client = OpenAI()
tracer = Tracer(time.perf_counter)
SYSTEM = open("long_instructions.txt").read()      # >1024 tokens and identical each time

def generate(prompt):
    with tracer.span("llm"):
        r = client.responses.create(model="gpt-6-luna", instructions=SYSTEM, input=prompt)
    u = r.usage
    print("tokens in/out:", u.input_tokens, u.output_tokens,
          "| cached:", u.input_tokens_details.cached_tokens)  # automatic prompt caching
    return r.output_text

cached = CachedLLM(generate, time.monotonic, ttl=3600)
for q in ["What is our refund policy?", "What is our refund policy?"]:
    t0 = time.perf_counter(); cached.ask(q)
    print(f"{(time.perf_counter() - t0) * 1000:.0f} ms  hits={cached.hits}")
print(tracer.spans)
`,
anthropic:py`import time
import anthropic

client = anthropic.Anthropic()
tracer = Tracer(time.perf_counter)
SYSTEM = open("long_instructions.txt").read()

def generate(prompt):
    with tracer.span("llm"):
        r = client.messages.create(
            model="claude-sonnet-5-5", max_tokens=800,
            system=[{"type": "text", "text": SYSTEM,
                     "cache_control": {"type": "ephemeral"}}],   # mark the cacheable prefix
            messages=[{"role": "user", "content": prompt}])
    u = r.usage
    print("tokens in/out:", u.input_tokens, u.output_tokens,
          "| cache write/read:", u.cache_creation_input_tokens, u.cache_read_input_tokens)
    return next(b.text for b in r.content if b.type == "text")

cached = CachedLLM(generate, time.monotonic, ttl=3600)
for q in ["What is our refund policy?", "What is our refund policy?"]:
    t0 = time.perf_counter(); cached.ask(q)
    print(f"{(time.perf_counter() - t0) * 1000:.0f} ms  hits={cached.hits}")
print(tracer.spans)
`}}
});
})();
