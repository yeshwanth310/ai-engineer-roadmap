(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
const runner = py`
# ship_check.py — run your eval set, measure latency & cost, decide if it's ready
import json, time
CASES = json.load(open("cases.json"))            # [{"q": ..., "must": [...], "tag": ...}]

results = []
for c in CASES:
    t0 = time.perf_counter()
    answer, usage = ask_assistant(c["q"])        # your capstone app; return (text, usage)
    ms = (time.perf_counter() - t0) * 1000
    ok = all(m.lower() in answer.lower() for m in c["must"])
    results.append({"passed": ok, "ms": ms, "cost": cost_usd(usage, PRICES)})   # Week 23

print(json.dumps(ship_report(results), indent=2))   # this week's exercise
`;
W.push({
id:27, phase:10, title:"Capstone II: evaluate, harden, ship — and what's next",
goal:"Finish your capstone like a professional: run evals, add guardrails, tracing and a UI, measure latency and cost, make a ship/no-ship decision, deploy, and plan your next steps.",
plan:[["15m","Plan the session"],["10m","Quiz"],["35m","Exercise"],["60m","Harden & ship"]],
analogy:"Before a new aircraft carries passengers it goes through a pre-flight checklist: every gauge checked against a clear pass mark. Your ship report is that checklist — accuracy, speed and cost against the targets you wrote in your spec. If a gauge is red, you don't take off; you fix it and check again.",
why:"‘It worked when I tried it’ isn't a quality bar. Measuring against your own success criteria turns a demo into something you can trust, explain in an interview and keep improving. It's also the habit that separates AI engineers from prompt tinkerers.",
explain:`
<h3>Session plan</h3>
<ol>
<li><b>Evals (W22)</b> — turn the 20+ questions you collected into <code>cases.json</code> (include unanswerable and adversarial ones). Run them; read every failure.</li>
<li><b>Fix the biggest failure category first</b> — usually retrieval (chunking, k, query rewriting), then prompt wording. Re-run after each change.</li>
<li><b>Guardrails (W24)</b> — input checks, PII redaction, output checks, least-privilege tools, confirmation for risky actions.</li>
<li><b>Observability & cost (W23)</b> — trace every request; add a response cache; put stable prompt content first for prompt caching.</li>
<li><b>UI & deploy (W25)</b> — Streamlit front end, secrets configured, rate limiting on.</li>
<li><b>Ship report</b> — compare results with your spec's success criteria and decide: ship, or fix and re-test.</li>
</ol>
<h3>Reading the ship report (no maths needed)</h3>
<ul><li><b>Pass rate</b> — the share of test questions answered acceptably.</li>
<li><b>p95 latency</b> — “95% of requests were faster than this”. It shows what your slower users experience, which an average hides.</li>
<li><b>Average cost per request</b> — multiply by expected daily requests to see your monthly bill.</li></ul>
<h3>Write it up</h3>
<p>A short README with the problem, a screenshot, the architecture sketch, your eval results and what you'd do next is a genuinely strong portfolio piece.</p>
<h3>Where to go next</h3>
<ul>
<li><b>Deeper agents</b> — human-in-the-loop approvals, long-running background agents, computer-use/browser agents, coding agents.</li>
<li><b>More modalities</b> — voice agents (real-time speech in/out), image generation.</li>
<li><b>Open models</b> — run models locally (e.g. with Ollama) for privacy or offline use.</li>
<li><b>Production depth</b> — async code, queues, databases, authentication, CI that runs your evals automatically.</li>
<li><b>Fine-tuning</b> — once you have lots of good examples and a proven need (W14).</li>
</ul>`,
concepts:[["Ship report","A summary of quality, speed and cost measured against your success criteria."],["Pass rate","Share of eval cases that met the bar."],["p95 latency","The time that 95% of requests beat — what slower users experience."],["Cost per request","Average spend for one user question, across all model calls."],["Go / no-go","The decision to release, based on the criteria you set in advance."],["README","The front page of your project: what, why, how, results, next steps."]],
resources:[
 {t:"Your AI Product Needs Evals — Hamel Husain",u:"https://hamel.dev/blog/posts/evals/",type:"article"},
 {t:"Streamlit Community Cloud (deploy your UI)",u:"https://docs.streamlit.io/deploy/streamlit-community-cloud",type:"docs"},
 {t:"Hugging Face Agents Course (keep going)",u:"https://huggingface.co/learn/agents-course/unit0/introduction",type:"course"},
 {t:"DeepLearning.AI short courses (pick your next topic)",u:"https://www.deeplearning.ai/short-courses/",type:"course"},
 {t:"Ollama — run open models locally",u:"https://ollama.com/",type:"tool"}
],
quiz:[
 {q:"What does p95 latency tell you?",o:["The average time","The time that 95% of requests were faster than — what slower users experience","The fastest request","The number of requests"],a:1,e:"It reveals the slow tail that averages hide."},
 {q:"Your pass rate is 70% but your spec requires 80%. What now?",o:["Ship anyway","Look at failures, fix the biggest category, re-run evals","Lower the bar silently","Delete failing tests"],a:1,e:"Improve against the criteria; don't move the goalposts quietly."},
 {q:"Which failure type is usually worth fixing first in a RAG assistant?",o:["Font choice","Retrieval (the right chunk isn't found)","Button colour","Log format"],a:1,e:"If retrieval misses, the model can't answer correctly."},
 {q:"Average cost is $0.004 per request and you expect 500 requests a day. Roughly what monthly bill?",o:["$0.60","About $60","$6,000","$0"],a:1,e:"0.004 × 500 × 30 ≈ $60. Simple multiplication is enough for budgeting."},
 {q:"What makes a capstone a strong portfolio piece?",o:["Only code, no docs","A README with problem, demo, architecture, eval results and next steps","A very long prompt","Using the most expensive model"],a:1,e:"Show you can build, measure and explain."}
],
exercise:{title:"Ship report & go/no-go decision",
task:`<p>Implement <code>ship_report(results, min_pass=0.8, max_p95_ms=6000, max_avg_cost=0.01)</code>. Each result is <code>{"passed": bool, "ms": number, "cost": number}</code>. Return:</p>
<pre class="code">{"n": count,
 "pass_rate": passed / n  (rounded to 2 dp),
 "p95_ms": p95 latency (see below, rounded to int),
 "avg_cost": average cost (rounded to 6 dp),
 "ship": True only if ALL three targets are met,
 "blockers": list of failed targets from ["pass_rate", "p95_ms", "avg_cost"], in that order}</pre>
<p><b>p95 (nearest-rank):</b> sort the latencies; take the item at position <code>ceil(0.95 × n)</code> counting from 1 (so index <code>ceil(0.95*n) - 1</code>). Targets: pass_rate ≥ min_pass, p95 ≤ max_p95_ms, avg_cost ≤ max_avg_cost. If <code>results</code> is empty, raise <code>ValueError</code>.</p>`,
starter:py`import math

def ship_report(results, min_pass=0.8, max_p95_ms=6000, max_avg_cost=0.01):
    pass

results = [{"passed": True, "ms": 1200 + i * 100, "cost": 0.004} for i in range(18)] + \
          [{"passed": False, "ms": 9000, "cost": 0.02}, {"passed": True, "ms": 2500, "cost": 0.003}]
print(ship_report(results))
`,
solution:py`import math

def ship_report(results, min_pass=0.8, max_p95_ms=6000, max_avg_cost=0.01):
    if not results:
        raise ValueError("no results")
    n = len(results)
    pass_rate = round(sum(r["passed"] for r in results) / n, 2)
    lat = sorted(r["ms"] for r in results)
    p95 = round(lat[math.ceil(0.95 * n) - 1])
    avg_cost = round(sum(r["cost"] for r in results) / n, 6)
    blockers = []
    if pass_rate < min_pass: blockers.append("pass_rate")
    if p95 > max_p95_ms: blockers.append("p95_ms")
    if avg_cost > max_avg_cost: blockers.append("avg_cost")
    return {"n": n, "pass_rate": pass_rate, "p95_ms": p95, "avg_cost": avg_cost,
            "ship": not blockers, "blockers": blockers}
`,
tests:py`res = [{"passed": True, "ms": 1200 + i * 100, "cost": 0.004} for i in range(18)] + \
      [{"passed": False, "ms": 9000, "cost": 0.02}, {"passed": True, "ms": 2500, "cost": 0.003}]
r = ship_report(res)
assert r is not None, "ship_report returned None"
assert r["n"] == 20 and r["pass_rate"] == 0.95, "n/pass_rate wrong: " + repr(r)
assert r["p95_ms"] == 2900, "p95 should be the 19th of 20 sorted latencies (2900), got " + repr(r["p95_ms"])
assert r["avg_cost"] == 0.00475, "avg_cost wrong: " + repr(r["avg_cost"])
assert r["ship"] is True and r["blockers"] == [], "Should ship: " + repr(r)
slow = [{"passed": i < 7, "ms": 7000, "cost": 0.05} for i in range(10)]
s = ship_report(slow)
assert s["ship"] is False and s["blockers"] == ["pass_rate", "p95_ms", "avg_cost"], "Blockers wrong: " + repr(s["blockers"])
one = ship_report([{"passed": True, "ms": 100.4, "cost": 0.001}])
assert one["p95_ms"] == 100 and one["ship"] is True
try:
    ship_report([]); assert False, "Empty results should raise ValueError"
except ValueError:
    pass
print("✅ All checks passed!")
`},
project:{title:"Harden, measure & ship your capstone",
desc:"Run your eval set, fix the top failure category, add guardrails + tracing + caching, deploy the Streamlit UI, and publish a README with your ship report. 🎓",
steps:["Create cases.json from the questions you collected; run ship_check.py (below) for a baseline report.","Fix the biggest failure category; re-run until the report says ship (or document why not).","Add check_input / check_output (W24), tracing + CachedLLM (W23), TokenBucket (W25).","Deploy the Streamlit UI; add secrets in the host's settings, never in the repo.","Write README.md: problem, screenshot, architecture, eval table, costs, what's next. Mark this week complete — you've finished the roadmap!"],
code:{gemini: py`from google import genai
client = genai.Client()
PRICES = {"input": 0.75, "output": 3.75}   # $ per 1M tokens — check the current pricing page!

def ask_assistant(q):
    r = client.models.generate_content(model="gemini-flash-latest", contents=q)  # swap in your capstone
    u = r.usage_metadata
    return r.text, {"input": u.prompt_token_count, "output": u.candidates_token_count or 0}
` + runner,
openai: py`from openai import OpenAI
client = OpenAI()
PRICES = {"input": 0.10, "output": 0.50}   # $ per 1M tokens — check the current pricing page!

def ask_assistant(q):
    r = client.responses.create(model="gpt-6-luna", input=q)   # swap in your capstone
    return r.output_text, {"input": r.usage.input_tokens, "output": r.usage.output_tokens}
` + runner,
anthropic: py`import anthropic
client = anthropic.Anthropic()
PRICES = {"input": 2.0, "output": 10.0}    # $ per 1M tokens — check the current pricing page!

def ask_assistant(q):
    r = client.messages.create(model="claude-sonnet-5-5", max_tokens=1024,
                               messages=[{"role": "user", "content": q}])   # swap in your capstone
    text = next(b.text for b in r.content if b.type == "text")
    return text, {"input": r.usage.input_tokens, "output": r.usage.output_tokens}
` + runner}}
});
})();
