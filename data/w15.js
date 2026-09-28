(function(){
const W = window.ROADMAP.weeks; const py = String.raw;

/* ================= WEEK 15 ================= */
W.push({
id:15, phase:5, title:"What is an agent? The loop",
goal:"Understand an agent as ‘an LLM calling tools in a loop until the job is done’, and build that loop yourself with a stop condition and step limit.",
plan:[["25m","Read"],["10m","Quiz"],["45m","Exercise"],["40m","Mini project"]],
analogy:"Think of a new intern with a phone and a to-do list. They read the task, decide to call someone (a tool), listen to the answer, write it down, decide the next call… and finally come back and report. An agent is exactly that intern — except the ‘deciding’ is done by an LLM, and you must tell it when to stop so it doesn't phone people forever.",
why:"Almost every ‘AI agent’ product you'll hear about — coding assistants, research agents, support bots that take actions — is this loop plus good tools. If you can write the loop, no framework will ever feel like magic.",
explain:`
<p>In Week 9 the model made one tool call and answered. An <b>agent</b> simply keeps going: it looks at the goal and everything so far, decides the next action, sees the result, and repeats until it can give a final answer.</p>
<pre class="code">while not done:
    decision = llm(goal + history + tool descriptions)
    if decision is a tool call:   run tool, add result to history
    else:                         done → return final answer</pre>
<p>That's genuinely it. Everything else — memory, planning, multi-agent systems, frameworks — is refinement around this loop.</p>
<p>What makes agents tricky is that <b>the model controls the flow</b>. It might loop forever, call the wrong tool, or stop too early. So every agent needs:</p>
<ul><li>A <b>max-steps limit</b> (and ideally a cost/time budget).</li><li>A <b>trace</b> of every step for debugging — a written log of what it decided and why.</li><li>Clear tool descriptions and good error messages from tools.</li></ul>
<p><b>Workflow or agent?</b> If you can write the steps down in advance, a fixed <i>workflow</i> (a chain of prompts in code) is cheaper and more reliable — like following a recipe. Use an agent when the steps genuinely depend on what's discovered along the way — like a detective following clues.</p>`,
concepts:[["Agent","An LLM that repeatedly chooses actions (tool calls) until a goal is met."],["Agent loop","decide → act → observe → repeat, until a final answer."],["Stop condition","When the model gives a final answer instead of a tool call."],["Max steps","A hard cap on iterations to prevent runaway loops and bills."],["Trace","The recorded sequence of decisions, tool calls and results."],["Workflow","A fixed, code-defined sequence of LLM calls (no autonomous looping)."]],
resources:[
 {t:"Building effective agents — Anthropic engineering",u:"https://www.anthropic.com/engineering/building-effective-agents",type:"article"},
 {t:"Hugging Face Agents Course (free)",u:"https://huggingface.co/learn/agents-course/unit0/introduction",type:"course"},
 {t:"AI Agents in LangGraph — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/",type:"course"},
 {t:"Anthropic docs: Tool use with Claude",u:"https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview",type:"docs"}
],
quiz:[
 {q:"Which best describes an agent?",o:["A single prompt","An LLM choosing tool calls in a loop until the goal is met","A database","A fine-tuned model"],a:1,e:"The loop of decide → act → observe is the essence of an agent."},
 {q:"How does the agent loop normally end?",o:["When the model returns a final answer (no tool call) or max steps is hit","After exactly 3 steps always","When the user closes the laptop","It never ends"],a:0,e:"Final answer = natural stop; max steps = safety stop."},
 {q:"Why is a max-steps limit essential?",o:["APIs require it","The model controls the flow and could loop forever, burning money","It makes answers longer","It's a style preference"],a:1,e:"Always bound autonomous loops."},
 {q:"Your task is always: extract fields → translate → save. Best design?",o:["A fully autonomous agent","A fixed workflow in code","A multi-agent swarm","No LLM"],a:1,e:"Known, fixed steps → workflow. Simpler, cheaper, more predictable."},
 {q:"What should be added to the history after a tool runs?",o:["Nothing","The tool's result, so the model can decide the next step","A random fact","The API key"],a:1,e:"Observations drive the next decision."}
],
exercise:{title:"Write the agent loop (mock LLM)",
task:`<p>Implement <code>run_agent(llm, tools, task, max_steps=5)</code>.</p>
<ul><li>Start <code>messages = [{"role": "user", "content": task}]</code>.</li>
<li>Each step call <code>decision = llm(messages)</code>. A decision is either <code>{"type": "final", "text": ...}</code> or <code>{"type": "tool", "name": ..., "args": {...}}</code>.</li>
<li>For a tool decision: append <code>{"role": "assistant", "tool": name, "args": args}</code>, run <code>tools[name](**args)</code> and append <code>{"role": "tool", "name": name, "content": result}</code>. If the tool name is unknown, the content is <code>"error: unknown tool NAME"</code>.</li>
<li>For a final decision: return <code>{"answer": text, "steps": step_count, "messages": messages}</code> where step_count counts <b>all</b> llm calls.</li>
<li>If <code>max_steps</code> llm calls happen without a final answer, return answer <code>"stopped: max steps reached"</code> with steps = max_steps.</li></ul>`,
starter:py`def run_agent(llm, tools, task, max_steps=5):
    messages = [{"role": "user", "content": task}]
    # your loop here
    pass

# --- a scripted mock LLM: looks up a price, then multiplies, then answers
def mock_llm(messages):
    tool_msgs = [m for m in messages if m["role"] == "tool"]
    if len(tool_msgs) == 0:
        return {"type": "tool", "name": "price_of", "args": {"item": "coffee"}}
    if len(tool_msgs) == 1:
        return {"type": "tool", "name": "multiply", "args": {"a": tool_msgs[0]["content"], "b": 3}}
    return {"type": "final", "text": f"3 coffees cost {tool_msgs[1]['content']}"}

TOOLS = {"price_of": lambda item: {"coffee": 120}[item], "multiply": lambda a, b: a * b}
result = run_agent(mock_llm, TOOLS, "How much are 3 coffees?")
print(result["answer"], "| steps:", result["steps"])
`,
solution:py`def run_agent(llm, tools, task, max_steps=5):
    messages = [{"role": "user", "content": task}]
    for step in range(1, max_steps + 1):
        decision = llm(messages)
        if decision["type"] == "final":
            return {"answer": decision["text"], "steps": step, "messages": messages}
        name, args = decision["name"], decision.get("args", {})
        messages.append({"role": "assistant", "tool": name, "args": args})
        if name in tools:
            result = tools[name](**args)
        else:
            result = f"error: unknown tool {name}"
        messages.append({"role": "tool", "name": name, "content": result})
    return {"answer": "stopped: max steps reached", "steps": max_steps, "messages": messages}
`,
tests:py`def mock_llm(messages):
    t = [m for m in messages if m["role"] == "tool"]
    if len(t) == 0: return {"type": "tool", "name": "price_of", "args": {"item": "coffee"}}
    if len(t) == 1: return {"type": "tool", "name": "multiply", "args": {"a": t[0]["content"], "b": 3}}
    return {"type": "final", "text": f"3 coffees cost {t[1]['content']}"}
TOOLS = {"price_of": lambda item: {"coffee": 120}[item], "multiply": lambda a, b: a * b}
r = run_agent(mock_llm, TOOLS, "How much are 3 coffees?")
assert r is not None, "run_agent returned None - did you forget to return?"
assert r["answer"] == "3 coffees cost 360", "Wrong answer: " + repr(r.get("answer"))
assert r["steps"] == 3, "Expected 3 llm calls, got " + repr(r["steps"])
m = r["messages"]
assert m[0] == {"role": "user", "content": "How much are 3 coffees?"}
assert m[1] == {"role": "assistant", "tool": "price_of", "args": {"item": "coffee"}}, "Bad assistant message: " + repr(m[1])
assert m[2] == {"role": "tool", "name": "price_of", "content": 120}, "Bad tool message: " + repr(m[2])
assert len(m) == 5, "Expected 5 messages (user + 2x(assistant, tool)), got " + str(len(m))
loop = lambda msgs: {"type": "tool", "name": "price_of", "args": {"item": "coffee"}}
r = run_agent(loop, TOOLS, "x", max_steps=4)
assert r["answer"] == "stopped: max steps reached" and r["steps"] == 4, "Max steps handling wrong: " + repr((r["answer"], r["steps"]))
seen = []
def bad(msgs):
    seen.append(len(msgs))
    return {"type": "tool", "name": "teleport", "args": {}} if len(seen) == 1 else {"type": "final", "text": msgs[-1]["content"]}
r = run_agent(bad, TOOLS, "x")
assert r["answer"] == "error: unknown tool teleport", "Unknown tools should produce an error observation, got " + repr(r["answer"])
print("✅ All checks passed!")
`},
project:{title:"Your first real agent (no framework)",
desc:"Upgrade Week 9's tool loop into a general agent: a system instruction, 3 tools (today's date, a notes-file reader, a date calculator), a step limit and a printed trace.",
steps:["Write 3 tools with clear docstrings: today(), read_note(name), days_between(start, end).","Loop until the model stops calling tools, or 8 steps.","Print a trace line for every step: tool, args, result (truncated).","Give it multi-step tasks: “How many days until my exam in note exam.txt?”"],
code:{gemini:py`# Gemini's chat helper can run Python functions for you (automatic function calling).
# Great to see the loop working end-to-end before you write your own.
import datetime, pathlib
from google import genai
from google.genai import types

def today() -> str:
    """Return today's date in ISO format (YYYY-MM-DD)."""
    return datetime.date.today().isoformat()

def read_note(name: str) -> str:
    """Read a note from the notes/ folder by file name, e.g. 'exam.txt'."""
    p = pathlib.Path("notes") / pathlib.Path(name).name     # no path tricks
    return p.read_text() if p.exists() else f"error: no note called {name}"

def days_between(start: str, end: str) -> int:
    """Number of days between two ISO dates (end - start)."""
    return (datetime.date.fromisoformat(end) - datetime.date.fromisoformat(start)).days

client = genai.Client()
chat = client.chats.create(
    model="gemini-flash-latest",
    config=types.GenerateContentConfig(
        system_instruction="You are a helpful agent. Use tools; don't guess dates.",
        tools=[today, read_note, days_between],
        automatic_function_calling=types.AutomaticFunctionCallingConfig(maximum_remote_calls=8),
    ),
)
resp = chat.send_message("How many days until the exam mentioned in exam.txt?")
print(resp.text)
for turn in resp.automatic_function_calling_history or []:   # the trace
    for part in turn.parts:
        if part.function_call:
            print("  called:", part.function_call.name, dict(part.function_call.args))
`,
openai:py`import datetime, json, pathlib
from openai import OpenAI

def today() -> str: return datetime.date.today().isoformat()
def read_note(name: str) -> str:
    p = pathlib.Path("notes") / pathlib.Path(name).name
    return p.read_text() if p.exists() else f"error: no note called {name}"
def days_between(start: str, end: str) -> int:
    return (datetime.date.fromisoformat(end) - datetime.date.fromisoformat(start)).days
FUNCS = {"today": today, "read_note": read_note, "days_between": days_between}

def fn(name, desc, props):
    return {"type": "function", "name": name, "description": desc, "strict": True,
            "parameters": {"type": "object", "properties": props,
                           "required": list(props), "additionalProperties": False}}
tools = [fn("today", "Today's date (YYYY-MM-DD).", {}),
         fn("read_note", "Read a note file from notes/.", {"name": {"type": "string"}}),
         fn("days_between", "Days between two ISO dates.", {"start": {"type": "string"}, "end": {"type": "string"}})]

client = OpenAI()
items = [{"role": "user", "content": "How many days until the exam mentioned in exam.txt?"}]
for step in range(8):
    resp = client.responses.create(model="gpt-6-luna", input=items, tools=tools,
                                   instructions="You are a helpful agent. Use tools; don't guess dates.")
    calls = [o for o in resp.output if o.type == "function_call"]
    if not calls:
        print(resp.output_text); break
    items += resp.output
    for c in calls:
        result = FUNCS[c.name](**json.loads(c.arguments))
        print(f"  step {step}: {c.name}({c.arguments}) -> {str(result)[:60]}")
        items.append({"type": "function_call_output", "call_id": c.call_id, "output": json.dumps(result)})
`,
anthropic:py`import datetime, json, pathlib
import anthropic

def today() -> str: return datetime.date.today().isoformat()
def read_note(name: str) -> str:
    p = pathlib.Path("notes") / pathlib.Path(name).name
    return p.read_text() if p.exists() else f"error: no note called {name}"
def days_between(start: str, end: str) -> int:
    return (datetime.date.fromisoformat(end) - datetime.date.fromisoformat(start)).days
FUNCS = {"today": today, "read_note": read_note, "days_between": days_between}

def tool(name, desc, props):
    return {"name": name, "description": desc,
            "input_schema": {"type": "object", "properties": props, "required": list(props)}}
tools = [tool("today", "Today's date (YYYY-MM-DD).", {}),
         tool("read_note", "Read a note file from notes/.", {"name": {"type": "string"}}),
         tool("days_between", "Days between two ISO dates.", {"start": {"type": "string"}, "end": {"type": "string"}})]

client = anthropic.Anthropic()
messages = [{"role": "user", "content": "How many days until the exam mentioned in exam.txt?"}]
for step in range(8):
    resp = client.messages.create(model="claude-sonnet-5-5", max_tokens=1024, tools=tools,
                                  system="You are a helpful agent. Use tools; don't guess dates.",
                                  messages=messages)
    if resp.stop_reason != "tool_use":
        print(next(b.text for b in resp.content if b.type == "text")); break
    messages.append({"role": "assistant", "content": resp.content})
    results = []
    for b in resp.content:
        if b.type == "tool_use":
            out = FUNCS[b.name](**b.input)
            print(f"  step {step}: {b.name}({b.input}) -> {str(out)[:60]}")
            results.append({"type": "tool_result", "tool_use_id": b.id, "content": json.dumps(out)})
    messages.append({"role": "user", "content": results})
`}}
});
})();
