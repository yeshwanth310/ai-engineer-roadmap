/* Claude (Anthropic) code tabs + everyday analogies / "why it matters" for weeks 1–13.
   Merged into the week objects by js/app.js. */
(function(){
const py = String.raw;
const P = window.ROADMAP.patches = window.ROADMAP.patches || {};
const TXT = py`
def text_of(msg):
    # Claude replies are a list of content blocks; pick the text block(s)
    return "".join(b.text for b in msg.content if b.type == "text")
`;

P[1] = {
analogy:"Imagine a friend who has read millions of books and plays a very advanced game of ‘finish the sentence’. They don't look anything up — they just have an incredibly good feel for what words usually come next. Tokens are the Lego bricks of text they play with, and the context window is the size of the table they can lay bricks on at once.",
why:"Almost every surprise you'll meet later — made-up facts, cut-off answers, rising costs, ‘it forgot what I said’ — traces back to these few ideas. Understanding them turns LLM behaviour from mysterious into predictable.",
anthropic:py`# pip install anthropic   (needs ANTHROPIC_API_KEY + API credits — separate from Claude Pro)
import anthropic

client = anthropic.Anthropic()          # reads ANTHROPIC_API_KEY from the environment
MODEL = "claude-sonnet-5-5"             # see the Claude models overview page for current IDs

text = "Large language models predict the next token, one at a time."
count = client.messages.count_tokens(model=MODEL, messages=[{"role": "user", "content": text}])
print("Real token count:", count.input_tokens)
print("Rule-of-thumb   :", -(-len(text) // 4))

msg = client.messages.create(
    model=MODEL,
    max_tokens=300,                     # Claude requires a max output length
    messages=[{"role": "user", "content": "In two sentences, explain what a token is to a 12-year-old."}],
)
print(next(b.text for b in msg.content if b.type == "text"))
print(msg.usage)                        # input_tokens / output_tokens
`};

P[2] = {
analogy:"Prompting is like briefing a brilliant new colleague on their first day. “Write something about dogs” gets you anything. “Write three bullet points for first-time owners about adopting a retired greyhound, friendly tone” gets you exactly what you need. Examples (few-shot) are like showing them two finished reports and saying “like these”.",
why:"Prompting is the cheapest, fastest lever you have. A clearer prompt often beats switching to a bigger, pricier model — and every later technique (RAG, tools, agents) is built on well-written prompts.",
anthropic:py`import anthropic

client = anthropic.Anthropic()
MODEL = "claude-sonnet-5-5"
SYSTEM = "You label product reviews. Reply with exactly one word: POSITIVE, NEGATIVE or MIXED."

EXAMPLES = [("Love it, works perfectly", "POSITIVE"),
            ("Stopped working after a week", "NEGATIVE"),
            ("Great sound but the battery is awful", "MIXED")]

def build_prompt(instruction, examples, user_input): ...  # your exercise solution

reviews = ["Oh great, another charger that melts. Fantastic.", "Does the job."]
for r in reviews:
    msg = client.messages.create(
        model=MODEL, max_tokens=10,
        system=SYSTEM,                                  # the system prompt
        messages=[{"role": "user", "content": build_prompt("Label this review.", EXAMPLES, r)}],
    )
    label = next(b.text for b in msg.content if b.type == "text").strip()
    print(f"{label:9} <- {r}")
`};

P[3] = {
analogy:"Prompt patterns are like cooking techniques: once you know how to sauté, roast and simmer, you can cook almost anything. Prompt chaining is an assembly line — each station does one simple job well. A prompt template is a form letter: the wording is fixed and you fill in the blanks, and if a blank is missing you want to notice before it's posted.",
why:"Real apps run the same prompts thousands of times. Treating prompts as tested, versioned templates — and splitting big jobs into small steps — is what makes results consistent and problems easy to find.",
anthropic:py`import anthropic
client = anthropic.Anthropic()
MODEL = "claude-sonnet-5-5"

EXTRACT = "List the 5 most important facts in the text as bullets. Text:\n<text>{article}</text>"
EXPLAIN = ("Using ONLY these facts, explain the topic to a beginner in 120 words. "
           "If something is unclear, say 'I don't know'.\nFacts:\n{facts}")
CRITIC  = "Facts:\n{facts}\n\nExplanation:\n{draft}\n\nList any claims in the explanation NOT supported by the facts, or reply OK."

def ask(prompt):
    msg = client.messages.create(model=MODEL, max_tokens=800,
                                 messages=[{"role": "user", "content": prompt}])
    return next(b.text for b in msg.content if b.type == "text")

article = open("article.txt").read()
facts = ask(render(EXTRACT, article=article))
draft = ask(render(EXPLAIN, facts=facts))
print(draft, "\n--- critic ---\n", ask(render(CRITIC, facts=facts, draft=draft)))
`};

P[4] = {
analogy:"The chat apps (ChatGPT, Claude, Gemini, Grok) are restaurants: you order and a finished meal arrives. The API is the wholesale kitchen supplier: you get the raw ingredient — the model — and cook it into your own dishes. Your API key is your supplier account card, so you keep it in your wallet (an environment variable), never taped to the shop window (your code or GitHub).",
why:"This is the moment you go from using AI to building with it. Every app, agent and automation in the rest of the roadmap is just more elaborate versions of this one call.",
anthropic:py`import argparse
import anthropic

p = argparse.ArgumentParser()
p.add_argument("question")
p.add_argument("--system", default="You are a concise, helpful assistant.")
p.add_argument("--max-tokens", type=int, default=800)
args = p.parse_args()

client = anthropic.Anthropic()
msg = client.messages.create(
    model="claude-sonnet-5-5",
    system=args.system,
    max_tokens=args.max_tokens,
    messages=[{"role": "user", "content": args.question}],   # roles: "user" / "assistant"
)
print(next(b.text for b in msg.content if b.type == "text"))
u = msg.usage
print(f"\n[tokens] in={u.input_tokens} out={u.output_tokens}")
`};

P[5] = {
analogy:"Talking to an LLM through the API is like phoning a call centre where every call reaches a different agent with no notes. To continue a conversation you must read out the whole story so far each time. Trimming history is like summarising: “Hi, I'm the customer with the broken fridge from earlier…”. Streaming is the agent speaking as they think, instead of silence followed by a monologue.",
why:"Every chatbot you build depends on managing history well — too little and it ‘forgets’, too much and it gets slow and expensive. Streaming is the single easiest way to make an app feel fast.",
anthropic:py`import anthropic

client = anthropic.Anthropic()
SYSTEM = "You are a friendly Python tutor. Keep answers short."
history = []

while True:
    msg = input("\nyou> ").strip()
    if msg == "/quit": break
    if msg == "/reset": history = []; print("(history cleared)"); continue
    history.append({"role": "user", "content": msg})
    print("bot> ", end="")
    with client.messages.stream(model="claude-sonnet-5-5", max_tokens=800,
                                system=SYSTEM, messages=history) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
        reply = stream.get_final_message()
    history.append({"role": "assistant", "content": reply.content})
    print()
`};

P[6] = {
analogy:"Retrying with exponential backoff is what you naturally do when a shop is packed: come back in 1 minute, then 2, then 4 — rather than banging on the door every second. Rate limits are the shop's ‘max 20 customers inside’ sign. And tokens are like a taxi meter: the longer the trip (especially the answer), the more you pay.",
why:"Free tiers have tight limits, and networks fail. Code that handles this gracefully keeps working at 2 a.m. without you — and cost awareness keeps a fun project from becoming a nasty bill.",
anthropic:py`import csv, glob, pathlib
import anthropic

client = anthropic.Anthropic(max_retries=0, timeout=30)   # we do our own retries here

def summarise(text):
    try:
        return client.messages.create(
            model="claude-sonnet-5-5", max_tokens=400,
            messages=[{"role": "user", "content": f"Summarise in 3 bullets:\n<doc>{text}</doc>"}])
    except anthropic.APIConnectionError as e:
        raise TransientError(str(e))
    except anthropic.APIStatusError as e:
        if e.status_code in (429, 500, 529):     # rate limited / server error / overloaded
            raise TransientError(str(e))
        raise                                     # 400/401/403: fix your code or key

pathlib.Path("summaries").mkdir(exist_ok=True)
with open("usage.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["file", "in", "out"])
    for path in glob.glob("notes/*.txt"):
        msg = call_with_retry(lambda: summarise(open(path).read()))
        text = next(b.text for b in msg.content if b.type == "text")
        pathlib.Path("summaries", pathlib.Path(path).name).write_text(text)
        w.writerow([path, msg.usage.input_tokens, msg.usage.output_tokens])
`};

P[7] = {
analogy:"Free-form text is a chatty letter; structured output is a filled-in form. Your code can't read a letter reliably, but it can read a form where the ‘Name’ box always holds a name. A schema is the blank form you hand the model, and schema-constrained output means the model is physically unable to write outside the boxes.",
why:"The moment you want an LLM to feed a database, a spreadsheet, another program or a tool, you need structured output. It's the bridge between ‘AI that talks’ and ‘AI that does work in software’.",
anthropic:py`from pydantic import BaseModel
import anthropic

class Ingredient(BaseModel):
    name: str
    quantity: str

class Recipe(BaseModel):
    title: str
    servings: int
    ingredients: list[Ingredient]
    steps: list[str]

client = anthropic.Anthropic()
text = open("recipe_post.txt").read()
resp = client.messages.parse(
    model="claude-sonnet-5-5",
    max_tokens=2000,
    messages=[{"role": "user", "content": f"Extract the recipe from this text:\n<post>{text}</post>"}],
    output_format=Recipe,               # Claude structured outputs (schema-constrained)
)
recipe: Recipe = resp.parsed_output
open("recipe.json", "w").write(recipe.model_dump_json(indent=2))
for i in recipe.ingredients:
    print(f"- {i.quantity} {i.name}")
`};

P[8] = {
analogy:"Validation is a bouncer with a checklist: right shape of ID isn't enough — the date of birth must also make sense. A repair loop is a teacher handing back homework with specific red-pen notes (“question 3: priority must be low, medium or high”) — the student fixes exactly those points. And you only allow a few resubmissions before calling a parent (a human or a fallback).",
why:"Bad data silently flowing into your systems is worse than an error. Validation plus self-repair gives you reliable data most of the time and a clear, safe failure the rest of the time.",
anthropic:py`import json
from typing import Literal
from pydantic import BaseModel, Field, ValidationError
import anthropic

class Ticket(BaseModel):
    title: str = Field(min_length=3)
    priority: Literal["low", "medium", "high"]
    estimate_hours: float = Field(ge=0)

client = anthropic.Anthropic()

def to_ticket(email: str, max_attempts: int = 3) -> Ticket:
    prompt = (f"Create a support ticket as JSON with keys title, priority, estimate_hours from:\n"
              f"<email>{email}</email>\nReturn only the JSON object.")
    for attempt in range(max_attempts):
        msg = client.messages.create(model="claude-sonnet-5-5", max_tokens=400,
                                     messages=[{"role": "user", "content": prompt}])
        raw = next(b.text for b in msg.content if b.type == "text")
        try:
            return Ticket.model_validate(extract_json(raw))     # extract_json from Week 7
        except (ValidationError, ValueError) as e:
            print(f"attempt {attempt + 1} invalid -> repairing")
            prompt += f"\nYour last answer was invalid:\n{e}\nReturn corrected JSON only."
    raise ValueError("Gave up after repairs")

print(to_ticket("Hi, the app crashes every time I log in. Pretty annoying!!"))
`};

P[9] = {
analogy:"Tool calling is like a manager (the model) with an assistant (your code). The manager can't leave the office, but can write a note: “please look up the weather in Pune”. The assistant does the errand and brings back the answer; the manager then writes the reply. The manager never touches the car keys — which is exactly why you decide which errands are allowed.",
why:"Tools are how LLMs escape the chat box: checking live data, reading your database, sending messages, booking things. Every agent is built on this mechanism, so understanding it deeply pays off for the rest of the roadmap.",
anthropic:py`import json
import anthropic

client = anthropic.Anthropic()
tools = [
  {"name": "get_weather", "description": "Get today's temperature (°C) for a city.",
   "input_schema": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]}},
  {"name": "add", "description": "Add two numbers (use negative b to subtract).",
   "input_schema": {"type": "object", "properties": {"a": {"type": "number"}, "b": {"type": "number"}},
                    "required": ["a", "b"]}},
]
messages = [{"role": "user", "content": "Is Pune warmer than London? By how much?"}]

for _ in range(5):                                        # safety cap
    resp = client.messages.create(model="claude-sonnet-5-5", max_tokens=1024,
                                  tools=tools, messages=messages)
    if resp.stop_reason != "tool_use":
        print(next(b.text for b in resp.content if b.type == "text")); break
    messages.append({"role": "assistant", "content": resp.content})   # keep the tool-use turn
    results = []
    for block in resp.content:
        if block.type == "tool_use":
            out = dispatch({"name": block.name, "args": block.input})  # your exercise code
            print("tool:", block.name, block.input, "->", out)
            results.append({"type": "tool_result", "tool_use_id": block.id, "content": json.dumps(out)})
    messages.append({"role": "user", "content": results})
`};

P[10] = {
analogy:"An embedding is like a location on a giant ‘map of meaning’. Similar ideas live in the same neighbourhood: “puppy” sits near “dog”, far from “invoice”. Cosine similarity is just checking whether two arrows drawn from the centre of the map point in the same direction. Search then becomes “find the places closest to where my question landed”.",
why:"Embeddings power semantic search, recommendations, duplicate detection and — most importantly for you — RAG. They let software find things by meaning rather than exact words, which is how people actually ask questions.",
anthropic:py`# Anthropic has no embeddings endpoint; its docs point to partners such as Voyage AI.
# pip install voyageai   and set VOYAGE_API_KEY  (you'd still use Claude for generation)
import json
import voyageai

vo = voyageai.Client()
EMBED = "voyage-4-lite"
faqs = [l.strip() for l in open("faqs.txt") if l.strip()]

def embed(texts, input_type):
    return vo.embed(texts, model=EMBED, input_type=input_type).embeddings

vectors = embed(faqs, "document")
json.dump(list(zip(faqs, vectors)), open("faq_vectors.json", "w"))

while (q := input("query> ")):
    qv = embed([q], "query")[0]
    for text, score in top_k(qv, list(zip(faqs, vectors)), k=3):   # your exercise code
        print(f"{score:.3f}  {text[:80]}")
`};

P[11] = {
analogy:"Chunking is like turning a thick textbook into index cards. One card per idea is easy to find and quick to read; a card with a whole chapter is useless as a quick reference, and a card with half a sentence makes no sense. Overlap is writing the last line of one card again at the top of the next, so no idea falls into the gap.",
why:"Chunking quietly decides the quality of every RAG system. Many ‘the AI gave a bad answer’ problems are really ‘the right paragraph was split badly or never found’ problems.",
anthropic:py`# Claude-based RAG: Claude generates, Voyage AI embeds (pip install voyageai)
import glob, json, pathlib
import voyageai

vo = voyageai.Client()
records = []
for path in glob.glob("docs/*.md") + glob.glob("docs/*.txt"):
    text = pathlib.Path(path).read_text(encoding="utf-8")
    records += chunk_words(text, size=200, overlap=40, source=pathlib.Path(path).name)

BATCH = 100
for i in range(0, len(records), BATCH):
    batch = records[i:i + BATCH]
    result = vo.embed([c["text"] for c in batch], model="voyage-4-lite", input_type="document")
    for c, v in zip(batch, result.embeddings):
        c["vector"] = v

json.dump(records, open("index.json", "w"))
print(f"Indexed {len(records)} chunks")
`};

P[12] = {
analogy:"RAG is an open-book exam. Instead of hoping the student memorised everything, you let them look up the relevant pages first, then answer — and cite the page numbers so the examiner can check. ‘Answer only from the book, and say “not in the book” if it isn't there’ is what stops them bluffing.",
why:"RAG is the most common pattern in real-world LLM apps: company chatbots, documentation assistants, legal and medical search. It lets a general model answer from your specific, private, up-to-date information — with receipts.",
anthropic:py`import json
import anthropic, voyageai

client = anthropic.Anthropic()
vo = voyageai.Client()
index = json.load(open("index.json"))          # built with Voyage embeddings (Week 11)

def search(q, k=4):
    qv = vo.embed([q], model="voyage-4-lite", input_type="query").embeddings[0]
    return sorted(index, key=lambda c: cosine(qv, c["vector"]), reverse=True)[:k]

while (q := input("\nask> ")):
    chunks = search(q)
    msg = client.messages.create(model="claude-sonnet-5-5", max_tokens=800,
                                 messages=[{"role": "user", "content": build_rag_prompt(q, chunks)}])
    print(next(b.text for b in msg.content if b.type == "text"))
    print("sources:", ", ".join(sorted({c["source"] for c in chunks})))
`};

P[13] = {
analogy:"A vector database is a library with a brilliant librarian who shelves books by topic, so finding ‘books like this one’ is instant. Metadata filters are the signs saying ‘Children's section’ or ‘Published after 2020’. Hybrid search is asking two librarians — one who matches exact titles and codes, one who understands what you mean — and combining their suggestions. Re-ranking is a final expert choosing the best four from their pile.",
why:"Once you have more than a handful of documents, retrieval quality becomes the bottleneck. These techniques are the standard toolbox for turning a ‘sometimes right’ RAG demo into a dependable product.",
anthropic:py`# Chroma + Voyage embeddings; answer with Claude as in Week 12
import chromadb, voyageai

vo = voyageai.Client()
db = chromadb.PersistentClient(path="chroma_db")
col = db.get_or_create_collection("notes", metadata={"hnsw:space": "cosine"})

def embed(texts, input_type):
    return vo.embed(texts, model="voyage-4-lite", input_type=input_type).embeddings

chunks = chunk_words(open("docs/python.md").read(), 200, 40, "python.md")
col.upsert(ids=[c["id"] for c in chunks],
           documents=[c["text"] for c in chunks],
           embeddings=embed([c["text"] for c in chunks], "document"),
           metadatas=[{"source": c["source"], "topic": "python"} for c in chunks])

res = col.query(query_embeddings=embed(["how do list comprehensions work?"], "query"),
                n_results=4, where={"topic": "python"})
for doc, meta in zip(res["documents"][0], res["metadatas"][0]):
    print(meta["source"], "|", doc[:80])
`};
})();
