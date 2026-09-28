(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
const tools = py`
@function_tool
def lookup_invoice(invoice_id: str) -> str:
    """Look up the status and amount of an invoice by its id, e.g. 'INV-42'."""
    return {"INV-42": "Paid ₹999 on 3 Sep; duplicate charge detected"}.get(invoice_id, "not found")

@function_tool
def known_issues(product: str) -> str:
    """Return known issues and fixes for a product name."""
    return "v2.3 crashes on login with old cache; fix: clear cache or update to v2.4"

billing_agent = Agent(name="Billing", model=model, tools=[lookup_invoice],
                      instructions="You handle payments, invoices and refunds. Be concise.")
tech_agent = Agent(name="Tech support", model=model, tools=[known_issues],
                   instructions="You troubleshoot app problems step by step.")
triage_agent = Agent(name="Triage", model=model, handoffs=[billing_agent, tech_agent],
                     instructions="Route billing questions to Billing and technical problems to Tech support.")

for msg in ["I was charged twice for INV-42", "The app crashes when I log in"]:
    result = Runner.run_sync(triage_agent, msg)
    print(f"[{result.last_agent.name}] {result.final_output}\n")
`;
W.push({
id:20, phase:6, title:"OpenAI Agents SDK: multi-agent handoffs",
goal:"Learn the OpenAI Agents SDK's small set of primitives — Agent, Runner, function tools, handoffs, guardrails, tracing — and run it with Gemini or Claude via LiteLLM.",
plan:[["25m","Read"],["10m","Quiz"],["45m","Exercise"],["40m","Mini project"]],
analogy:"Calling a big company's helpline: a receptionist (triage agent) listens, then transfers you to billing or tech support (handoff). Each specialist has their own manual and tools, so they're good at their one job — and the receptionist doesn't need to know how to issue refunds.",
why:"Handoffs are the simplest practical form of multi-agent design. Small, focused agents are easier to prompt, test and improve than one giant agent with 30 tools and a 5-page instruction manual.",
explain:`
<p>The <b>OpenAI Agents SDK</b> (<code>pip install openai-agents</code>, imported as <code>agents</code>) is a lightweight framework built on a handful of ideas:</p>
<ul>
<li><b>Agent</b> — a model + instructions + tools. That's it.</li>
<li><b>Runner</b> — runs the agent loop for you (<code>Runner.run_sync(agent, "question")</code>) and returns <code>result.final_output</code>. This is your Week 15 loop, packaged.</li>
<li><b>Function tools</b> — decorate a Python function with <code>@function_tool</code>; the schema is generated from its type hints and docstring (you'll build that generator in Week 21!).</li>
<li><b>Handoffs</b> — an agent can transfer the conversation to another, more specialised agent.</li>
<li><b>Guardrails</b> — checks that run alongside the agent on input/output and can stop the run (more in Week 24).</li>
<li><b>Tracing</b> — every run is recorded so you can inspect each step.</li>
</ul>
<p>It's designed for OpenAI models but can use other providers through <b>LiteLLM</b> (a library that speaks to 100+ model providers through one interface). With <code>pip install "openai-agents[litellm]"</code> you can run it on your <b>free Gemini key</b>. When not using an OpenAI key, turn off the built-in trace upload (it sends traces to OpenAI's dashboard).</p>
<p><b>Handoff vs agent-as-tool:</b> with a handoff, the specialist <i>takes over</i> the conversation. With agent-as-tool, the main agent <i>asks</i> the specialist a question and stays in charge (like phoning a colleague for advice). Both exist in the SDK.</p>`,
concepts:[["Agent (SDK)","Model + instructions + tools, as one object."],["Runner","Executes the agent loop and returns the final output."],["@function_tool","Decorator turning a typed Python function into a tool."],["Handoff","Transferring the conversation to another specialised agent."],["Agent-as-tool","Calling another agent like a function while staying in control."],["LiteLLM","A library that lets one interface talk to many model providers."]],
resources:[
 {t:"OpenAI Agents SDK docs",u:"https://openai.github.io/openai-agents-python/",type:"docs"},
 {t:"Agents SDK: Handoffs",u:"https://openai.github.io/openai-agents-python/handoffs/",type:"docs"},
 {t:"Agents SDK: Using any model via LiteLLM",u:"https://openai.github.io/openai-agents-python/models/litellm/",type:"docs"},
 {t:"openai-agents-python on GitHub (examples)",u:"https://github.com/openai/openai-agents-python",type:"code"}
],
quiz:[
 {q:"What does Runner.run_sync(agent, input) do?",o:["Only formats the prompt","Runs the full agent loop (tool calls, handoffs) and returns a result","Deploys to the cloud","Trains the agent"],a:1,e:"The Runner handles the loop you wrote in Week 15."},
 {q:"How does @function_tool know the tool's parameters?",o:["You write JSON by hand","From the function's type hints and docstring","It guesses","From a YAML file"],a:1,e:"The SDK inspects the signature — you'll build this yourself next week."},
 {q:"What is a handoff?",o:["Passing an API key","One agent transferring control of the conversation to another agent","Sending an email","Ending the program"],a:1,e:"Handoffs let a triage agent delegate to specialists."},
 {q:"Can the Agents SDK use Gemini or Claude?",o:["No, OpenAI only","Yes, through the LiteLLM integration","Only in JavaScript","Only for images"],a:1,e:"Install openai-agents[litellm] and use LitellmModel."},
 {q:"Difference between a handoff and agent-as-tool?",o:["No difference","Handoff: specialist takes over. Agent-as-tool: main agent asks and stays in charge","Agent-as-tool is only for images","Handoffs are slower always"],a:1,e:"Choose based on who should own the conversation afterwards."}
],
exercise:{title:"Simulate triage & handoffs",
task:`<p>Model a handoff system without any LLM. An <b>agent</b> is a dict <code>{"name": str, "respond": fn}</code> where <code>respond(message)</code> returns either <code>{"final": text}</code> or <code>{"handoff": other_agent_name}</code>.</p>
<p>Implement <code>run_with_handoffs(agents, start, message, max_handoffs=3)</code>:</p>
<ul><li><code>agents</code> is a dict name → agent. Begin with <code>start</code>.</li>
<li>Follow handoffs until an agent returns <code>final</code>. Return <code>{"output": text, "path": [names visited in order]}</code>.</li>
<li>If a handoff targets an unknown agent, raise <code>KeyError</code>. If more than <code>max_handoffs</code> handoffs happen, raise <code>RuntimeError</code>.</li></ul>
<p>Also write <code>triage_respond(message)</code> that hands off to <code>"billing"</code> if the message mentions refund/invoice/charge, to <code>"tech"</code> if it mentions error/crash/bug, else returns <code>{"final": "How can I help?"}</code> (case-insensitive).</p>`,
starter:py`def triage_respond(message):
    pass

def run_with_handoffs(agents, start, message, max_handoffs=3):
    pass

AGENTS = {
    "triage":  {"name": "triage",  "respond": triage_respond},
    "billing": {"name": "billing", "respond": lambda m: {"final": "Refund issued."}},
    "tech":    {"name": "tech",    "respond": lambda m: {"final": "Try restarting the app."}},
}
print(run_with_handoffs(AGENTS, "triage", "I was charged twice!"))
`,
solution:py`def triage_respond(message):
    m = message.lower()
    if any(w in m for w in ("refund", "invoice", "charge")):
        return {"handoff": "billing"}
    if any(w in m for w in ("error", "crash", "bug")):
        return {"handoff": "tech"}
    return {"final": "How can I help?"}

def run_with_handoffs(agents, start, message, max_handoffs=3):
    current, path, handoffs = start, [], 0
    while True:
        agent = agents[current]
        path.append(agent["name"])
        reply = agent["respond"](message)
        if "final" in reply:
            return {"output": reply["final"], "path": path}
        handoffs += 1
        if handoffs > max_handoffs:
            raise RuntimeError("too many handoffs")
        current = reply["handoff"]
        if current not in agents:
            raise KeyError(current)
`,
tests:py`AG = {"triage": {"name": "triage", "respond": triage_respond},
      "billing": {"name": "billing", "respond": lambda m: {"final": "Refund issued."}},
      "tech": {"name": "tech", "respond": lambda m: {"final": "Try restarting the app."}}}
assert triage_respond("Please REFUND me") == {"handoff": "billing"}, "refund -> billing"
assert triage_respond("App crashed on start") == {"handoff": "tech"}, "crash -> tech"
assert triage_respond("hello there") == {"final": "How can I help?"}
r = run_with_handoffs(AG, "triage", "I was charged twice!")
assert r == {"output": "Refund issued.", "path": ["triage", "billing"]}, "Got " + repr(r)
assert run_with_handoffs(AG, "triage", "hi") == {"output": "How can I help?", "path": ["triage"]}
ping = {"a": {"name": "a", "respond": lambda m: {"handoff": "b"}}, "b": {"name": "b", "respond": lambda m: {"handoff": "a"}}}
try:
    run_with_handoffs(ping, "a", "x", max_handoffs=3); assert False, "Should raise RuntimeError on handoff loops"
except RuntimeError:
    pass
lost = {"a": {"name": "a", "respond": lambda m: {"handoff": "nobody"}}}
try:
    run_with_handoffs(lost, "a", "x"); assert False, "Unknown handoff target should raise KeyError"
except KeyError:
    pass
print("✅ All checks passed!")
`},
project:{title:"Customer-support triage with the Agents SDK",
desc:"Build a triage agent that hands off to billing and tech agents, each with one function tool. Run it on Gemini via LiteLLM (free), on Claude via LiteLLM, or natively on OpenAI.",
steps:["pip install \"openai-agents[litellm]\".","Create billing_agent (tool: lookup_invoice) and tech_agent (tool: known_issues).","Create triage_agent with handoffs=[billing_agent, tech_agent].","Run 4 test messages and print result.final_output and result.last_agent.name."],
code:{gemini: py`# pip install "openai-agents[litellm]"   — uses your free GEMINI_API_KEY
import os
from agents import Agent, Runner, function_tool, set_tracing_disabled
from agents.extensions.models.litellm_model import LitellmModel

set_tracing_disabled(True)          # trace upload needs an OpenAI key
model = LitellmModel(model="gemini/gemini-flash-latest", api_key=os.environ["GEMINI_API_KEY"])
` + tools,
openai: py`# pip install openai-agents   — uses OPENAI_API_KEY (traces appear in the OpenAI dashboard)
from agents import Agent, Runner, function_tool

model = "gpt-6-luna"
` + tools,
anthropic: py`# pip install "openai-agents[litellm]"   — uses ANTHROPIC_API_KEY
import os
from agents import Agent, Runner, function_tool, set_tracing_disabled
from agents.extensions.models.litellm_model import LitellmModel

set_tracing_disabled(True)
model = LitellmModel(model="anthropic/claude-sonnet-5-5", api_key=os.environ["ANTHROPIC_API_KEY"])
` + tools}}
});
})();
