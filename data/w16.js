(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
W.push({
id:16, phase:5, title:"Tool design & the ReAct pattern",
goal:"Design tools agents can use well, and understand ReAct (Reason + Act) — the ‘Thought → Action → Observation’ pattern behind most agents.",
plan:[["25m","Read"],["10m","Quiz"],["45m","Exercise"],["40m","Mini project"]],
analogy:"ReAct is how a careful person solves a puzzle out loud: “I think I need X (thought). Let me look it up (action). It says Y (observation). So now I need Z…” Tools are like the gadgets on a Swiss-army knife: a few well-labelled blades beat fifty mystery attachments.",
why:"Most agent failures aren't the model being ‘dumb’ — they're confusing tools, vague descriptions and unhelpful error messages. Designing tools well is the cheapest way to make agents dramatically more reliable.",
explain:`
<p><b>ReAct</b> (short for <i>Reason + Act</i>) is the classic agent pattern. The model alternates between writing a short <b>Thought</b> (“I need the price first”), an <b>Action</b> (a tool call) and reading the <b>Observation</b> (the tool result), until it writes a <b>Final Answer</b>.</p>
<pre class="code">Thought: I need the current price of coffee.
Action: price_of[coffee]
Observation: 120
Thought: Now multiply by 3.
Action: calculator[120*3]
Observation: 360
Final Answer: 3 coffees cost ₹360.</pre>
<p>Before native tool calling existed, agents were built exactly like this — by asking the model to write in this format and <b>parsing its text</b>. Today APIs return structured tool calls, but the reasoning pattern is the same, and parsing model text robustly is still a useful skill.</p>
<p><b>Designing good tools</b> is the biggest lever on agent quality:</p>
<ul><li><b>Few, focused tools</b> with obvious names beat many overlapping ones.</li>
<li><b>Descriptions say when to use it</b>, what it returns and its limits — write them like instructions for a new colleague.</li>
<li><b>Simple arguments</b> — strings and numbers, with examples.</li>
<li><b>Helpful errors</b> — “city not found; try the English name” lets the agent recover instead of giving up.</li>
<li><b>Concise outputs</b> — return the useful 20 lines, not a 5,000-line dump that floods the context window.</li>
<li><b>Safe by design</b> — never let a tool run arbitrary code or touch things it doesn't need. This week's calculator only accepts arithmetic characters for exactly this reason.</li></ul>`,
concepts:[["ReAct","Reason + Act: interleaving thoughts, tool actions and observations."],["Thought","The model's short reasoning about what to do next."],["Action","A tool invocation, e.g. search[query]."],["Observation","The tool's result fed back to the model."],["Tool ergonomics","Designing tool names, descriptions, arguments and errors for LLM use."],["Stop sequence","Text that makes the model stop generating, e.g. ‘Observation:’ so it can't invent results."]],
resources:[
 {t:"ReAct: Synergizing Reasoning and Acting (Google Research blog)",u:"https://research.google/blog/react-synergizing-reasoning-and-acting-in-language-models/",type:"article"},
 {t:"Building effective agents — Anthropic (tool design appendix)",u:"https://www.anthropic.com/engineering/building-effective-agents",type:"article"},
 {t:"Prompt Engineering Guide: ReAct",u:"https://www.promptingguide.ai/techniques/react",type:"guide"},
 {t:"Hugging Face Agents Course (Thought–Action–Observation unit)",u:"https://huggingface.co/learn/agents-course/unit1/introduction",type:"course"}
],
quiz:[
 {q:"ReAct stands for…",o:["React.js for agents","Reason + Act","Retrieve + Answer + Cite + Test","Real-time Action"],a:1,e:"The model reasons, acts via tools, observes, and repeats."},
 {q:"In ReAct, what is an Observation?",o:["The model's guess","The tool's result fed back to the model","The user's feedback","A log file"],a:1,e:"Observations are what the tools return."},
 {q:"Which tool description is best?",o:["“search”","“Does stuff.”","“Search the product catalogue by keyword. Returns up to 5 items with name, price and id. Use for any question about products we sell.”","“Tool 3”"],a:2,e:"It explains what, when, and what comes back."},
 {q:"A tool fails because the city name is misspelled. The best tool output is…",o:["Crash with a stack trace","An empty string","“error: city 'Londn' not found — check spelling or use the English name”","Nothing, silently"],a:2,e:"Actionable errors let the agent self-correct."},
 {q:"Why use a stop sequence like ‘Observation:’ in a text-based ReAct agent?",o:["To save money only","So the model stops before inventing a fake tool result, letting your code insert the real one","It's required by all APIs","To make answers longer"],a:1,e:"Otherwise the model may hallucinate the observation itself."}
],
exercise:{title:"Parse ReAct output & run a safe calculator",
task:`<p>Implement:</p>
<ul><li><code>parse_react(text)</code> → returns <code>("final", answer)</code> if a line starts with <code>Final Answer:</code>; otherwise the <b>last</b> line starting with <code>Action:</code> formatted as <code>tool[input]</code> → <code>("action", tool, input)</code>. Strip whitespace. If neither, raise <code>ValueError</code>.</li>
<li><code>calculator(expr)</code> that evaluates arithmetic using only digits, spaces and <code>+ - * / ( ) .</code>; anything else (or any error such as division by zero) → return the string <code>"error: invalid expression"</code>. (You may use <code>eval</code> only after this whitelist check.)</li></ul>`,
starter:py`import re

def parse_react(text):
    pass

def calculator(expr):
    pass

out = """Thought: I need to multiply.
Action: calculator[120 * 3]"""
print(parse_react(out))
print(calculator("120 * 3"), calculator("__import__('os')"))
`,
solution:py`import re

def parse_react(text):
    action = None
    for line in text.splitlines():
        line = line.strip()
        if line.startswith("Final Answer:"):
            return ("final", line[len("Final Answer:"):].strip())
        m = re.match(r"Action:\s*(\w+)\[(.*)\]\s*$", line)
        if m:
            action = ("action", m.group(1), m.group(2).strip())
    if action:
        return action
    raise ValueError("No action or final answer found")

def calculator(expr):
    if not re.fullmatch(r"[0-9+\-*/(). ]+", expr or ""):
        return "error: invalid expression"
    try:
        return eval(expr, {"__builtins__": {}}, {})
    except Exception:
        return "error: invalid expression"
`,
tests:py`r = parse_react("Thought: multiply\nAction: calculator[120 * 3]")
assert r == ("action", "calculator", "120 * 3"), "Basic action parse failed: " + repr(r)
assert parse_react("Thought: done\nFinal Answer:  360 rupees ") == ("final", "360 rupees"), "Final answer parse failed"
assert parse_react("Action: search[old]\nThought: hmm\nAction: search[ new query ]") == ("action", "search", "new query"), "Use the LAST action, stripped"
try:
    parse_react("I think the answer is 4"); assert False, "Should raise ValueError"
except ValueError:
    pass
assert calculator("120 * 3") == 360
assert calculator("(2 + 3) / 2") == 2.5
assert calculator("__import__('os')") == "error: invalid expression", "Letters must be rejected"
assert calculator("1 / 0") == "error: invalid expression", "Division by zero should return the error string"
assert calculator("") == "error: invalid expression"
print("✅ All checks passed!")
`},
project:{title:"Text-based ReAct agent from scratch",
desc:"Build an agent that uses only plain text (no native tool calling): a ReAct system prompt, your parser, and a loop that injects Observations. Compare with native tool calling from Week 15.",
steps:["Write a system prompt describing the format and 2 tools: calculator[expr] and lookup[term] (a small dict of facts).","Loop: generate → parse_react → run tool → append 'Observation: …' → repeat (max 6).","Use a stop sequence so the model can't invent observations.","Note which is more reliable for you: text ReAct or native tool calls."],
code:{gemini:py`from google import genai
from google.genai import types

SYSTEM = """Solve the task using this exact format:
Thought: <reasoning>
Action: <tool>[<input>]
(wait for Observation)
...
Final Answer: <answer>
Tools: calculator[arithmetic expression], lookup[term]"""
FACTS = {"coffee": "A coffee costs 120 rupees.", "tea": "A tea costs 40 rupees."}
TOOLS = {"calculator": calculator, "lookup": lambda t: FACTS.get(t.lower(), "no entry")}

client = genai.Client()
transcript = "Task: How much do 2 coffees and 3 teas cost?\n"
for _ in range(6):
    out = client.models.generate_content(
        model="gemini-flash-latest", contents=transcript,
        config=types.GenerateContentConfig(system_instruction=SYSTEM,
                                           stop_sequences=["Observation:"])).text
    transcript += out
    kind, *rest = parse_react(out)
    if kind == "final":
        print("ANSWER:", rest[0]); break
    tool, arg = rest
    transcript += f"\nObservation: {TOOLS[tool](arg)}\n"
print(transcript)
`,
openai:py`from openai import OpenAI

SYSTEM = """Solve the task using this exact format:
Thought: <reasoning>
Action: <tool>[<input>]
(wait for Observation)
...
Final Answer: <answer>
Tools: calculator[arithmetic expression], lookup[term]
Write only ONE Action per reply and stop; never write an Observation yourself."""
FACTS = {"coffee": "A coffee costs 120 rupees.", "tea": "A tea costs 40 rupees."}
TOOLS = {"calculator": calculator, "lookup": lambda t: FACTS.get(t.lower(), "no entry")}

client = OpenAI()
transcript = "Task: How much do 2 coffees and 3 teas cost?\n"
for _ in range(6):
    out = client.responses.create(model="gpt-6-luna", instructions=SYSTEM, input=transcript).output_text
    out = out.split("Observation:")[0]            # drop any invented observation
    transcript += out
    kind, *rest = parse_react(out)
    if kind == "final":
        print("ANSWER:", rest[0]); break
    tool, arg = rest
    transcript += f"\nObservation: {TOOLS[tool](arg)}\n"
print(transcript)
`,
anthropic:py`import anthropic

SYSTEM = """Solve the task using this exact format:
Thought: <reasoning>
Action: <tool>[<input>]
(wait for Observation)
...
Final Answer: <answer>
Tools: calculator[arithmetic expression], lookup[term]"""
FACTS = {"coffee": "A coffee costs 120 rupees.", "tea": "A tea costs 40 rupees."}
TOOLS = {"calculator": calculator, "lookup": lambda t: FACTS.get(t.lower(), "no entry")}

client = anthropic.Anthropic()
transcript = "Task: How much do 2 coffees and 3 teas cost?\n"
for _ in range(6):
    resp = client.messages.create(
        model="claude-sonnet-5-5", max_tokens=500, system=SYSTEM,
        stop_sequences=["Observation:"],
        messages=[{"role": "user", "content": transcript}])
    out = next(b.text for b in resp.content if b.type == "text")
    transcript += out
    kind, *rest = parse_react(out)
    if kind == "final":
        print("ANSWER:", rest[0]); break
    tool, arg = rest
    transcript += f"\nObservation: {TOOLS[tool](arg)}\n"
print(transcript)
`}}
});
})();
