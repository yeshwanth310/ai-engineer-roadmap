(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
W.push({
id:18, phase:5, title:"Planning, workflow patterns & multi-agent basics",
goal:"Know the core agentic patterns — prompt chaining, routing, parallelisation, orchestrator-workers, evaluator-optimizer, plan-and-execute — plus when several agents beat one.",
plan:[["30m","Read"],["10m","Quiz"],["40m","Exercise"],["40m","Mini project"]],
analogy:"Think of a restaurant kitchen. A receptionist routes orders (routing). Several cooks prepare dishes at once (parallelisation). The head chef splits a banquet into tasks and hands them out (orchestrator–workers). A taster sends a dish back until it's right (evaluator–optimizer). And nobody plates dessert before the cake is baked (plan-and-execute with dependencies).",
why:"Picking the right pattern is usually worth more than picking the fanciest model. Simple, well-structured workflows are cheaper, faster and far easier to debug than one giant ‘do everything’ agent.",
explain:`
<p>Most successful “agents” in production are really <b>well-designed workflows</b> with a little autonomy where it helps. The key patterns (popularised by Anthropic's <i>Building effective agents</i>):</p>
<ul>
<li><b>Prompt chaining</b> — step 1's output feeds step 2. Add checks between steps.</li>
<li><b>Routing</b> — classify the request first, then send it to a specialised prompt/model (“billing” vs “technical”). Cheap model for easy requests, strong model for hard ones.</li>
<li><b>Parallelisation</b> — run independent sub-tasks at the same time (e.g. check 5 documents) then combine; or ask several times and take a vote.</li>
<li><b>Orchestrator–workers</b> — one LLM breaks the job into sub-tasks on the fly and delegates them.</li>
<li><b>Evaluator–optimizer</b> — one LLM drafts, another critiques; loop until good enough.</li>
<li><b>Plan-and-execute</b> — the model first writes a plan (steps with dependencies), then code executes the steps in a valid order, re-planning if something fails.</li>
</ul>
<p><b>Multi-agent systems</b> take this further: several agents, each with its own instructions and tools, working together. Common shapes are a <b>supervisor</b> (one boss agent delegating to specialists), <b>handoffs</b> (agents passing the conversation along — Week 20) and <b>agents-as-tools</b> (one agent calls another like a function). Multi-agent helps when a single agent's instructions or toolset get too big to handle reliably — but every extra agent adds cost, latency and new ways to fail. Start with one.</p>
<p>For plan-and-execute, steps often depend on each other (“write summary” needs “fetch data” first). Putting tasks in an order where every dependency runs first is called a <b>topological sort</b> — and it must detect impossible plans with circular dependencies (A needs B, B needs A). That's this week's exercise.</p>`,
concepts:[["Routing","Classifying a request and sending it to the right handler."],["Parallelisation","Running independent LLM calls at the same time, then combining."],["Orchestrator–workers","A lead LLM splits work and delegates to worker calls/agents."],["Evaluator–optimizer","Draft → critique → revise loop."],["Plan-and-execute","Make a step list first, then execute it in dependency order."],["Multi-agent system","Several specialised agents cooperating (supervisor, handoffs, agents-as-tools)."],["Topological order","An ordering where every task comes after the tasks it depends on."]],
resources:[
 {t:"Building effective agents — Anthropic engineering",u:"https://www.anthropic.com/engineering/building-effective-agents",type:"article"},
 {t:"LangGraph docs: Workflows and agents",u:"https://docs.langchain.com/oss/python/langgraph/workflows-agents",type:"docs"},
 {t:"Multi AI Agent Systems with crewAI — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/multi-ai-agent-systems-with-crewai/",type:"course"},
 {t:"How we built our multi-agent research system — Anthropic",u:"https://www.anthropic.com/engineering/multi-agent-research-system",type:"article"}
],
quiz:[
 {q:"Support requests should go to either a billing prompt or a tech prompt. Which pattern?",o:["Routing","Parallelisation","Evaluator–optimizer","Memory"],a:0,e:"Classify, then route to the specialised handler."},
 {q:"You need a draft email improved until it meets a checklist. Which pattern?",o:["Routing","Evaluator–optimizer","Chaining without checks","RAG"],a:1,e:"Generate, critique against criteria, revise."},
 {q:"Checking 10 independent documents for compliance fastest uses…",o:["Parallelisation","A single giant prompt, sequentially","Routing","Summary memory"],a:0,e:"Independent tasks can run concurrently."},
 {q:"A plan says: A needs B, B needs A. What should your executor do?",o:["Run A first anyway","Detect the cycle and ask for a new plan / raise an error","Loop forever","Skip both silently"],a:1,e:"Circular dependencies make a plan impossible — detect and handle it."},
 {q:"When is a multi-agent design worth its extra cost?",o:["Always — more agents are smarter","When one agent's instructions/tools have grown too large to handle reliably","Never","Only for chit-chat bots"],a:1,e:"Split when specialisation clearly helps; otherwise one agent is simpler and cheaper."}
],
exercise:{title:"Plan executor with dependency ordering",
task:`<p>A planner LLM produced steps like <code>{"id": "summarise", "deps": ["fetch"]}</code>. Implement:</p>
<ul><li><code>execution_order(steps)</code> → list of ids where each step appears after all its deps. When several steps are ready, pick the one earliest in the <b>original list order</b>. Raise <code>ValueError</code> if a dep refers to an unknown id or if there's a cycle.</li>
<li><code>run_plan(steps, handlers)</code> → runs steps in that order: <code>handlers[id](results)</code> where <code>results</code> is a dict of outputs so far. Return the results dict.</li></ul>`,
starter:py`def execution_order(steps):
    pass

def run_plan(steps, handlers):
    pass

plan = [
    {"id": "write_report", "deps": ["summarise", "chart"]},
    {"id": "fetch",        "deps": []},
    {"id": "summarise",    "deps": ["fetch"]},
    {"id": "chart",        "deps": ["fetch"]},
]
print(execution_order(plan))   # ['fetch', 'summarise', 'chart', 'write_report']
`,
solution:py`def execution_order(steps):
    known = {s["id"] for s in steps}
    for s in steps:
        for d in s["deps"]:
            if d not in known:
                raise ValueError(f"unknown dependency {d}")
    done, order = set(), []
    while len(order) < len(steps):
        progress = False
        for s in steps:
            if s["id"] not in done and all(d in done for d in s["deps"]):
                order.append(s["id"]); done.add(s["id"]); progress = True
                break
        if not progress:
            raise ValueError("cycle detected in plan")
    return order

def run_plan(steps, handlers):
    results = {}
    for sid in execution_order(steps):
        results[sid] = handlers[sid](results)
    return results
`,
tests:py`plan = [{"id": "write_report", "deps": ["summarise", "chart"]}, {"id": "fetch", "deps": []},
        {"id": "summarise", "deps": ["fetch"]}, {"id": "chart", "deps": ["fetch"]}]
o = execution_order(plan)
assert o == ["fetch", "summarise", "chart", "write_report"], "Wrong order: " + repr(o)
assert execution_order([{"id": "a", "deps": []}, {"id": "b", "deps": []}]) == ["a", "b"], "Independent steps keep original order"
for bad in ([{"id": "a", "deps": ["b"]}, {"id": "b", "deps": ["a"]}], [{"id": "a", "deps": ["ghost"]}], [{"id": "a", "deps": ["a"]}]):
    try:
        execution_order(bad); assert False, "Should raise ValueError for " + repr(bad)
    except ValueError:
        pass
handlers = {"fetch": lambda r: [3, 1, 2], "summarise": lambda r: f"{len(r['fetch'])} items",
            "chart": lambda r: sorted(r["fetch"]), "write_report": lambda r: r["summarise"] + " " + str(r["chart"])}
res = run_plan(plan, handlers)
assert res["write_report"] == "3 items [1, 2, 3]", "run_plan wrong: " + repr(res)
assert list(res) == ["fetch", "summarise", "chart", "write_report"], "results should be filled in execution order"
print("✅ All checks passed!")
`},
project:{title:"Router + evaluator-optimizer writing assistant",
desc:"Build a workflow: route a request (tweet / email / summary), draft with a specialised prompt, then loop an evaluator until the draft passes a checklist (max 3 rounds).",
steps:["Router: a cheap call returning one label via structured output (Literal type).","Three specialised drafting prompts in a dict keyed by label.","Evaluator returns {passed, feedback}; revise with the feedback until passed or 3 rounds.","Print every round so you can watch quality improve."],
code:{gemini:py`from typing import Literal
from pydantic import BaseModel
from google import genai
client = genai.Client()
MODEL = "gemini-flash-latest"

class Route(BaseModel):
    kind: Literal["tweet", "email", "summary"]
class Verdict(BaseModel):
    passed: bool
    feedback: str

def call(prompt, schema=None):
    cfg = {"response_mime_type": "application/json", "response_schema": schema} if schema else None
    r = client.models.generate_content(model=MODEL, contents=prompt, config=cfg)
    return r.parsed if schema else r.text

PROMPTS = {"tweet": "Write a punchy tweet (<280 chars) about: {req}",
           "email": "Write a polite, concise email about: {req}",
           "summary": "Write a 5-bullet summary of: {req}"}
CHECKLIST = "clear, specific, correct length, friendly tone, no made-up facts"

req = input("request> ")
kind = call(f"Classify this writing request: {req}", Route).kind
draft = call(PROMPTS[kind].format(req=req))
for round_ in range(3):
    v = call(f"Evaluate against: {CHECKLIST}\n\nDraft:\n{draft}", Verdict)
    print(f"[round {round_}] passed={v.passed} {v.feedback}")
    if v.passed: break
    draft = call(f"Revise the draft using this feedback: {v.feedback}\n\nDraft:\n{draft}")
print(f"\n({kind})\n{draft}")
`,
openai:py`from typing import Literal
from pydantic import BaseModel
from openai import OpenAI
client = OpenAI()
MODEL = "gpt-6-luna"

class Route(BaseModel):
    kind: Literal["tweet", "email", "summary"]
class Verdict(BaseModel):
    passed: bool
    feedback: str

def call(prompt, schema=None):
    if schema:
        return client.responses.parse(model=MODEL, input=prompt, text_format=schema).output_parsed
    return client.responses.create(model=MODEL, input=prompt).output_text

PROMPTS = {"tweet": "Write a punchy tweet (<280 chars) about: {req}",
           "email": "Write a polite, concise email about: {req}",
           "summary": "Write a 5-bullet summary of: {req}"}
CHECKLIST = "clear, specific, correct length, friendly tone, no made-up facts"

req = input("request> ")
kind = call(f"Classify this writing request: {req}", Route).kind
draft = call(PROMPTS[kind].format(req=req))
for round_ in range(3):
    v = call(f"Evaluate against: {CHECKLIST}\n\nDraft:\n{draft}", Verdict)
    print(f"[round {round_}] passed={v.passed} {v.feedback}")
    if v.passed: break
    draft = call(f"Revise the draft using this feedback: {v.feedback}\n\nDraft:\n{draft}")
print(f"\n({kind})\n{draft}")
`,
anthropic:py`from typing import Literal
from pydantic import BaseModel
import anthropic
client = anthropic.Anthropic()
MODEL = "claude-sonnet-5-5"

class Route(BaseModel):
    kind: Literal["tweet", "email", "summary"]
class Verdict(BaseModel):
    passed: bool
    feedback: str

def call(prompt, schema=None):
    msgs = [{"role": "user", "content": prompt}]
    if schema:
        return client.messages.parse(model=MODEL, max_tokens=800, messages=msgs,
                                     output_format=schema).parsed_output
    r = client.messages.create(model=MODEL, max_tokens=800, messages=msgs)
    return next(b.text for b in r.content if b.type == "text")

PROMPTS = {"tweet": "Write a punchy tweet (<280 chars) about: {req}",
           "email": "Write a polite, concise email about: {req}",
           "summary": "Write a 5-bullet summary of: {req}"}
CHECKLIST = "clear, specific, correct length, friendly tone, no made-up facts"

req = input("request> ")
kind = call(f"Classify this writing request: {req}", Route).kind
draft = call(PROMPTS[kind].format(req=req))
for round_ in range(3):
    v = call(f"Evaluate against: {CHECKLIST}\n\nDraft:\n{draft}", Verdict)
    print(f"[round {round_}] passed={v.passed} {v.feedback}")
    if v.passed: break
    draft = call(f"Revise the draft using this feedback: {v.feedback}\n\nDraft:\n{draft}")
print(f"\n({kind})\n{draft}")
`}}
});
})();
