(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
const body = py`
CARDS: dict[str, str] = {}

def add_flashcard(term: str, definition: str) -> dict:
    """Save a flashcard with a term and its plain-English definition."""
    CARDS[term.lower()] = definition
    return {"status": "saved", "total_cards": len(CARDS)}

def quiz_me(count: int = 3) -> dict:
    """Return up to count saved terms (without definitions) to quiz the user on."""
    return {"terms": list(CARDS)[:count]} if CARDS else {"error": "no flashcards yet"}

def check_answer(term: str, answer: str) -> dict:
    """Return the stored definition for a term so the user's answer can be compared."""
    d = CARDS.get(term.lower())
    return {"definition": d, "user_answer": answer} if d else {"error": f"unknown term {term}"}

root_agent = Agent(
    name="study_buddy",
    model=MODEL,
    description="Helps the user learn AI engineering terms with flashcards.",
    instruction=("You are a friendly study buddy. Save flashcards when the user shares terms. "
                 "When asked to quiz, use quiz_me, ask one term at a time, and use check_answer "
                 "to give kind, specific feedback."),
    tools=[add_flashcard, quiz_me, check_answer],
)
`;
W.push({
id:21, phase:6, title:"Google ADK & MCP: tools from anywhere",
goal:"Build an agent with Google's Agent Development Kit (ADK), use its dev UI, see how tool schemas are generated from Python functions, and understand MCP (Model Context Protocol).",
plan:[["25m","Read"],["10m","Quiz"],["45m","Exercise"],["40m","Mini project"]],
analogy:"MCP is like USB-C for AI. Before USB, every gadget needed its own special cable. Before MCP, every AI app needed its own custom code for every tool (GitHub, Slack, your database…). With MCP, a tool is packaged once as a ‘server’, and any MCP-capable app — ADK, the OpenAI Agents SDK, desktop assistants, code editors — can plug it in.",
why:"ADK gives you a polished, Gemini-first way to build and debug agents with a visual dev UI. MCP is fast becoming the standard way to connect agents to real systems, so understanding it lets you reuse hundreds of existing tool servers instead of writing everything yourself.",
explain:`
<p><b>Google's Agent Development Kit (ADK)</b> (<code>pip install google-adk</code>) is an open-source, code-first framework optimised for Gemini (but usable with other models). An ADK project is a folder with an <code>agent.py</code> that defines a <code>root_agent</code>:</p>
<ul>
<li><b>Agent</b> — <code>name</code>, <code>model</code>, <code>instruction</code>, <code>description</code> and <code>tools</code> (plain Python functions).</li>
<li><b>Dev tools</b> — <code>adk run my_agent</code> chats in the terminal; <code>adk web</code> opens a local browser UI showing each step, tool call and state — superb for learning.</li>
<li><b>Multi-agent</b> — sub-agents, and workflow agents like <code>SequentialAgent</code>, <code>ParallelAgent</code>, <code>LoopAgent</code> (the Week 18 patterns as ready-made building blocks).</li>
<li><b>Sessions & state</b> — built-in conversation state and memory services.</li>
</ul>
<p>Like the OpenAI SDK, ADK builds each tool's schema by <b>inspecting your function</b>: its name, docstring, parameter names, type hints and which parameters have defaults. That's why docstrings and type hints matter so much — they <i>are</i> the tool's documentation for the model. You'll write that inspector yourself this week.</p>
<h3>MCP in plain English</h3>
<p>An <b>MCP server</b> is a small program that offers <b>tools</b> (actions), <b>resources</b> (read-only data like files) and <b>prompts</b> (templates). An <b>MCP client</b> (your agent/app) connects to it — either by launching it locally (“stdio”) or over HTTP — asks “what can you do?”, and then lets the model call those tools. Writing a server with the official Python SDK is tiny:</p>
<pre class="code">from mcp.server.fastmcp import FastMCP
mcp = FastMCP("notes")

@mcp.tool()
def search_notes(query: str) -> str:
    """Search my notes for a keyword."""
    return "..."

mcp.run()</pre>
<div class="callout"><b>Safety note:</b> an MCP server runs with whatever access you give it. Only install servers you trust, and prefer read-only tools until you're confident.</div>`,
concepts:[["ADK","Google's open-source Agent Development Kit for building and running agents."],["root_agent","The entry-point agent ADK looks for in agent.py."],["adk web","Local dev UI to chat with and inspect your agent."],["Workflow agents","Sequential / Parallel / Loop agents that orchestrate sub-agents."],["Tool schema","The JSON description (name, params, types) generated from a function."],["MCP","Model Context Protocol: a standard way to plug tool servers into AI apps."],["MCP server / client","Server offers tools & data; client (your agent) connects and uses them."]],
resources:[
 {t:"Google ADK documentation",u:"https://google.github.io/adk-docs/",type:"docs"},
 {t:"ADK on GitHub (google/adk-python)",u:"https://github.com/google/adk-python",type:"code"},
 {t:"Model Context Protocol — official site",u:"https://modelcontextprotocol.io/",type:"docs"},
 {t:"MCP: Build Rich-Context AI Apps with Anthropic — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/mcp-build-rich-context-ai-apps-with-anthropic/",type:"course"}
],
quiz:[
 {q:"What must an ADK agent.py define?",o:["main()","root_agent","app = FastAPI()","A Dockerfile"],a:1,e:"ADK looks for root_agent as the entry point."},
 {q:"What does adk web give you?",o:["Cloud hosting","A local browser UI to chat with and inspect your agent's steps","A website builder","Model training"],a:1,e:"It's a development/debugging UI, not for production."},
 {q:"How does ADK decide a tool parameter is required?",o:["Randomly","It has no default value in the function signature","It's the first parameter","It's a string"],a:1,e:"Parameters without defaults are required; defaults make them optional."},
 {q:"MCP is best described as…",o:["A new LLM","An open protocol so tool/data servers work with many AI clients","A vector database","A prompt template"],a:1,e:"Build a tool server once, use it from any MCP-capable client."},
 {q:"Which ADK agent type runs sub-agents one after another?",o:["LoopAgent","ParallelAgent","SequentialAgent","RouterAgent"],a:2,e:"SequentialAgent = prompt chaining with agents."}
],
exercise:{title:"Generate a tool schema from a Python function",
task:`<p>Implement <code>function_to_schema(fn)</code> like ADK / Agents SDK do, using <code>inspect</code>:</p>
<ul><li><code>name</code> = function name; <code>description</code> = first line of the docstring (stripped; <code>""</code> if none).</li>
<li><code>parameters</code> = <code>{"type": "object", "properties": {...}, "required": [...]}</code>.</li>
<li>Map annotations: <code>str→"string"</code>, <code>int→"integer"</code>, <code>float→"number"</code>, <code>bool→"boolean"</code>, <code>list→"array"</code>, <code>dict→"object"</code>. Missing/other annotations → <code>"string"</code>.</li>
<li>Each property is <code>{"type": ...}</code>. <code>required</code> lists (in signature order) params with <b>no default</b>.</li></ul>
<p>Hint: <code>inspect.signature(fn).parameters</code>, <code>p.annotation</code>, <code>p.default is inspect.Parameter.empty</code>, <code>inspect.getdoc(fn)</code>.</p>`,
starter:py`import inspect

TYPE_MAP = {str: "string", int: "integer", float: "number", bool: "boolean", list: "array", dict: "object"}

def function_to_schema(fn):
    sig = inspect.signature(fn)
    pass

def get_weather(city: str, days: int = 1, metric: bool = True) -> dict:
    """Get the weather forecast for a city.

    Longer explanation that should NOT be in the description.
    """
    return {}

import json
print(json.dumps(function_to_schema(get_weather), indent=2))
`,
solution:py`import inspect

TYPE_MAP = {str: "string", int: "integer", float: "number", bool: "boolean", list: "array", dict: "object"}

def function_to_schema(fn):
    sig = inspect.signature(fn)
    doc = inspect.getdoc(fn) or ""
    props, required = {}, []
    for name, p in sig.parameters.items():
        props[name] = {"type": TYPE_MAP.get(p.annotation, "string")}
        if p.default is inspect.Parameter.empty:
            required.append(name)
    return {"name": fn.__name__,
            "description": doc.splitlines()[0].strip() if doc else "",
            "parameters": {"type": "object", "properties": props, "required": required}}
`,
tests:py`def get_weather(city: str, days: int = 1, metric: bool = True) -> dict:
    """Get the weather forecast for a city.

    More details here.
    """
s = function_to_schema(get_weather)
assert s is not None, "function_to_schema returned None"
assert s["name"] == "get_weather"
assert s["description"] == "Get the weather forecast for a city.", "Description should be the first docstring line, got " + repr(s["description"])
assert s["parameters"] == {"type": "object", "properties": {"city": {"type": "string"}, "days": {"type": "integer"}, "metric": {"type": "boolean"}}, "required": ["city"]}, "Parameters wrong: " + repr(s["parameters"])
def mixed(a, b: float, c: list, d: dict = None, e: set = None):
    pass
s2 = function_to_schema(mixed)
assert s2["description"] == "", "No docstring -> empty description"
assert s2["parameters"]["properties"] == {"a": {"type": "string"}, "b": {"type": "number"}, "c": {"type": "array"}, "d": {"type": "object"}, "e": {"type": "string"}}, "Type mapping wrong: " + repr(s2["parameters"]["properties"])
assert s2["parameters"]["required"] == ["a", "b", "c"], "Required should be params without defaults"
print("✅ All checks passed!")
`},
project:{title:"A study-buddy agent in ADK (with the dev UI)",
desc:"Create an ADK agent with three tools (save a flashcard, quiz me, check my answer), chat with it in adk web, and inspect every tool call.",
steps:["pip install google-adk, then run: adk create study_buddy (choose Gemini and paste your key — it's written to study_buddy/.env).","Replace study_buddy/agent.py with the code below (keep __init__.py, which contains: from . import agent).","From the parent folder run: adk web  → open http://localhost:8000 and select study_buddy.","Open the events/trace view to see each tool call. Then try adk run study_buddy for a terminal chat.","Bonus: write the tiny FastMCP notes server from the explanation and connect it to your agent using ADK's MCP toolset (see the ADK docs ‘MCP tools’ page)."],
code:{gemini: py`# study_buddy/agent.py
# study_buddy/.env  ->  GOOGLE_GENAI_USE_VERTEXAI=FALSE
#                       GOOGLE_API_KEY=your-ai-studio-key
from google.adk.agents import Agent

MODEL = "gemini-flash-latest"
` + body,
openai: py`# Same ADK agent on an OpenAI model via LiteLLM:
#   pip install google-adk litellm      and put OPENAI_API_KEY=... in study_buddy/.env
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

MODEL = LiteLlm(model="openai/gpt-6-luna")
` + body,
anthropic: py`# Same ADK agent on Claude via LiteLLM:
#   pip install google-adk litellm      and put ANTHROPIC_API_KEY=... in study_buddy/.env
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

MODEL = LiteLlm(model="anthropic/claude-sonnet-5-5")
` + body}}
});
})();
