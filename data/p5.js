(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
/* ================= TOOLKIT P5 ================= */
W.push({
id:105, phase:0, title:"Classes, dataclasses & type hints",
skip:"you can write a class with __init__ and methods, use @dataclass, and read type hints like list[dict[str, str]] | None.",
goal:"Read and write simple classes, use dataclasses to bundle data neatly, and understand type hints. LLM SDKs, Pydantic and agent frameworks are all built from these, so reading their code will stop feeling foreign.",
plan:[["30m","Read & try"],["10m","Quiz"],["45m","Exercise"],["35m","Mini project"]],
analogy:"A <b>class</b> is a cookie cutter and each <b>object</b> is a cookie made with it. Every cookie has the same shape (the same methods) but its own decorations (its own data). <code>self</code> means “this particular cookie”. A <b>dataclass</b> is a cookie cutter that comes with the boring parts done for you. <b>Type hints</b> are labels on the jars (“sugar”, “flour”): the kitchen doesn't enforce them, but they stop you and your tools grabbing the wrong one.",
why:"When you write <code>client = genai.Client()</code> or <code>class Recipe(BaseModel)</code>, you're using classes. Type hints are how Pydantic (P8, Week 7) and tool-calling frameworks (Week 9, 21) automatically build JSON schemas for the model. Understanding them turns ‘magic’ into ‘oh, it just reads my hints’.",
explain:`
<p><b>A class bundles data and behaviour:</b></p>
<pre class="code">class Conversation:
    def __init__(self, system=None):      # runs when you create one
        self.messages = []                 # data stored on this object
        if system:
            self.add("system", system)

    def add(self, role, content):          # a method: a function that belongs to the class
        self.messages.append({"role": role, "content": content})

chat = Conversation("Be concise.")         # create an object (an "instance")
chat.add("user", "Hi")                     # call a method
print(len(chat.messages))                  # 2</pre>
<ul>
<li><code>__init__</code> sets up a new object. <code>self</code> is the object itself, and Python passes it automatically, so you write <code>chat.add("user", "Hi")</code>, not <code>add(chat, ...)</code>.</li>
<li>Attributes (<code>self.messages</code>) are the object's own data, so two conversations don't share messages.</li>
<li>Special “dunder” (double-underscore) methods customise built-in behaviour: <code>__len__</code> makes <code>len(chat)</code> work, and <code>__repr__</code> controls how it prints.</li>
<li><b>Inheritance</b> (<code>class MyError(ValueError): ...</code>) makes a specialised version of an existing class. You'll mostly use it to create your own exception types, and in Pydantic (<code>class Recipe(BaseModel)</code>).</li>
</ul>
<p><b>Dataclasses</b> remove the repetitive parts for classes that mostly hold data:</p>
<pre class="code">from dataclasses import dataclass, field

@dataclass
class Message:
    role: str
    content: str
    tags: list[str] = field(default_factory=list)   # a fresh empty list for each object</pre>
<p>You get <code>__init__</code>, a readable <code>__repr__</code> and <code>==</code> comparison for free. <code>__post_init__</code> runs after creation, which is a good place to validate. Never write <code>tags: list = []</code> as a default. Use <code>field(default_factory=list)</code> so each object gets its own list.</p>
<p><b>Type hints</b> describe what a value should be: <code>def ask(prompt: str, max_tokens: int = 500) -> str:</code>. Common forms:</p>
<ul>
<li><code>list[str]</code> (a list of strings) and <code>dict[str, int]</code> (text keys, number values).</li>
<li><code>str | None</code> (text or nothing, often written <code>Optional[str]</code>) and <code>Literal["low", "high"]</code> (only these exact values).</li>
</ul>
<p>Python itself doesn't enforce hints at runtime. Your editor, type checkers like mypy, and libraries like <b>Pydantic</b> read them, and Pydantic <i>does</i> enforce them (P8).</p>`,
concepts:[["Class / object","A class is a blueprint; an object (instance) is one thing built from it."],["self & __init__","self is the current object; __init__ sets up its data when created."],["Method","A function defined inside a class, called as obj.method()."],["Dataclass","@dataclass auto-writes __init__, __repr__ and == for data-holding classes."],["Type hint","Annotations like x: int or -> str that document and enable tooling."],["Optional / Literal","str | None allows None; Literal[\"a\", \"b\"] allows only those values."]],
resources:[
 {t:"The Python Tutorial: Classes",u:"https://docs.python.org/3/tutorial/classes.html",type:"docs"},
 {t:"Python docs: dataclasses",u:"https://docs.python.org/3/library/dataclasses.html",type:"docs"},
 {t:"Real Python: Data classes in Python",u:"https://realpython.com/python-data-classes/",type:"article"},
 {t:"Real Python: Python type checking guide",u:"https://realpython.com/python-type-checking/",type:"article"}
],
quiz:[
 {q:"What is <code>self</code> inside a method?",o:["The class name","The specific object the method was called on","A global variable","The module"],a:1,e:"chat.add(...) passes chat as self automatically."},
 {q:"What does <code>@dataclass</code> give you for free?",o:["A database","__init__, __repr__ and == based on the fields","Internet access","Type enforcement at runtime"],a:1,e:"It writes the repetitive methods for you. It doesn't enforce types (Pydantic does)."},
 {q:"Why use <code>field(default_factory=list)</code> instead of <code>= []</code>?",o:["It's shorter","So each object gets its own new list instead of all sharing one","Lists aren't allowed","For speed"],a:1,e:"A mutable default would be shared between objects, a classic bug. Dataclasses even refuse = [] to protect you."},
 {q:"What does <code>def f(x: int) -> str</code> do if you call <code>f(\"hello\")</code>?",o:["Python refuses to run it","It runs, because hints aren't enforced at runtime (tools like mypy would warn)","It converts to int","It returns None"],a:1,e:"Hints are for humans and tools. Pydantic is what adds enforcement."},
 {q:"Which hint means “either a string or nothing”?",o:["str & None","str | None","list[str]","Literal[str]"],a:1,e:"str | None, also written Optional[str]."}
],
exercise:{title:"Model a conversation with a dataclass and a class",
task:`<p>Implement:</p>
<ul>
<li>A <code>@dataclass Message</code> with fields <code>role: str</code> and <code>content: str</code>. In <code>__post_init__</code>, raise <code>ValueError</code> if role isn't one of "system", "user" or "assistant". Add a method <code>to_dict()</code> returning <code>{"role": ..., "content": ...}</code>.</li>
<li>A class <code>Conversation</code>:
 <ul><li><code>__init__(self, system: str | None = None)</code>: start with an empty list <code>self.messages</code>, and add a system Message if one is given.</li>
 <li><code>add(role, content) -> Message</code>: create, append and return a Message.</li>
 <li><code>last(n) -> list[Message]</code>: the last n messages.</li>
 <li><code>to_api() -> list[dict]</code>: all messages as dicts.</li>
 <li><code>__len__</code>: the number of messages.</li></ul></li>
</ul>`,
starter:py`from dataclasses import dataclass

ROLES = {"system", "user", "assistant"}


@dataclass
class Message:
    role: str
    content: str

    # TODO: __post_init__ validation and to_dict()


class Conversation:
    def __init__(self, system: str | None = None):
        self.messages: list[Message] = []
        # TODO: add the system message if given

    # TODO: add, last, to_api, __len__


chat = Conversation("Be concise.")
chat.add("user", "What is a class?")
print(len(chat), chat.to_api())
`,
solution:py`from dataclasses import dataclass

ROLES = {"system", "user", "assistant"}


@dataclass
class Message:
    role: str
    content: str

    def __post_init__(self):
        if self.role not in ROLES:
            raise ValueError(f"role must be one of {sorted(ROLES)}, got {self.role!r}")

    def to_dict(self) -> dict:
        return {"role": self.role, "content": self.content}


class Conversation:
    def __init__(self, system: str | None = None):
        self.messages: list[Message] = []
        if system:
            self.add("system", system)

    def add(self, role: str, content: str) -> Message:
        msg = Message(role, content)
        self.messages.append(msg)
        return msg

    def last(self, n: int) -> list[Message]:
        return self.messages[-n:] if n > 0 else []

    def to_api(self) -> list[dict]:
        return [m.to_dict() for m in self.messages]

    def __len__(self) -> int:
        return len(self.messages)


chat = Conversation("Be concise.")
chat.add("user", "What is a class?")
print(len(chat), chat.to_api())
`,
tests:py`m = Message("user", "hi")
assert m == Message("user", "hi"), "Dataclasses compare by value"
assert m.to_dict() == {"role": "user", "content": "hi"}, "to_dict is wrong"
try:
    Message("robot", "beep")
    assert False, "Message('robot', ...) should raise ValueError"
except ValueError:
    pass
c = Conversation("Be concise.")
assert len(c) == 1 and c.messages[0] == Message("system", "Be concise."), "A system message should be added first"
assert len(Conversation()) == 0, "No system text -> empty conversation"
r = c.add("user", "Q1")
assert isinstance(r, Message) and r.content == "Q1", "add() should return the new Message"
c.add("assistant", "A1"); c.add("user", "Q2")
assert [x.content for x in c.last(2)] == ["A1", "Q2"], "last(2) should return the two newest"
assert c.to_api()[-1] == {"role": "user", "content": "Q2"} and len(c.to_api()) == 4, "to_api should return all messages as dicts"
c2 = Conversation()
c2.add("user", "separate")
assert len(c) == 4 and len(c2) == 1, "Each Conversation must have its own messages list"
try:
    c.add("wizard", "x")
    assert False, "add() with a bad role should raise ValueError"
except ValueError:
    pass
print("✅ All checks passed!")
`},
project:{title:"A reusable Conversation class that talks to a real model",
desc:"Use your <code>Conversation</code> class as the memory for a real chatbot. Each provider wants the history in a slightly different shape, so add a small converter method, and you'll understand exactly what Week 5's chat helpers do behind the scenes.",
steps:["Put <code>Message</code> and <code>Conversation</code> in <code>conversation.py</code>.","Add a method that converts the history into the shape your provider expects (see the tabs).","Write a loop: read input, <code>chat.add(\"user\", ...)</code>, call the API with the converted history, then <code>chat.add(\"assistant\", reply)</code>.","Add a <code>/last 3</code> command that prints the last three messages using <code>chat.last(3)</code>."],
code:{gemini:py`# pip install google-genai   (GEMINI_API_KEY set - see Setup)
from google import genai
from google.genai import types
from conversation import Conversation

client = genai.Client()
chat = Conversation("You are a concise Python tutor.")

def to_gemini(chat):
    """Gemini: system prompt goes in config; roles are 'user' / 'model'; text lives in 'parts'."""
    system = next((m.content for m in chat.messages if m.role == "system"), None)
    contents = [{"role": "model" if m.role == "assistant" else "user", "parts": [{"text": m.content}]}
                for m in chat.messages if m.role != "system"]
    return system, contents

while (text := input("you> ").strip()) != "/quit":
    chat.add("user", text)
    system, contents = to_gemini(chat)
    resp = client.models.generate_content(model="gemini-flash-latest", contents=contents,
        config=types.GenerateContentConfig(system_instruction=system))
    chat.add("assistant", resp.text)
    print("bot>", resp.text)
`,
openai:py`# pip install openai   (OPENAI_API_KEY set; needs API credits)
from openai import OpenAI
from conversation import Conversation

client = OpenAI()
chat = Conversation("You are a concise Python tutor.")

while (text := input("you> ").strip()) != "/quit":
    chat.add("user", text)
    # The Responses API accepts the same role/content dicts that to_api() produces
    resp = client.responses.create(model="gpt-6-luna", input=chat.to_api())
    chat.add("assistant", resp.output_text)
    print("bot>", resp.output_text)
`,
anthropic:py`# pip install anthropic   (ANTHROPIC_API_KEY set; needs API credits)
import anthropic
from conversation import Conversation

client = anthropic.Anthropic()
chat = Conversation("You are a concise Python tutor.")

def to_claude(chat):
    """Claude: system prompt is a separate argument; messages are user/assistant only."""
    system = next((m.content for m in chat.messages if m.role == "system"), "")
    return system, [m.to_dict() for m in chat.messages if m.role != "system"]

while (text := input("you> ").strip()) != "/quit":
    chat.add("user", text)
    system, messages = to_claude(chat)
    msg = client.messages.create(model="claude-sonnet-5-5", max_tokens=800, system=system, messages=messages)
    reply = next(b.text for b in msg.content if b.type == "text")
    chat.add("assistant", reply)
    print("bot>", reply)
`}}
});
})();
