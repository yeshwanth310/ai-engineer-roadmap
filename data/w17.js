(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
W.push({
id:17, phase:5, title:"Agent memory: short-term & long-term",
goal:"Give agents memory: a short-term window, a running summary of older turns, and a long-term store of facts retrieved when relevant.",
plan:[["20m","Read"],["10m","Quiz"],["50m","Exercise"],["40m","Mini project"]],
analogy:"Your own memory works in layers. Short-term memory is what's on your desk right now. A summary is the sticky note you write at the end of a meeting (“Riya wants the report by Friday”). Long-term memory is your filing cabinet — you don't carry it around, you go and fetch the right folder when you need it.",
why:"Without memory, every conversation starts from zero and users have to repeat themselves. With careless memory, the context window overflows, costs balloon, or private details leak. Getting memory right is what makes an assistant feel personal and trustworthy.",
explain:`
<p>Since models are stateless (Week 5), “memory” is something <b>your app</b> builds and feeds back into the prompt. There are layers:</p>
<ul>
<li><b>Short-term (working) memory</b> — the recent conversation and tool results for the current task. Kept in the prompt directly.</li>
<li><b>Summary memory</b> — when the conversation gets long, older turns are compressed into a short summary by the LLM (“User is planning a Goa trip in March, budget ₹40k, vegetarian”). Keeps key facts, drops the chatter.</li>
<li><b>Long-term memory</b> — facts saved across sessions (“prefers short answers”, “works in Python”), stored in a database or vector store and <b>retrieved</b> when relevant — RAG over the agent's own experiences.</li>
</ul>
<p>Deciding <b>what</b> to remember is the hard part. Common approaches: let the agent call a <code>save_memory(fact)</code> tool, or run an extraction prompt after each conversation. Memories can also go stale (“lives in Pune” — until they move), so good systems update or overwrite old facts.</p>
<p>Also think about <b>privacy</b>: users should be able to see and delete what's remembered, and you shouldn't store sensitive data (passwords, health details) unless you truly need to.</p>`,
concepts:[["Short-term memory","Recent messages kept verbatim in the prompt."],["Summary memory","An LLM-written condensed version of older conversation."],["Long-term memory","Facts persisted across sessions and retrieved on demand."],["Memory extraction","Deciding which facts are worth saving."],["Episodic vs semantic memory","Memories of past events (‘last Tuesday we fixed the login bug’) vs general facts (‘user is a nurse’)."]],
resources:[
 {t:"LLMs as Operating Systems: Agent Memory — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/llms-as-operating-systems-agent-memory/",type:"course"},
 {t:"Long-Term Agentic Memory with LangGraph — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/long-term-agentic-memory-with-langgraph/",type:"course"},
 {t:"LangGraph docs: Memory overview",u:"https://docs.langchain.com/oss/python/langgraph/memory",type:"docs"},
 {t:"Google ADK docs: Sessions, state & memory",u:"https://google.github.io/adk-docs/sessions/",type:"docs"}
],
quiz:[
 {q:"Where does an agent's memory actually live?",o:["Inside the model's weights, updated live","In your app (prompt, database, vector store) and fed back to the model","In the user's keyboard","Nowhere"],a:1,e:"Memory is app-managed context."},
 {q:"What's the purpose of summary memory?",o:["Make conversations longer","Compress old turns into key facts to save context space","Translate messages","Encrypt history"],a:1,e:"Summaries keep what matters while shrinking token usage."},
 {q:"Long-term memory is usually retrieved…",o:["All at once, every time","Selectively, based on relevance to the current request","Never","Only on Sundays"],a:1,e:"Like RAG: fetch only relevant memories."},
 {q:"Which is a sensible thing to store in long-term memory?",o:["“User prefers answers in Hindi and works as a nurse”","The full raw text of every message ever","API keys","Random tokens"],a:0,e:"Stable, useful preferences/facts are ideal memories."},
 {q:"A privacy-friendly memory feature should…",o:["Hide memories from users","Let users view and delete what's remembered","Share memories between users","Store passwords"],a:1,e:"Transparency and control build trust."}
],
exercise:{title:"Summary buffer + long-term memory",
task:`<p>Implement two classes.</p>
<p><b>SummaryBuffer(max_messages, summarize)</b> — <code>summarize(old_summary, messages)</code> returns a new summary string.</p>
<ul><li><code>add(role, text)</code> appends <code>{"role", "text"}</code>. If there are now more than <code>max_messages</code>, take the <b>oldest</b> messages beyond the limit, fold them into <code>self.summary</code> via <code>summarize(self.summary, overflow)</code> and remove them.</li>
<li><code>context()</code> returns the messages list, preceded by <code>{"role": "system", "text": "Summary: " + summary}</code> if the summary is non-empty.</li></ul>
<p><b>LongTermMemory</b>: <code>remember(fact)</code> stores a string; <code>recall(query, k=2)</code> returns up to k facts sharing the most lowercase words with the query (only facts sharing ≥1 word), best first, ties in insertion order.</p>`,
starter:py`class SummaryBuffer:
    def __init__(self, max_messages, summarize):
        self.max_messages = max_messages
        self.summarize = summarize
        self.summary = ""
        self.messages = []

    def add(self, role, text):
        pass

    def context(self):
        pass

class LongTermMemory:
    def __init__(self):
        self.facts = []
    def remember(self, fact):
        pass
    def recall(self, query, k=2):
        pass

fake_summarize = lambda old, msgs: (old + " | " if old else "") + "; ".join(m["text"] for m in msgs)
buf = SummaryBuffer(2, fake_summarize)
for t in ["hi", "I'm vegetarian", "plan a trip", "to Goa"]:
    buf.add("user", t)
print(buf.context())
`,
solution:py`class SummaryBuffer:
    def __init__(self, max_messages, summarize):
        self.max_messages = max_messages
        self.summarize = summarize
        self.summary = ""
        self.messages = []

    def add(self, role, text):
        self.messages.append({"role": role, "text": text})
        if len(self.messages) > self.max_messages:
            cut = len(self.messages) - self.max_messages
            overflow, self.messages = self.messages[:cut], self.messages[cut:]
            self.summary = self.summarize(self.summary, overflow)

    def context(self):
        head = [{"role": "system", "text": "Summary: " + self.summary}] if self.summary else []
        return head + list(self.messages)

class LongTermMemory:
    def __init__(self):
        self.facts = []
    def remember(self, fact):
        self.facts.append(fact)
    def recall(self, query, k=2):
        q = set(query.lower().split())
        scored = [(len(q & set(f.lower().split())), i, f) for i, f in enumerate(self.facts)]
        scored = [s for s in scored if s[0] > 0]
        scored.sort(key=lambda s: (-s[0], s[1]))
        return [f for _, _, f in scored[:k]]
`,
tests:py`calls = []
def summ(old, msgs):
    calls.append([m["text"] for m in msgs])
    return (old + " | " if old else "") + "; ".join(m["text"] for m in msgs)
b = SummaryBuffer(2, summ)
b.add("user", "hi"); b.add("assistant", "hello")
assert b.context() == [{"role": "user", "text": "hi"}, {"role": "assistant", "text": "hello"}], "No summary while under the limit"
assert calls == [], "summarize should not be called yet"
b.add("user", "I'm vegetarian")
assert b.summary == "hi", "Oldest message should be summarised, summary=" + repr(b.summary)
assert [m["text"] for m in b.messages] == ["hello", "I'm vegetarian"]
b.add("user", "Goa trip")
assert b.summary == "hi | hello", "Summary should accumulate, got " + repr(b.summary)
ctx = b.context()
assert ctx[0] == {"role": "system", "text": "Summary: hi | hello"} and len(ctx) == 3, "context() should prepend the summary"
m = LongTermMemory()
for f in ["User is vegetarian", "User lives in Pune", "User likes short answers", "Pune trip planned for March"]:
    m.remember(f)
assert m.recall("what food is vegetarian") == ["User is vegetarian"], "recall wrong: " + repr(m.recall("what food is vegetarian"))
assert m.recall("pune trip in march") == ["Pune trip planned for March", "User lives in Pune"], "Best match first: " + repr(m.recall("pune trip in march"))
assert m.recall("quantum") == [], "No overlap -> []"
print("✅ All checks passed!")
`},
project:{title:"A chatbot that remembers you",
desc:"Extend your terminal chatbot: keep a summary buffer, and after each session extract up to 3 durable facts about the user into memory.json; load relevant ones next time.",
steps:["Use SummaryBuffer with a real summarize() that calls the LLM.","On /quit, extract durable facts (structured output: a list of strings) and save to memory.json.","On start, recall relevant facts for each user message and add them to the system instruction.","Add /memories and /forget commands so the user stays in control."],
code:{gemini:py`import json, pathlib
from google import genai
client = genai.Client()
MODEL = "gemini-flash-latest"

def llm(prompt):
    return client.models.generate_content(model=MODEL, contents=prompt).text

def summarize(old, msgs):
    convo = "\n".join(f"{m['role']}: {m['text']}" for m in msgs)
    return llm(f"Update this running summary with the new messages. Keep key facts, max 80 words.\n"
               f"Summary so far: {old or '(none)'}\nNew messages:\n{convo}")

def extract_facts(convo_text):
    resp = client.models.generate_content(
        model=MODEL, contents="List up to 3 durable facts about the user from this chat:\n" + convo_text,
        config={"response_mime_type": "application/json", "response_schema": list[str]})
    return resp.parsed

mem_file = pathlib.Path("memory.json")
ltm = LongTermMemory()
for f in json.loads(mem_file.read_text()) if mem_file.exists() else []:
    ltm.remember(f)
buf = SummaryBuffer(8, summarize)
# ... chat loop: facts = ltm.recall(user_msg); include them + buf.context() in the prompt
`,
openai:py`import json, pathlib
from pydantic import BaseModel
from openai import OpenAI
client = OpenAI()
MODEL = "gpt-6-luna"

def llm(prompt):
    return client.responses.create(model=MODEL, input=prompt).output_text

def summarize(old, msgs):
    convo = "\n".join(f"{m['role']}: {m['text']}" for m in msgs)
    return llm(f"Update this running summary with the new messages. Keep key facts, max 80 words.\n"
               f"Summary so far: {old or '(none)'}\nNew messages:\n{convo}")

class Facts(BaseModel):
    facts: list[str]

def extract_facts(convo_text):
    resp = client.responses.parse(model=MODEL, text_format=Facts,
        input="List up to 3 durable facts about the user from this chat:\n" + convo_text)
    return resp.output_parsed.facts

mem_file = pathlib.Path("memory.json")
ltm = LongTermMemory()
for f in json.loads(mem_file.read_text()) if mem_file.exists() else []:
    ltm.remember(f)
buf = SummaryBuffer(8, summarize)
# ... chat loop: facts = ltm.recall(user_msg); include them + buf.context() in the prompt
`,
anthropic:py`import json, pathlib
from pydantic import BaseModel
import anthropic
client = anthropic.Anthropic()
MODEL = "claude-sonnet-5-5"

def llm(prompt):
    msg = client.messages.create(model=MODEL, max_tokens=600,
                                 messages=[{"role": "user", "content": prompt}])
    return next(b.text for b in msg.content if b.type == "text")

def summarize(old, msgs):
    convo = "\n".join(f"{m['role']}: {m['text']}" for m in msgs)
    return llm(f"Update this running summary with the new messages. Keep key facts, max 80 words.\n"
               f"Summary so far: {old or '(none)'}\nNew messages:\n{convo}")

class Facts(BaseModel):
    facts: list[str]

def extract_facts(convo_text):
    resp = client.messages.parse(model=MODEL, max_tokens=400, output_format=Facts,
        messages=[{"role": "user", "content": "List up to 3 durable facts about the user from this chat:\n" + convo_text}])
    return resp.parsed_output.facts

mem_file = pathlib.Path("memory.json")
ltm = LongTermMemory()
for f in json.loads(mem_file.read_text()) if mem_file.exists() else []:
    ltm.remember(f)
buf = SummaryBuffer(8, summarize)
# ... chat loop: facts = ltm.recall(user_msg); include them + buf.context() in the prompt
`}}
});
})();
