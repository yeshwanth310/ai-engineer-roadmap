(function(){
const W = window.ROADMAP.weeks; const py = String.raw;

/* ================= WEEK 8 ================= */
W.push({
id:8, phase:3, title:"Validation & self-repair loops",
goal:"Validate model output against rules with Pydantic-style checks, and automatically ask the model to fix invalid output — with a retry limit.",
plan:[["20m","Read"],["10m","Quiz"],["45m","Exercise"],["45m","Mini project"]],
explain:`
<p>Structured output gets you the right <i>shape</i>. But values can still be wrong: an empty title, a negative price, a priority of “urgent-ish” when you only allow <code>low</code>/<code>medium</code>/<code>high</code>. <b>Validation</b> is code that checks these rules.</p>
<p><b>Pydantic</b> is the standard tool: you describe fields and types (and extra rules like “must be ≥ 0”), and it raises a clear <code>ValidationError</code> explaining exactly what's wrong.</p>
<p>That error message is gold. A <b>repair loop</b> sends it back to the model: <i>“Your previous answer failed validation: priority must be one of low/medium/high. Return corrected JSON.”</i> Models are good at fixing their own mistakes when told precisely what's wrong. Always cap the number of attempts, and have a fallback (log it, ask a human, return a default).</p>
<div class="callout"><b>Pattern:</b> generate → validate → (if invalid) feed errors back → validate again → give up after N tries. You'll see this loop shape again in agents.</div>`,
concepts:[["Validation","Checking values obey business rules, not just the JSON shape."],["ValidationError","Pydantic's detailed error saying which fields failed and why."],["Repair loop","Feeding validation errors back so the model corrects its output."],["Retry cap","A maximum number of attempts to avoid infinite loops and runaway cost."],["Enum / Literal","A field restricted to a fixed set of allowed values."]],
resources:[
 {t:"Pydantic documentation",u:"https://docs.pydantic.dev/latest/",type:"docs"},
 {t:"Gemini API: Structured output",u:"https://ai.google.dev/gemini-api/docs/structured-output",type:"docs"},
 {t:"OpenAI: Structured Outputs",u:"https://platform.openai.com/docs/guides/structured-outputs",type:"docs"},
 {t:"Instructor library (validation + retries for LLMs)",u:"https://python.useinstructor.com/",type:"docs"}
],
quiz:[
 {q:"Structured output guarantees the JSON has a 'price' number. What can it NOT guarantee?",o:["That price exists","That price is a number","That the price is sensible (e.g. not negative)","That it's valid JSON"],a:2,e:"Business rules like ‘price ≥ 0’ need validation in your code."},
 {q:"What's the key idea of a repair loop?",o:["Retry the identical request forever","Send the specific validation errors back so the model can fix them","Lower the temperature to zero","Switch provider on failure"],a:1,e:"Precise feedback lets the model correct itself."},
 {q:"Why cap the number of repair attempts?",o:["Models get offended","To avoid infinite loops and runaway costs","The API requires it","Validation gets slower"],a:1,e:"Always bound loops that call paid APIs."},
 {q:"In Pydantic, how would you restrict priority to low/medium/high?",o:["priority: str","priority: Literal['low','medium','high']","priority: int","priority: list"],a:1,e:"Literal (or an Enum) restricts the allowed values."},
 {q:"The model fails validation 3 times in a row. A good fallback is…",o:["Crash silently","Log it and return an error / ask a human","Keep retrying forever","Return the invalid data anyway without telling anyone"],a:1,e:"Fail visibly and safely."}
],
exercise:{title:"Validate & repair with a mock LLM",
task:`<p>Two parts (no Pydantic in the browser — plain Python):</p>
<ol><li><code>validate_ticket(d)</code> returns a <b>list of error strings</b> (empty if valid). Rules:
<ul><li><code>"title"</code>: non-empty string → else error containing <code>"title"</code></li>
<li><code>"priority"</code>: one of <code>"low","medium","high"</code> → else error containing <code>"priority"</code></li>
<li><code>"estimate_hours"</code>: number (int/float, not bool) ≥ 0 → else error containing <code>"estimate_hours"</code></li></ul></li>
<li><code>generate_valid(llm, prompt, max_attempts=3)</code>: call <code>llm(prompt)</code> (returns a dict). If invalid, call <code>llm(prompt + "\nFix these errors: " + "; ".join(errors))</code>. Return the first valid dict; after <code>max_attempts</code> invalid results raise <code>ValueError</code>.</li></ol>`,
starter:py`ALLOWED = {"low", "medium", "high"}

def validate_ticket(d):
    errors = []
    # check title, priority, estimate_hours
    return errors

def generate_valid(llm, prompt, max_attempts=3):
    pass

# a mock LLM that gets it right on the 2nd try
def mock_llm(prompt):
    if "Fix these errors" in prompt:
        return {"title": "Login bug", "priority": "high", "estimate_hours": 3}
    return {"title": "Login bug", "priority": "urgent!!", "estimate_hours": -1}

print(validate_ticket(mock_llm("x")))
print(generate_valid(mock_llm, "Create a ticket"))
`,
solution:py`ALLOWED = {"low", "medium", "high"}

def validate_ticket(d):
    errors = []
    t = d.get("title")
    if not isinstance(t, str) or not t.strip():
        errors.append("title must be a non-empty string")
    if d.get("priority") not in ALLOWED:
        errors.append("priority must be one of low, medium, high")
    e = d.get("estimate_hours")
    if isinstance(e, bool) or not isinstance(e, (int, float)) or e < 0:
        errors.append("estimate_hours must be a number >= 0")
    return errors

def generate_valid(llm, prompt, max_attempts=3):
    p = prompt
    for _ in range(max_attempts):
        d = llm(p)
        errs = validate_ticket(d)
        if not errs:
            return d
        p = prompt + "\nFix these errors: " + "; ".join(errs)
    raise ValueError("Could not get valid output")
`,
tests:py`good = {"title": "Bug", "priority": "low", "estimate_hours": 1.5}
assert validate_ticket(good) == [], "Valid ticket should give no errors, got " + repr(validate_ticket(good))
errs = validate_ticket({"title": "  ", "priority": "urgent", "estimate_hours": -2})
assert len(errs) == 3, "Expected 3 errors, got " + repr(errs)
assert any("title" in e for e in errs) and any("priority" in e for e in errs) and any("estimate_hours" in e for e in errs), "Errors should name the fields"
assert len(validate_ticket({})) == 3, "Missing fields are errors too"
assert any("estimate_hours" in e for e in validate_ticket({"title": "a", "priority": "low", "estimate_hours": True})), "bool is not a valid number"
prompts = []
def llm2(p):
    prompts.append(p)
    return good if len(prompts) == 2 else {"title": "", "priority": "low", "estimate_hours": 1}
assert generate_valid(llm2, "Make ticket") == good, "Should return the first valid result"
assert prompts[0] == "Make ticket", "First call should use the original prompt"
assert prompts[1].startswith("Make ticket\nFix these errors: ") and "title" in prompts[1], "Retry prompt should include the errors, got " + repr(prompts[1])
calls = []
def bad_llm(p):
    calls.append(p); return {}
try:
    generate_valid(bad_llm, "x", max_attempts=3); assert False, "Should raise ValueError after max attempts"
except ValueError:
    pass
assert len(calls) == 3, "Should call llm exactly max_attempts times, called " + str(len(calls))
print("✅ All checks passed!")
`},
project:{title:"Email → ticket converter with auto-repair",
desc:"Turn messy customer emails into validated support tickets using a Pydantic model and a repair loop around a real model.",
steps:["Define a Ticket Pydantic model with Literal priority and Field(ge=0) for hours.","Ask the model for JSON, validate with Ticket.model_validate_json().","On ValidationError, resend with str(error) appended; max 3 attempts.","Run it on 5 sample emails and count how often repair was needed."],
code:{gemini:py`from typing import Literal
from pydantic import BaseModel, Field, ValidationError
from google import genai

class Ticket(BaseModel):
    title: str = Field(min_length=3)
    priority: Literal["low", "medium", "high"]
    estimate_hours: float = Field(ge=0)

client = genai.Client()

def to_ticket(email: str, max_attempts: int = 3) -> Ticket:
    prompt = f"Create a support ticket as JSON (title, priority, estimate_hours) from:\n<email>{email}</email>"
    for attempt in range(max_attempts):
        raw = client.models.generate_content(
            model="gemini-flash-latest", contents=prompt,
            config={"response_mime_type": "application/json"}).text
        try:
            return Ticket.model_validate_json(raw)
        except ValidationError as e:
            print(f"attempt {attempt + 1} invalid -> repairing")
            prompt += f"\nYour last answer was invalid:\n{e}\nReturn corrected JSON only."
    raise ValueError("Gave up after repairs")

print(to_ticket("Hi, the app crashes every time I log in. Pretty annoying!!"))
`,
openai:py`from typing import Literal
from pydantic import BaseModel, Field, ValidationError
from openai import OpenAI

class Ticket(BaseModel):
    title: str = Field(min_length=3)
    priority: Literal["low", "medium", "high"]
    estimate_hours: float = Field(ge=0)

client = OpenAI()

def to_ticket(email: str, max_attempts: int = 3) -> Ticket:
    prompt = f"Create a support ticket as JSON (title, priority, estimate_hours) from:\n<email>{email}</email>"
    for attempt in range(max_attempts):
        raw = client.responses.create(
            model="gpt-6-luna", input=prompt,
            text={"format": {"type": "json_object"}}).output_text
        try:
            return Ticket.model_validate_json(raw)
        except ValidationError as e:
            print(f"attempt {attempt + 1} invalid -> repairing")
            prompt += f"\nYour last answer was invalid:\n{e}\nReturn corrected JSON only."
    raise ValueError("Gave up after repairs")

print(to_ticket("Hi, the app crashes every time I log in. Pretty annoying!!"))
`}}
});

/* ================= WEEK 9 ================= */
W.push({
id:9, phase:3, title:"Tool / function calling",
goal:"Understand how models ‘use tools’: you describe functions, the model asks to call one with arguments, your code runs it and sends back the result.",
plan:[["25m","Read"],["10m","Quiz"],["45m","Exercise"],["40m","Mini project"]],
explain:`
<p>Models can't check the weather, read your database or send an email by themselves. <b>Tool calling</b> (a.k.a. function calling) is how they reach the outside world — safely, through <i>your</i> code.</p>
<ol>
<li>You describe your tools: a <b>name</b>, a plain-English <b>description</b>, and the <b>parameters</b> (a JSON schema).</li>
<li>You send the user's message plus those descriptions.</li>
<li>The model either answers directly, or replies with a <b>tool call</b>: <code>get_weather(city="Pune")</code>. It does <b>not</b> run anything itself.</li>
<li>Your code runs the real function and sends the <b>result</b> back.</li>
<li>The model uses the result to write the final answer (or calls another tool).</li>
</ol>
<p>The descriptions matter a lot — they're effectively prompts. Good names, clear descriptions of <i>when</i> to use each tool, and simple parameters make tool use much more reliable.</p>
<p>Both SDKs can also do this automatically: in Gemini you can pass plain Python functions as tools in a chat and the SDK runs them for you; the OpenAI Agents SDK does the same (Week 20). Doing it manually once is the best way to understand it.</p>
<div class="callout"><b>Safety:</b> the model chooses arguments, so treat them as untrusted input. Validate them and never give a tool more power than it needs.</div>`,
concepts:[["Tool / function declaration","Name + description + parameter schema that tells the model a tool exists."],["Tool call","The model's structured request to run a tool with specific arguments."],["Tool result","What your code returns to the model after running the tool."],["Dispatcher","Code that maps a tool name to the real Python function and runs it."],["Automatic function calling","SDK feature that runs Python functions for you in a loop."]],
resources:[
 {t:"Gemini API: Function calling",u:"https://ai.google.dev/gemini-api/docs/function-calling",type:"docs"},
 {t:"OpenAI: Function calling",u:"https://platform.openai.com/docs/guides/function-calling",type:"docs"},
 {t:"Functions, Tools and Agents with LangChain — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/functions-tools-agents-langchain/",type:"course"},
 {t:"Hugging Face Agents Course (free)",u:"https://huggingface.co/learn/agents-course/unit0/introduction",type:"course"}
],
quiz:[
 {q:"When a model makes a tool call, who actually runs the function?",o:["The model, inside the provider's servers","Your application code","The user's browser automatically","Nobody — it's simulated"],a:1,e:"The model only requests the call; your code decides whether and how to run it."},
 {q:"Which part of a tool declaration most influences WHEN the model uses the tool?",o:["The Python file name","The description","The function's line count","The return type annotation only"],a:1,e:"The model reads the description to decide if the tool fits the request."},
 {q:"After running the tool, what should you do?",o:["Show the raw result to the user and stop","Send the result back to the model so it can finish the answer","Delete the conversation","Call the tool again"],a:1,e:"The model turns the tool result into a helpful reply (or makes another call)."},
 {q:"The model asks to call delete_all_files(). What's the right mindset?",o:["Trust it — the model knows best","Tool arguments are untrusted; restrict powerful tools and validate/confirm","Run it twice","Ignore all tools forever"],a:1,e:"Apply least privilege and validation; require confirmation for dangerous actions."},
 {q:"The model requests a tool name that doesn't exist. Your dispatcher should…",o:["Crash the app","Return an error message as the tool result so the model can recover","Pick a random tool","Retry the same call forever"],a:1,e:"Feeding back a clear error lets the model correct itself."}
],
exercise:{title:"Build a tool registry & dispatcher",
task:`<p>Implement a tiny tool system:</p>
<ul><li>A decorator <code>@tool</code> that registers a function in the global dict <code>TOOLS</code> under its name, storing <code>{"fn": f, "description": f.__doc__.strip()}</code>, and returns the function unchanged.</li>
<li><code>dispatch(call)</code> where <code>call = {"name": ..., "args": {...}}</code>. Return <code>{"ok": True, "result": ...}</code> on success. For an unknown tool return <code>{"ok": False, "error": "unknown tool: NAME"}</code>. If the function raises, return <code>{"ok": False, "error": str(exception)}</code> (never crash).</li></ul>`,
starter:py`TOOLS = {}

def tool(f):
    pass

def dispatch(call):
    pass

@tool
def get_weather(city: str) -> str:
    """Get today's weather for a city."""
    fake = {"pune": "31°C sunny", "london": "14°C rain"}
    return fake.get(city.lower(), "unknown")

@tool
def add(a: float, b: float) -> float:
    """Add two numbers."""
    return a + b

print(dispatch({"name": "get_weather", "args": {"city": "Pune"}}))
print(dispatch({"name": "fly", "args": {}}))
`,
solution:py`TOOLS = {}

def tool(f):
    TOOLS[f.__name__] = {"fn": f, "description": (f.__doc__ or "").strip()}
    return f

def dispatch(call):
    name = call.get("name")
    if name not in TOOLS:
        return {"ok": False, "error": f"unknown tool: {name}"}
    try:
        return {"ok": True, "result": TOOLS[name]["fn"](**call.get("args", {}))}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@tool
def get_weather(city: str) -> str:
    """Get today's weather for a city."""
    fake = {"pune": "31°C sunny", "london": "14°C rain"}
    return fake.get(city.lower(), "unknown")

@tool
def add(a: float, b: float) -> float:
    """Add two numbers."""
    return a + b
`,
tests:py`assert "get_weather" in TOOLS and "add" in TOOLS, "Both tools should be registered in TOOLS"
assert TOOLS["add"]["description"] == "Add two numbers.", "Store the stripped docstring as description"
assert callable(get_weather) and get_weather("london") == "14°C rain", "@tool must return the original function"
assert dispatch({"name": "get_weather", "args": {"city": "Pune"}}) == {"ok": True, "result": "31°C sunny"}
assert dispatch({"name": "add", "args": {"a": 2, "b": 3}}) == {"ok": True, "result": 5}
r = dispatch({"name": "fly", "args": {}})
assert r == {"ok": False, "error": "unknown tool: fly"}, "Unknown tool result wrong: " + repr(r)
r = dispatch({"name": "add", "args": {"a": 1}})
assert r["ok"] is False and "error" in r, "Exceptions (e.g. missing arg) must be caught and returned"
@tool
def boom():
    """Always fails."""
    raise RuntimeError("database offline")
assert dispatch({"name": "boom", "args": {}}) == {"ok": False, "error": "database offline"}
print("✅ All checks passed!")
`},
project:{title:"Weather + calculator assistant (manual tool loop)",
desc:"Wire real tool calling end-to-end: declare two tools, handle the model's calls with your dispatcher, send results back, print the final answer.",
steps:["Declare get_weather and add as tools (fake weather data is fine).","Send the question: “Is it warmer in Pune than London, and by how much?”","Run each requested call via dispatch() and return the results.","Print every tool call so you can watch the model's decisions."],
code:{gemini:py`from google import genai
from google.genai import types

client = genai.Client()
MODEL = "gemini-flash-latest"
decls = [
  {"name": "get_weather", "description": "Get today's temperature (°C) for a city.",
   "parameters": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]}},
  {"name": "add", "description": "Add two numbers (use negative b to subtract).",
   "parameters": {"type": "object", "properties": {"a": {"type": "number"}, "b": {"type": "number"}},
                  "required": ["a", "b"]}},
]
config = types.GenerateContentConfig(tools=[types.Tool(function_declarations=decls)])
contents = [types.Content(role="user", parts=[types.Part(text="Is Pune warmer than London? By how much?")])]

for _ in range(5):                                   # safety cap
    resp = client.models.generate_content(model=MODEL, contents=contents, config=config)
    if not resp.function_calls:
        print(resp.text); break
    contents.append(resp.candidates[0].content)      # keep the model's tool-call turn
    parts = []
    for fc in resp.function_calls:
        out = dispatch({"name": fc.name, "args": dict(fc.args)})   # your exercise code
        print("tool:", fc.name, dict(fc.args), "->", out)
        parts.append(types.Part.from_function_response(name=fc.name, response=out))
    contents.append(types.Content(role="user", parts=parts))
`,
openai:py`import json
from openai import OpenAI

client = OpenAI()
tools = [
  {"type": "function", "name": "get_weather", "description": "Get today's temperature (°C) for a city.",
   "parameters": {"type": "object", "properties": {"city": {"type": "string"}},
                  "required": ["city"], "additionalProperties": False}, "strict": True},
  {"type": "function", "name": "add", "description": "Add two numbers (use negative b to subtract).",
   "parameters": {"type": "object", "properties": {"a": {"type": "number"}, "b": {"type": "number"}},
                  "required": ["a", "b"], "additionalProperties": False}, "strict": True},
]
items = [{"role": "user", "content": "Is Pune warmer than London? By how much?"}]

for _ in range(5):                                   # safety cap
    resp = client.responses.create(model="gpt-6-luna", input=items, tools=tools)
    calls = [o for o in resp.output if o.type == "function_call"]
    if not calls:
        print(resp.output_text); break
    items += resp.output                             # keep the model's tool-call items
    for c in calls:
        out = dispatch({"name": c.name, "args": json.loads(c.arguments)})
        print("tool:", c.name, c.arguments, "->", out)
        items.append({"type": "function_call_output", "call_id": c.call_id, "output": json.dumps(out)})
`}}
});

/* ================= WEEK 10 ================= */
W.push({
id:10, phase:4, title:"Embeddings & semantic search (plain English)",
goal:"Understand embeddings as ‘meaning fingerprints’ and use similarity to find the most relevant text — the heart of RAG and semantic search.",
plan:[["25m","Read & watch"],["10m","Quiz"],["45m","Exercise"],["40m","Mini project"]],
explain:`
<p>An <b>embedding</b> turns a piece of text into a list of numbers — a kind of <b>meaning fingerprint</b>. An embedding model is trained so that texts with <i>similar meaning</i> get <i>similar fingerprints</i>. “How do I reset my password?” and “I forgot my login” end up close together, even though they share almost no words.</p>
<p>Picture each fingerprint as an arrow pointing somewhere in space. <b>Cosine similarity</b> just measures how much two arrows point in the same direction: <b>1</b> = same direction (same meaning), <b>0</b> = unrelated, negative = opposite. You don't need the maths — the code is five lines and you'll write it this week.</p>
<p><b>Semantic search</b> then works like this:</p>
<ol><li>Embed all your documents once and store the vectors.</li><li>Embed the user's question.</li><li>Compare the question vector to every document vector and return the top few matches.</li></ol>
<p>Real embeddings have hundreds or thousands of numbers (Gemini's <code>gemini-embedding-001</code> gives up to 3072). In the exercise we'll use tiny hand-made 3-number vectors so you can see exactly what's happening.</p>`,
concepts:[["Embedding","A list of numbers representing the meaning of a text."],["Vector","Just a list of numbers; an embedding is a vector."],["Cosine similarity","How much two vectors point the same way: 1 = very similar, 0 = unrelated."],["Semantic search","Finding text by meaning rather than exact keywords."],["Top-k","Returning the k best matches."]],
resources:[
 {t:"Gemini API: Embeddings",u:"https://ai.google.dev/gemini-api/docs/embeddings",type:"docs"},
 {t:"OpenAI: Embeddings guide",u:"https://platform.openai.com/docs/guides/embeddings",type:"docs"},
 {t:"Vector Databases: from Embeddings to Applications — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/vector-databases-embeddings-applications/",type:"course"},
 {t:"The Illustrated Word2vec — Jay Alammar (visual intuition)",u:"https://jalammar.github.io/illustrated-word2vec/",type:"article"}
],
quiz:[
 {q:"What does an embedding represent?",o:["The text's font","The meaning of text as a list of numbers","A compressed zip of the text","The number of words"],a:1,e:"Embeddings capture meaning so similar texts have similar vectors."},
 {q:"Cosine similarity of 1.0 between two embeddings means…",o:["Completely unrelated","Pointing the same way — very similar meaning","Opposite meaning","An error occurred"],a:1,e:"1 = same direction = very similar."},
 {q:"Why can semantic search find ‘I forgot my login’ for the query ‘reset password’?",o:["It matches exact words","Their meanings are close, so their embeddings are close","It uses a thesaurus file","Luck"],a:1,e:"Embeddings compare meaning, not spelling."},
 {q:"In semantic search, what do you embed at query time?",o:["All documents again","Only the user's question","Nothing","The whole internet"],a:1,e:"Documents are embedded once in advance; only the query is embedded per request."},
 {q:"Must documents and queries be embedded with the same model?",o:["Yes — different models produce incompatible fingerprints","No, any mix works","Only on Tuesdays","Only for images"],a:0,e:"Vectors from different embedding models live in different ‘spaces’ and can't be compared."}
],
exercise:{title:"Cosine similarity search on tiny vectors",
task:`<p>Implement, using plain Python (no NumPy):</p>
<ul><li><code>cosine(a, b)</code> = <code>dot(a,b) / (length(a) * length(b))</code>, where <code>dot</code> multiplies matching numbers and adds them up, and <code>length(v) = sqrt(dot(v, v))</code>. If either length is 0, return <code>0.0</code>.</li>
<li><code>top_k(query_vec, docs, k=2)</code>: <code>docs</code> is a list of <code>(text, vector)</code>. Return a list of <code>(text, score)</code> for the k highest scores, best first, with scores rounded to 3 decimals.</li></ul>
<p>Our toy vectors have 3 “meaning dimensions”: [about pets, about money, about travel].</p>`,
starter:py`import math

def cosine(a, b):
    pass

def top_k(query_vec, docs, k=2):
    pass

DOCS = [
    ("How to groom a puppy",          [0.9, 0.1, 0.0]),
    ("Cheap flights to Goa",          [0.0, 0.5, 0.9]),
    ("Saving money on cat food",      [0.7, 0.7, 0.0]),
    ("Packing tips for a long trip",  [0.1, 0.0, 0.95]),
]
query = [0.8, 0.3, 0.0]   # "dog care on a budget"
print(top_k(query, DOCS))
`,
solution:py`import math

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    la = math.sqrt(sum(x * x for x in a))
    lb = math.sqrt(sum(y * y for y in b))
    if la == 0 or lb == 0:
        return 0.0
    return dot / (la * lb)

def top_k(query_vec, docs, k=2):
    scored = [(text, round(cosine(query_vec, vec), 3)) for text, vec in docs]
    scored.sort(key=lambda t: t[1], reverse=True)
    return scored[:k]
`,
tests:py`assert abs(cosine([1, 0], [1, 0]) - 1.0) < 1e-9, "Same direction -> 1"
assert abs(cosine([1, 0], [0, 1])) < 1e-9, "Perpendicular -> 0"
assert abs(cosine([1, 2, 3], [2, 4, 6]) - 1.0) < 1e-9, "Scaling doesn't change direction -> 1"
assert abs(cosine([1, 0], [-1, 0]) + 1.0) < 1e-9, "Opposite -> -1"
assert cosine([0, 0], [1, 1]) == 0.0, "Zero vector -> 0.0"
DOCS = [("pets", [0.9, 0.1, 0.0]), ("flights", [0.0, 0.5, 0.9]), ("cat food money", [0.7, 0.7, 0.0]), ("packing", [0.1, 0.0, 0.95])]
r = top_k([0.8, 0.3, 0.0], DOCS)
assert [t for t, _ in r] == ["pets", "cat food money"], "Wrong ranking: " + repr(r)
assert r[0][1] == 0.969, "Scores should be rounded to 3 decimals, got " + repr(r[0][1])
assert len(top_k([0, 0, 1], DOCS, k=3)) == 3 and top_k([0, 0, 1], DOCS, k=1)[0][0] == "packing", "k should control result count"
print("✅ All checks passed!")
`},
project:{title:"Semantic FAQ search with real embeddings",
desc:"Embed 15–20 FAQ entries (write your own, e.g. for a gym or library), then answer queries by finding the closest FAQ using your cosine function.",
steps:["Write faqs.txt with one question+answer per line.","Embed all FAQs once and save vectors to faq_vectors.json (so you don't re-embed each run).","Embed a user query and print the top 3 matches with scores.","Try paraphrased queries with no shared words and see it still works."],
code:{gemini:py`import json
from google import genai
from google.genai import types

client = genai.Client()
EMBED = "gemini-embedding-001"
faqs = [l.strip() for l in open("faqs.txt") if l.strip()]

def embed(texts, task):
    r = client.models.embed_content(model=EMBED, contents=texts,
        config=types.EmbedContentConfig(task_type=task, output_dimensionality=768))
    return [e.values for e in r.embeddings]

vectors = embed(faqs, "RETRIEVAL_DOCUMENT")
json.dump(list(zip(faqs, vectors)), open("faq_vectors.json", "w"))

while (q := input("query> ")):
    qv = embed([q], "RETRIEVAL_QUERY")[0]
    for text, score in top_k(qv, list(zip(faqs, vectors)), k=3):   # your exercise code
        print(f"{score:.3f}  {text[:80]}")
`,
openai:py`import json
from openai import OpenAI

client = OpenAI()
EMBED = "text-embedding-3-small"
faqs = [l.strip() for l in open("faqs.txt") if l.strip()]

def embed(texts):
    r = client.embeddings.create(model=EMBED, input=texts)
    return [d.embedding for d in r.data]

vectors = embed(faqs)
json.dump(list(zip(faqs, vectors)), open("faq_vectors.json", "w"))

while (q := input("query> ")):
    qv = embed([q])[0]
    for text, score in top_k(qv, list(zip(faqs, vectors)), k=3):   # your exercise code
        print(f"{score:.3f}  {text[:80]}")
`}}
});

/* ================= WEEK 11 ================= */
W.push({
id:11, phase:4, title:"Chunking documents",
goal:"Split long documents into well-sized, overlapping chunks with metadata, so retrieval finds focused, useful passages.",
plan:[["20m","Read"],["10m","Quiz"],["50m","Exercise"],["40m","Mini project"]],
explain:`
<p>You can't embed a whole 200-page manual as one fingerprint — it would be a blurry average of everything, and too big to paste into a prompt anyway. So we split documents into <b>chunks</b>: passages of a few hundred words, each embedded separately.</p>
<p>Chunk size is a trade-off:</p>
<ul><li><b>Too small</b> — a chunk loses context (“It costs $5” — what does?).</li><li><b>Too big</b> — the fingerprint gets vague and you waste context window space.</li></ul>
<p><b>Overlap</b> repeats the last few words of one chunk at the start of the next, so a sentence cut at a boundary still appears whole somewhere. Smarter splitters break at natural boundaries — headings, paragraphs, sentences — before falling back to word counts.</p>
<p>Always store <b>metadata</b> with each chunk: source file, page or section, and position. You'll need it to show citations (“Source: handbook.pdf, section 3”) and to filter results (Week 13).</p>`,
concepts:[["Chunk","A passage of a document that is embedded and retrieved as one unit."],["Chunk size","How long each chunk is (words, characters or tokens)."],["Overlap","Words repeated between neighbouring chunks to avoid cutting ideas in half."],["Recursive splitting","Split on headings, then paragraphs, then sentences, then words, as needed."],["Metadata","Extra info stored with a chunk: source, page, section, date."]],
resources:[
 {t:"Building and Evaluating Advanced RAG — DeepLearning.AI (covers smarter chunking)",u:"https://learn.deeplearning.ai/courses/building-evaluating-advanced-rag",type:"course"},
 {t:"LangChain docs: Text splitters",u:"https://docs.langchain.com/oss/python/integrations/splitters",type:"docs"},
 {t:"Chroma docs (a simple local vector database)",u:"https://docs.trychroma.com/",type:"docs"},
 {t:"OpenAI Cookbook",u:"https://cookbook.openai.com/",type:"code"}
],
quiz:[
 {q:"Why not embed an entire long document as one vector?",o:["It's illegal","The fingerprint becomes a vague average and won't match specific questions well","Embeddings only accept one word","It's always faster"],a:1,e:"Smaller focused chunks produce sharper matches."},
 {q:"What problem does chunk overlap solve?",o:["Reduces storage","Avoids ideas being cut in half at chunk boundaries","Makes embeddings free","Removes duplicates"],a:1,e:"Overlap means boundary sentences appear intact in at least one chunk."},
 {q:"A chunk says only “It costs $5 per month.” What's the issue?",o:["Chunk too small — missing context","Chunk too big","Wrong embedding model","Nothing"],a:0,e:"Without surrounding context the chunk is ambiguous."},
 {q:"Why store the source and section with each chunk?",o:["For citations and filtering","To make it bigger","The API requires it","To confuse the model"],a:0,e:"Metadata enables ‘Sources: …’ and filters like ‘only 2025 policies’."},
 {q:"A ‘recursive’ splitter tries to break text…",o:["Randomly","At natural boundaries first (sections, paragraphs, sentences)","Only every 10 characters","Never"],a:1,e:"Natural boundaries keep related ideas together."}
],
exercise:{title:"Word chunker with overlap + metadata",
task:`<p>Implement <code>chunk_words(text, size, overlap, source)</code>:</p>
<ul><li>Split text into words with <code>text.split()</code>.</li>
<li>Each chunk has up to <code>size</code> words; the next chunk starts <code>size - overlap</code> words after the previous start.</li>
<li>Stop once a chunk reaches the end of the text (don't emit a final chunk that is fully contained in the previous one).</li>
<li>Return a list of dicts: <code>{"id": "SOURCE-N", "source": source, "start": word_index, "text": "joined words"}</code> with N starting at 0.</li>
<li>Raise <code>ValueError</code> if <code>overlap &gt;= size</code> or <code>size &lt;= 0</code>.</li></ul>
<p>Example: 10 words, size 4, overlap 1 → starts at 0, 3, 6 (the chunk at 6 covers words 6–9 and reaches the end).</p>`,
starter:py`def chunk_words(text, size, overlap, source):
    pass

text = "one two three four five six seven eight nine ten"
for c in chunk_words(text, 4, 1, "doc"):
    print(c)
`,
solution:py`def chunk_words(text, size, overlap, source):
    if size <= 0 or overlap >= size or overlap < 0:
        raise ValueError("need size > 0 and 0 <= overlap < size")
    words = text.split()
    step = size - overlap
    chunks, start = [], 0
    while start < len(words):
        piece = words[start:start + size]
        chunks.append({"id": f"{source}-{len(chunks)}", "source": source,
                       "start": start, "text": " ".join(piece)})
        if start + size >= len(words):
            break
        start += step
    return chunks
`,
tests:py`text = "one two three four five six seven eight nine ten"
c = chunk_words(text, 4, 1, "doc")
assert [x["start"] for x in c] == [0, 3, 6], "Expected starts [0, 3, 6], got " + repr([x["start"] for x in c])
assert c[0] == {"id": "doc-0", "source": "doc", "start": 0, "text": "one two three four"}, "First chunk wrong: " + repr(c[0])
assert c[1]["text"] == "four five six seven", "Overlap: chunk 2 should start with 'four'"
assert c[-1]["text"] == "seven eight nine ten" and c[-1]["id"] == "doc-2"
c2 = chunk_words(text, 5, 0, "d")
assert [x["text"] for x in c2] == ["one two three four five", "six seven eight nine ten"], "No overlap, exact fit -> 2 chunks"
assert len(chunk_words("a b c", 10, 2, "s")) == 1, "Short text -> single chunk"
assert chunk_words("", 5, 1, "s") == [], "Empty text -> no chunks"
for bad in [(3, 3), (0, 0), (2, 5)]:
    try:
        chunk_words(text, bad[0], bad[1], "x"); assert False, "Should raise ValueError for size/overlap " + repr(bad)
    except ValueError:
        pass
print("✅ All checks passed!")
`},
project:{title:"Chunk & index your own notes",
desc:"Take 3–5 of your own documents (markdown notes, a PDF converted to text, docs pages), chunk them, embed each chunk and store everything in a local JSON ‘vector store’.",
steps:["Load .md/.txt files from ./docs and chunk each with your chunk_words (try size 200, overlap 40).","Embed chunks in batches and save {id, source, text, vector} records to index.json.","Write search(query, k) that returns the top chunks with their source.","Experiment: sizes 80 vs 200 vs 500 — which gives the best matches for 5 test questions?"],
code:{gemini:py`import glob, json, pathlib
from google import genai
from google.genai import types

client = genai.Client()
records = []
for path in glob.glob("docs/*.md") + glob.glob("docs/*.txt"):
    text = pathlib.Path(path).read_text(encoding="utf-8")
    records += chunk_words(text, size=200, overlap=40, source=pathlib.Path(path).name)

BATCH = 50
for i in range(0, len(records), BATCH):
    batch = records[i:i + BATCH]
    r = client.models.embed_content(
        model="gemini-embedding-001", contents=[c["text"] for c in batch],
        config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT", output_dimensionality=768))
    for c, e in zip(batch, r.embeddings):
        c["vector"] = e.values

json.dump(records, open("index.json", "w"))
print(f"Indexed {len(records)} chunks")
`,
openai:py`import glob, json, pathlib
from openai import OpenAI

client = OpenAI()
records = []
for path in glob.glob("docs/*.md") + glob.glob("docs/*.txt"):
    text = pathlib.Path(path).read_text(encoding="utf-8")
    records += chunk_words(text, size=200, overlap=40, source=pathlib.Path(path).name)

BATCH = 100
for i in range(0, len(records), BATCH):
    batch = records[i:i + BATCH]
    r = client.embeddings.create(model="text-embedding-3-small", input=[c["text"] for c in batch])
    for c, d in zip(batch, r.data):
        c["vector"] = d.embedding

json.dump(records, open("index.json", "w"))
print(f"Indexed {len(records)} chunks")
`}}
});

/* ================= WEEK 12 ================= */
W.push({
id:12, phase:4, title:"Build a RAG pipeline",
goal:"Combine retrieval and generation: fetch relevant chunks, put them in a grounded prompt with citations, and make the model say ‘I don't know’ when the answer isn't there.",
plan:[["20m","Read"],["10m","Quiz"],["45m","Exercise"],["45m","Mini project"]],
explain:`
<p><b>RAG — Retrieval-Augmented Generation</b> — is the most common pattern in real LLM apps. Instead of hoping the model memorised your company handbook, you <b>look up</b> the relevant passages and <b>hand them to the model</b> with the question.</p>
<ol><li><b>Index</b> (once): chunk documents, embed, store. (Last week.)</li>
<li><b>Retrieve</b> (per question): embed the question, get the top-k chunks.</li>
<li><b>Augment</b>: build a prompt with the chunks, each labelled with an id.</li>
<li><b>Generate</b>: the model answers <i>using only those sources</i> and cites them like [1], [2].</li></ol>
<p>The grounding instructions are crucial: <i>“Answer only from the sources. If they don't contain the answer, say you don't know. Cite sources in square brackets.”</i> That's what turns a creative writer into a trustworthy assistant.</p>
<p>RAG beats “just paste everything” when documents are large or change often, and it gives you citations users can check. Retrieval quality usually matters more than which LLM you pick: if the right chunk isn't retrieved, the model can't use it.</p>`,
concepts:[["RAG","Retrieve relevant text, add it to the prompt, then generate an answer."],["Grounding","Instructing the model to answer only from supplied sources."],["Citation","A reference like [2] pointing to the source chunk used."],["Retriever","The component that finds relevant chunks for a question."],["Context stuffing","Putting retrieved chunks into the prompt."]],
resources:[
 {t:"Gemini API: Embeddings (includes search/RAG use cases)",u:"https://ai.google.dev/gemini-api/docs/embeddings",type:"docs"},
 {t:"Advanced Retrieval for AI with Chroma — DeepLearning.AI",u:"https://www.deeplearning.ai/courses/advanced-retrieval-for-ai",type:"course"},
 {t:"OpenAI: Retrieval guide",u:"https://platform.openai.com/docs/guides/retrieval",type:"docs"},
 {t:"Google Gemini Cookbook (search & RAG examples)",u:"https://github.com/google-gemini/cookbook",type:"code"}
],
quiz:[
 {q:"What does the ‘R’ in RAG do?",o:["Rewrites the answer","Retrieves relevant information to give the model","Repeats the question","Rates the answer"],a:1,e:"Retrieval fetches the passages the model will ground its answer in."},
 {q:"Why number the sources in the prompt?",o:["Decoration","So the model can cite them and users can verify","To save tokens","It's required by JSON"],a:1,e:"Numbered sources enable citations like [2]."},
 {q:"The answer isn't in the retrieved sources. The ideal behaviour is…",o:["Make up a plausible answer","Say it doesn't know (based on the sources)","Answer in another language","Return an empty string"],a:1,e:"Grounding + an ‘I don't know’ escape hatch prevents hallucinations."},
 {q:"The RAG app gives wrong answers. The right chunk is never in the top-k. What should you fix first?",o:["The LLM model","Retrieval (chunking, embeddings, k, query)","The font","The temperature"],a:1,e:"If retrieval misses, generation can't succeed."},
 {q:"When is RAG preferable to pasting all documents into the prompt?",o:["When docs are tiny and never change","When docs are large or change often, and you want citations","Never","Only for images"],a:1,e:"RAG scales to big, changing knowledge bases and supports citations."}
],
exercise:{title:"Mini RAG: retrieve + grounded prompt",
task:`<p>No embeddings API in the browser, so we'll use a simple <b>word-overlap</b> retriever:</p>
<ul><li><code>tokenize(text)</code>: lowercase, keep only letters/digits/spaces (replace everything else with a space), split, and drop words in <code>STOP</code>. Return a <b>set</b>.</li>
<li><code>retrieve(question, chunks, k=2)</code>: score = number of shared tokens between question and chunk text. Return the top-k chunks (dicts) with score &gt; 0, highest first (ties: keep original order).</li>
<li><code>build_rag_prompt(question, chunks)</code>: return exactly:
<pre class="code">Answer using ONLY the sources. If the answer is not in them, say "I don't know". Cite like [1].

[1] (SOURCE) TEXT
[2] (SOURCE) TEXT

Question: QUESTION</pre>
If <code>chunks</code> is empty, the sources section is the single line <code>(no sources found)</code>.</li></ul>`,
starter:py`import re
STOP = {"the", "a", "an", "is", "of", "to", "and", "in", "what", "how", "do", "i", "for", "on", "my"}

def tokenize(text):
    pass

def retrieve(question, chunks, k=2):
    pass

def build_rag_prompt(question, chunks):
    pass

CHUNKS = [
    {"source": "hr.md", "text": "Employees get 24 days of paid leave per year."},
    {"source": "it.md", "text": "Reset your password from the account settings page."},
    {"source": "hr.md", "text": "Parental leave is 26 weeks, fully paid."},
]
q = "How many days of paid leave do I get?"
print(build_rag_prompt(q, retrieve(q, CHUNKS)))
`,
solution:py`import re
STOP = {"the", "a", "an", "is", "of", "to", "and", "in", "what", "how", "do", "i", "for", "on", "my"}

def tokenize(text):
    clean = re.sub(r"[^a-z0-9 ]", " ", text.lower())
    return {w for w in clean.split() if w not in STOP}

def retrieve(question, chunks, k=2):
    q = tokenize(question)
    scored = [(len(q & tokenize(c["text"])), i, c) for i, c in enumerate(chunks)]
    scored = [s for s in scored if s[0] > 0]
    scored.sort(key=lambda s: (-s[0], s[1]))
    return [c for _, _, c in scored[:k]]

def build_rag_prompt(question, chunks):
    head = 'Answer using ONLY the sources. If the answer is not in them, say "I don\'t know". Cite like [1].'
    if chunks:
        src = "\n".join(f"[{i}] ({c['source']}) {c['text']}" for i, c in enumerate(chunks, 1))
    else:
        src = "(no sources found)"
    return f"{head}\n\n{src}\n\nQuestion: {question}"
`,
tests:py`assert tokenize("How many DAYS of paid-leave?") == {"many", "days", "paid", "leave"}, "tokenize wrong: " + repr(tokenize("How many DAYS of paid-leave?"))
C = [{"source": "hr.md", "text": "Employees get 24 days of paid leave per year."},
     {"source": "it.md", "text": "Reset your password from the account settings page."},
     {"source": "hr.md", "text": "Parental leave is 26 weeks, fully paid."}]
r = retrieve("How many days of paid leave do I get?", C)
assert r == [C[0], C[2]], "Expected the two leave chunks, best first. Got " + repr(r)
assert retrieve("password reset", C, k=5) == [C[1]], "Only chunks with score > 0"
assert retrieve("quantum physics", C) == [], "No overlap -> empty list"
p = build_rag_prompt("Q?", [C[0], C[1]])
exp = 'Answer using ONLY the sources. If the answer is not in them, say "I don\'t know". Cite like [1].\n\n[1] (hr.md) Employees get 24 days of paid leave per year.\n[2] (it.md) Reset your password from the account settings page.\n\nQuestion: Q?'
assert p == exp, "Prompt format mismatch. Got:\n" + p
assert "(no sources found)" in build_rag_prompt("x", []), "Handle empty chunks"
print("✅ All checks passed!")
`},
project:{title:"‘Chat with my docs’ CLI",
desc:"Use last week's index.json: retrieve top chunks with embeddings, build the grounded prompt, and answer with citations — plus an ‘I don't know’ test.",
steps:["Load index.json; embed the question with the query task type.","Take the top 4 chunks with your top_k/cosine code.","Build the prompt with build_rag_prompt and generate.","Test 5 answerable and 2 unanswerable questions; check citations are correct."],
code:{gemini:py`import json
from google import genai
from google.genai import types

client = genai.Client()
index = json.load(open("index.json"))

def search(q, k=4):
    qv = client.models.embed_content(model="gemini-embedding-001", contents=[q],
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY", output_dimensionality=768)
    ).embeddings[0].values
    scored = sorted(index, key=lambda c: cosine(qv, c["vector"]), reverse=True)
    return scored[:k]

while (q := input("\nask> ")):
    chunks = search(q)
    resp = client.models.generate_content(model="gemini-flash-latest",
                                          contents=build_rag_prompt(q, chunks))
    print(resp.text)
    print("sources:", ", ".join(sorted({c["source"] for c in chunks})))
`,
openai:py`import json
from openai import OpenAI

client = OpenAI()
index = json.load(open("index.json"))

def search(q, k=4):
    qv = client.embeddings.create(model="text-embedding-3-small", input=[q]).data[0].embedding
    scored = sorted(index, key=lambda c: cosine(qv, c["vector"]), reverse=True)
    return scored[:k]

while (q := input("\nask> ")):
    chunks = search(q)
    resp = client.responses.create(model="gpt-6-luna", input=build_rag_prompt(q, chunks))
    print(resp.output_text)
    print("sources:", ", ".join(sorted({c["source"] for c in chunks})))
`}}
});

/* ================= WEEK 13 ================= */
W.push({
id:13, phase:4, title:"Better RAG: vector DBs, filters, hybrid search",
goal:"Level up retrieval with a real vector database, metadata filtering, hybrid (keyword + semantic) search, re-ranking and query rewriting.",
plan:[["25m","Read"],["10m","Quiz"],["45m","Exercise"],["40m","Mini project"]],
explain:`
<p>A JSON file and a Python loop are fine for a few thousand chunks. Beyond that, use a <b>vector database</b> (Chroma, pgvector, Qdrant, LanceDB…). It stores vectors and metadata and finds nearest neighbours fast.</p>
<p>Techniques that noticeably improve answers:</p>
<ul>
<li><b>Metadata filtering</b> — restrict the search first: only the “HR” department, only documents from 2025, only this user's files.</li>
<li><b>Hybrid search</b> — combine <i>keyword</i> search (great for exact terms like error codes and product names) with <i>semantic</i> search (great for paraphrases). Merge the two ranked lists, e.g. with <b>Reciprocal Rank Fusion (RRF)</b>: each result earns points based on its position in each list — being near the top of either list helps.</li>
<li><b>Re-ranking</b> — retrieve 20 candidates cheaply, then use a stronger model to reorder and keep the best 4.</li>
<li><b>Query rewriting</b> — ask the LLM to turn a vague follow-up (“what about for part-timers?”) into a standalone search query.</li>
</ul>
<div class="callout"><b>Measure before optimising:</b> keep a list of ~20 questions with the chunk that <i>should</i> be found, and check how often it lands in the top-k (“hit rate”). You'll formalise this in Phase 7.</div>`,
concepts:[["Vector database","Storage that indexes embeddings for fast similarity search."],["Metadata filter","Restricting search by fields like department or date."],["Hybrid search","Combining keyword and semantic search results."],["Reciprocal Rank Fusion","Merging ranked lists by awarding points for high positions in each."],["Re-ranking","Reordering retrieved candidates with a more accurate model."],["Query rewriting","Turning a user message into a better standalone search query."]],
resources:[
 {t:"Chroma docs — getting started",u:"https://docs.trychroma.com/",type:"docs"},
 {t:"Vector Databases: from Embeddings to Applications — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/vector-databases-embeddings-applications/",type:"course"},
 {t:"Building Agentic RAG with LlamaIndex — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llamaindex/",type:"course"},
 {t:"pgvector (vector search in Postgres)",u:"https://github.com/pgvector/pgvector",type:"code"}
],
quiz:[
 {q:"Which search style is best for an exact error code like ‘ERR_4021’?",o:["Semantic only","Keyword search (ideally as part of hybrid)","Neither","Image search"],a:1,e:"Exact rare tokens are keyword search's strength; hybrid gets the best of both."},
 {q:"What does metadata filtering do?",o:["Deletes old docs","Restricts the search to chunks matching conditions (e.g. department=HR)","Makes vectors shorter","Translates text"],a:1,e:"Filters narrow the candidate set before or during similarity search."},
 {q:"In Reciprocal Rank Fusion, a document ranked #1 in one list and absent from the other…",o:["Gets zero points","Still earns a strong score from its #1 position","Is removed","Is ranked last"],a:1,e:"RRF rewards high positions in any list."},
 {q:"Why re-rank?",o:["To retrieve fewer tokens from disk","A stronger model reorders a broad candidate set for higher precision","It's required by vector DBs","To hide sources"],a:1,e:"Cheap broad retrieval + accurate re-ranking = better top results."},
 {q:"User asks “and for part-timers?” after a question about leave. What helps retrieval most?",o:["Query rewriting into a standalone question","Higher temperature","Shorter chunks only","Nothing"],a:0,e:"Rewrite to e.g. “paid leave policy for part-time employees” before searching."}
],
exercise:{title:"Metadata filter + Reciprocal Rank Fusion",
task:`<p>Implement:</p>
<ul><li><code>filter_chunks(chunks, **conditions)</code>: keep chunks whose <code>chunk["meta"]</code> has <b>all</b> the given key=value pairs.</li>
<li><code>rrf(rankings, k=60)</code>: <code>rankings</code> is a list of ranked lists of ids (best first). Each id scores <code>1 / (k + rank)</code> for every list it appears in, where rank starts at <b>1</b>. Return ids sorted by total score (highest first); break ties by id alphabetically.</li></ul>`,
starter:py`def filter_chunks(chunks, **conditions):
    pass

def rrf(rankings, k=60):
    pass

chunks = [
    {"id": "a", "meta": {"dept": "hr", "year": 2025}},
    {"id": "b", "meta": {"dept": "it", "year": 2025}},
    {"id": "c", "meta": {"dept": "hr", "year": 2023}},
]
print([c["id"] for c in filter_chunks(chunks, dept="hr", year=2025)])   # ['a']

keyword_rank  = ["d3", "d1", "d7"]
semantic_rank = ["d1", "d5", "d3"]
print(rrf([keyword_rank, semantic_rank]))
`,
solution:py`def filter_chunks(chunks, **conditions):
    return [c for c in chunks
            if all(c.get("meta", {}).get(k) == v for k, v in conditions.items())]

def rrf(rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    return sorted(scores, key=lambda d: (-scores[d], d))
`,
tests:py`chunks = [{"id": "a", "meta": {"dept": "hr", "year": 2025}}, {"id": "b", "meta": {"dept": "it", "year": 2025}}, {"id": "c", "meta": {"dept": "hr", "year": 2023}}]
assert [c["id"] for c in filter_chunks(chunks, dept="hr")] == ["a", "c"], "Filter by one field"
assert [c["id"] for c in filter_chunks(chunks, dept="hr", year=2025)] == ["a"], "Filter by all fields"
assert filter_chunks(chunks) == chunks, "No conditions -> everything"
assert filter_chunks(chunks, dept="sales") == [], "No matches -> []"
r = rrf([["d3", "d1", "d7"], ["d1", "d5", "d3"]])
assert r[0] == "d1", "d1 (ranks 2 and 1) should win, got " + repr(r)
assert r == ["d1", "d3", "d5", "d7"], "Expected ['d1','d3','d5','d7'], got " + repr(r)
assert rrf([["x", "y"], ["y", "x"]]) == ["x", "y"], "Ties broken alphabetically"
assert rrf([["a", "b", "c"]], k=0) == ["a", "b", "c"]
print("✅ All checks passed!")
`},
project:{title:"Upgrade to Chroma with filters",
desc:"Move your notes index into a local Chroma collection with metadata, add a department/topic filter, and compare answers before/after.",
steps:["pip install chromadb. Create a PersistentClient and a collection.","Add chunks with ids, your own embeddings, and metadata (source, topic).","Query with where={'topic': 'python'} and n_results=4.","Compare hit rate on 10 test questions: JSON-loop search vs Chroma + filters."],
code:{gemini:py`import chromadb
from google import genai
from google.genai import types

client = genai.Client()
db = chromadb.PersistentClient(path="chroma_db")
col = db.get_or_create_collection("notes", metadata={"hnsw:space": "cosine"})

def embed(texts, task):
    r = client.models.embed_content(model="gemini-embedding-001", contents=texts,
        config=types.EmbedContentConfig(task_type=task, output_dimensionality=768))
    return [e.values for e in r.embeddings]

chunks = chunk_words(open("docs/python.md").read(), 200, 40, "python.md")
col.upsert(ids=[c["id"] for c in chunks],
           documents=[c["text"] for c in chunks],
           embeddings=embed([c["text"] for c in chunks], "RETRIEVAL_DOCUMENT"),
           metadatas=[{"source": c["source"], "topic": "python"} for c in chunks])

res = col.query(query_embeddings=embed(["how do list comprehensions work?"], "RETRIEVAL_QUERY"),
                n_results=4, where={"topic": "python"})
for doc, meta in zip(res["documents"][0], res["metadatas"][0]):
    print(meta["source"], "|", doc[:80])
`,
openai:py`import chromadb
from openai import OpenAI

client = OpenAI()
db = chromadb.PersistentClient(path="chroma_db")
col = db.get_or_create_collection("notes", metadata={"hnsw:space": "cosine"})

def embed(texts):
    return [d.embedding for d in client.embeddings.create(model="text-embedding-3-small", input=texts).data]

chunks = chunk_words(open("docs/python.md").read(), 200, 40, "python.md")
col.upsert(ids=[c["id"] for c in chunks],
           documents=[c["text"] for c in chunks],
           embeddings=embed([c["text"] for c in chunks]),
           metadatas=[{"source": c["source"], "topic": "python"} for c in chunks])

res = col.query(query_embeddings=embed(["how do list comprehensions work?"]),
                n_results=4, where={"topic": "python"})
for doc, meta in zip(res["documents"][0], res["metadatas"][0]):
    print(meta["source"], "|", doc[:80])
`}}
});
})();
