(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
const lgCommon = (llmDef) => py`from typing import TypedDict
from langgraph.graph import StateGraph, START, END
` + llmDef + py`

class State(TypedDict, total=False):
    topic: str
    draft: str
    feedback: str
    rounds: int
    approved: bool

def draft(state: State) -> dict:
    prompt = f"Write a 100-word blog intro about {state['topic']}."
    if state.get("feedback"):
        prompt += f"\nImprove this draft using the feedback.\nDraft: {state['draft']}\nFeedback: {state['feedback']}"
    return {"draft": llm(prompt), "rounds": state.get("rounds", 0) + 1}

def review(state: State) -> dict:
    fb = llm(f"Critique this intro in one sentence. Reply APPROVED if it's excellent.\n{state['draft']}")
    return {"feedback": fb, "approved": "APPROVED" in fb.upper()}

def route(state: State) -> str:
    return "done" if state["approved"] or state["rounds"] >= 3 else "revise"

g = StateGraph(State)
g.add_node("draft", draft)
g.add_node("review", review)
g.add_edge(START, "draft")
g.add_edge("draft", "review")
g.add_conditional_edges("review", route, {"revise": "draft", "done": END})
app = g.compile()

result = app.invoke({"topic": "learning Python at 40"})
print(result["rounds"], "rounds\n", result["draft"])
print(app.get_graph().draw_mermaid())      # paste into mermaid.live to see the graph
`;
W.push({
id:19, phase:6, title:"LangGraph: agents as graphs",
goal:"Understand LangGraph's model — shared state, nodes, edges and conditional edges — and build a small graph with a loop.",
plan:[["25m","Read"],["10m","Quiz"],["45m","Exercise"],["40m","Mini project"]],
analogy:"A LangGraph app is like a board game. The shared state is the game board everyone can see. Each node is a square where something happens (“draw a card”, “write a draft”). Edges are the arrows between squares, and a conditional edge is a fork where a rule decides which way you go (“if the reviewer approved, go to FINISH; otherwise go back to DRAFT”).",
why:"Frameworks save you from rebuilding the same plumbing — saving progress, streaming, retries, pausing for human approval. LangGraph is one of the most widely used choices for production agents because the flow is explicit, visual and testable.",
explain:`
<p>You've now built agents by hand. <b>Frameworks</b> package the same ideas with extras: persistence, streaming, retries, human-in-the-loop, tracing. Learn the concepts first (done ✅), then pick a framework for productivity.</p>
<p><b>LangGraph</b> (from the LangChain team) models an app as a <b>graph</b>:</p>
<ul>
<li><b>State</b> — a shared dictionary (e.g. <code>{"draft": ..., "feedback": ..., "rounds": 0}</code>) passed around.</li>
<li><b>Nodes</b> — ordinary Python functions that take the state and return <b>updates</b> to it. A node can call an LLM, a tool, anything.</li>
<li><b>Edges</b> — which node runs next. <b>Conditional edges</b> call a small function that looks at the state and picks the next node — this is how loops and branches happen.</li>
<li><b>START / END</b> — special markers for entry and exit.</li>
</ul>
<p>Your evaluator-optimizer from last week becomes: <code>START → draft → review →(approved? END : draft)</code>. Because the flow is explicit, it's easy to visualise, test and control. LangGraph also supports <b>checkpointing</b> (saving state after every step) so an agent can pause for human approval and resume later — even days later.</p>
<p>LangGraph works with any model: call Gemini, OpenAI or Claude inside your nodes exactly as you already do.</p>
<div class="callout">This week you'll implement a mini graph runner yourself — then LangGraph's real API will feel instantly familiar.</div>`,
concepts:[["State","A shared dict that nodes read and update."],["Node","A function: state in → partial state update out."],["Edge","A fixed connection saying which node runs next."],["Conditional edge","A router function choosing the next node from the state."],["Checkpointer","Saves graph state so runs can pause, resume or be replayed."],["Human-in-the-loop","Pausing for a person to approve or edit before continuing."]],
resources:[
 {t:"LangGraph docs: Overview",u:"https://docs.langchain.com/oss/python/langgraph/overview",type:"docs"},
 {t:"Introduction to LangGraph — LangChain Academy (free)",u:"https://academy.langchain.com/courses/intro-to-langgraph",type:"course"},
 {t:"AI Agents in LangGraph — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/",type:"course"},
 {t:"LangGraph on GitHub",u:"https://github.com/langchain-ai/langgraph",type:"code"}
],
quiz:[
 {q:"In LangGraph, what does a node return?",o:["A new graph","Updates to the shared state","An HTTP response","Nothing"],a:1,e:"Nodes return partial state updates that get merged into the state."},
 {q:"How are loops (e.g. revise until good) expressed?",o:["With while-loops inside the framework","With conditional edges that can route back to an earlier node","They can't be","With recursion limits only"],a:1,e:"A conditional edge from ‘review’ can point back to ‘draft’."},
 {q:"What's a checkpointer useful for?",o:["Styling output","Saving state so runs can pause for human approval and resume","Counting tokens","Embedding documents"],a:1,e:"Persistence enables human-in-the-loop and recovery."},
 {q:"Why learn the loop by hand before using a framework?",o:["Frameworks are banned","So the framework isn't ‘magic’ and you can debug it","Hand-written code is always better","It's not useful"],a:1,e:"Understanding the underlying loop makes framework behaviour predictable."},
 {q:"START and END in a LangGraph graph are…",o:["Special markers for entry and exit points","Tools","LLM models","Error types"],a:0,e:"Edges from START define where the run begins; routing to END finishes it."}
],
exercise:{title:"Build a mini state-graph runner",
task:`<p>Implement class <code>MiniGraph</code> (a tiny LangGraph clone):</p>
<ul><li><code>add_node(name, fn)</code> — fn(state) returns a dict of updates.</li>
<li><code>add_edge(src, dst)</code> — after src, go to dst (dst may be <code>END</code>).</li>
<li><code>add_conditional_edges(src, router)</code> — after src, go to <code>router(state)</code>.</li>
<li><code>run(state, start, max_steps=25)</code> — begin at node <code>start</code>. Each step: run node, merge updates into a <b>new</b> dict (<code>{**state, **updates}</code>), append the node name to <code>state["_path"]</code> (a list), then follow the edge. Stop at <code>END</code> and return the final state. Raise <code>RuntimeError</code> if more than <code>max_steps</code> nodes run, or if a node has no outgoing edge. Don't modify the caller's dict.</li></ul>`,
starter:py`END = "__end__"

class MiniGraph:
    def __init__(self):
        self.nodes, self.edges, self.routers = {}, {}, {}

    def add_node(self, name, fn):
        pass

    def add_edge(self, src, dst):
        pass

    def add_conditional_edges(self, src, router):
        pass

    def run(self, state, start, max_steps=25):
        pass

# draft -> review -> (good enough? END : draft)
g = MiniGraph()
g.add_node("draft", lambda s: {"text": s.get("text", "") + "+", "rounds": s.get("rounds", 0) + 1})
g.add_node("review", lambda s: {"ok": len(s["text"]) >= 3})
g.add_edge("draft", "review")
g.add_conditional_edges("review", lambda s: END if s["ok"] else "draft")
print(g.run({}, "draft"))
`,
solution:py`END = "__end__"

class MiniGraph:
    def __init__(self):
        self.nodes, self.edges, self.routers = {}, {}, {}

    def add_node(self, name, fn):
        self.nodes[name] = fn

    def add_edge(self, src, dst):
        self.edges[src] = dst

    def add_conditional_edges(self, src, router):
        self.routers[src] = router

    def run(self, state, start, max_steps=25):
        state = {**state, "_path": list(state.get("_path", []))}
        current, steps = start, 0
        while current != END:
            steps += 1
            if steps > max_steps:
                raise RuntimeError("max steps exceeded")
            updates = self.nodes[current](state) or {}
            state = {**state, **updates}
            state["_path"] = state["_path"] + [current]
            if current in self.routers:
                current = self.routers[current](state)
            elif current in self.edges:
                current = self.edges[current]
            else:
                raise RuntimeError(f"node {current} has no outgoing edge")
        return state
`,
tests:py`g = MiniGraph()
g.add_node("draft", lambda s: {"text": s.get("text", "") + "+", "rounds": s.get("rounds", 0) + 1})
g.add_node("review", lambda s: {"ok": len(s["text"]) >= 3})
g.add_edge("draft", "review")
g.add_conditional_edges("review", lambda s: END if s["ok"] else "draft")
init = {"topic": "cats"}
out = g.run(init, "draft")
assert out is not None, "run() returned None"
assert out["text"] == "+++" and out["rounds"] == 3, "Loop should run draft 3 times, got " + repr(out)
assert out["_path"] == ["draft", "review"] * 3, "Path wrong: " + repr(out.get("_path"))
assert out["topic"] == "cats", "Existing state keys must be kept"
assert init == {"topic": "cats"}, "Don't mutate the caller's initial state"
loop = MiniGraph(); loop.add_node("a", lambda s: {}); loop.add_edge("a", "a")
try:
    loop.run({}, "a", max_steps=5); assert False, "Should raise RuntimeError on runaway loops"
except RuntimeError:
    pass
dead = MiniGraph(); dead.add_node("x", lambda s: {"v": 1})
try:
    dead.run({}, "x"); assert False, "Should raise RuntimeError when a node has no edge"
except RuntimeError:
    pass
lin = MiniGraph(); lin.add_node("a", lambda s: {"n": 1}); lin.add_node("b", lambda s: {"n": s["n"] + 1})
lin.add_edge("a", "b"); lin.add_edge("b", END)
assert lin.run({}, "a")["n"] == 2
print("✅ All checks passed!")
`},
project:{title:"Draft → review loop in real LangGraph",
desc:"Rebuild your evaluator-optimizer with LangGraph: a typed State, draft and review nodes calling the LLM, and a conditional edge that loops at most 3 times.",
steps:["pip install langgraph (plus your provider SDK).","Define State as a TypedDict with topic, draft, feedback, rounds, approved.","Add nodes + edges, compile, invoke({'topic': ...}).","Paste the printed Mermaid diagram into mermaid.live to see your graph."],
code:{
gemini: lgCommon(py`from google import genai

client = genai.Client()
def llm(p): return client.models.generate_content(model="gemini-flash-latest", contents=p).text`),
openai: lgCommon(py`from openai import OpenAI

client = OpenAI()
def llm(p): return client.responses.create(model="gpt-6-luna", input=p).output_text`),
anthropic: lgCommon(py`import anthropic

client = anthropic.Anthropic()
def llm(p):
    r = client.messages.create(model="claude-sonnet-5-5", max_tokens=800,
                               messages=[{"role": "user", "content": p}])
    return next(b.text for b in r.content if b.type == "text")`)
}}
});
})();
