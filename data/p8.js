(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
/* ================= TOOLKIT P8 ================= */
W.push({
id:108, phase:0, title:"Async basics & Pydantic basics",
skip:"you can use async/await with asyncio.gather, and define a Pydantic model with Field constraints and handle ValidationError.",
goal:"Run many slow API calls at the same time with async/await (without overloading the provider), and describe data with Pydantic models that check and convert it automatically. Both show up everywhere in modern LLM code.",
plan:[["35m","Read & try"],["10m","Quiz"],["45m","Exercise"],["30m","Mini project"]],
analogy:"<b>Async</b> is a good waiter. A bad waiter takes one table's order, stands in the kitchen until the food is ready, serves it, and only then goes to the next table. A good waiter takes an order, hands it to the kitchen, and serves other tables while it cooks. <code>await</code> means “this will take a while, go do something else and come back.” A <b>semaphore</b> is the rule “no more than 3 orders in the kitchen at once”. <b>Pydantic</b> is the bouncer from Week 8 with a printed checklist. It even tidies things up at the door, turning the text “1999” into the number 1999.",
why:"LLM calls are slow: seconds, not milliseconds. Summarising 100 documents one after another could take minutes, and async can make it many times faster. Frameworks like FastAPI (Week 25), the OpenAI Agents SDK and MCP servers are async-first. Pydantic is how nearly every LLM library defines structured output, tool arguments and settings (Weeks 7, 8, 9, 19–21).",
explain:`
<p><b>Why async?</b> Most of the time an LLM call is just <i>waiting</i> for the network. Async lets one program wait for many things at once.</p>
<pre class="code">import asyncio

async def ask(prompt):                 # "async def" makes a coroutine function
    await asyncio.sleep(1)             # stand-in for a slow API call
    return prompt.upper()

async def main():
    results = await asyncio.gather(ask("a"), ask("b"), ask("c"))   # all 3 at once: ~1s, not 3s
    print(results)                     # ['A', 'B', 'C'] - same order as the inputs

asyncio.run(main())                    # start the event loop (once, at the top of your program)</pre>
<ul>
<li>Calling an <code>async def</code> function doesn't run it yet. It gives you a <i>coroutine</i> that must be <code>await</code>ed.</li>
<li><code>await</code> can only be used inside an <code>async def</code>. (Notebooks and this page's exercise box allow a top-level await for convenience.)</li>
<li><code>asyncio.gather(...)</code> runs several coroutines concurrently and returns their results <b>in order</b>.</li>
<li>Use async SDK clients: <code>client.aio.models.generate_content</code> (Gemini), <code>AsyncOpenAI</code>, <code>AsyncAnthropic</code>.</li>
<li><b>Be polite:</b> firing 500 requests at once will hit rate limits (429). An <code>asyncio.Semaphore(5)</code> lets only 5 run at a time: <code>async with sem: ...</code>.</li>
<li>Never call slow <i>blocking</i> code (like <code>time.sleep</code> or <code>requests.get</code>) inside async code. It freezes every other task. Use <code>await asyncio.sleep</code> and async clients instead.</li>
</ul>
<p><b>Pydantic</b> (<code>pip install pydantic</code>) turns type hints into real checks:</p>
<pre class="code">from pydantic import BaseModel, Field, ValidationError

class Movie(BaseModel):
    title: str = Field(min_length=1)
    year: int = Field(ge=1888)                 # ge = "greater than or equal"
    genres: list[str] = []

m = Movie.model_validate_json('{"title": "Alien", "year": "1979"}')
m.year          # 1979 - the text "1979" was converted to an int
m.model_dump()  # back to a plain dict   (model_dump_json() for JSON text)</pre>
<ul>
<li>Bad data raises <code>ValidationError</code> with a precise list of what's wrong. That's the message you feed back to the model in a repair loop (Week 8).</li>
<li>LLM libraries read your model to build a JSON schema for the model to follow (<code>Movie.model_json_schema()</code>). That's how structured output works in Week 7.</li>
<li>Useful <code>Field</code> rules: <code>min_length</code>/<code>max_length</code>, <code>ge</code>/<code>le</code> (at least / at most), <code>description="..."</code> (which the LLM sees!), and <code>Literal[...]</code> types for fixed choices.</li>
</ul>
<p class="small muted">The exercise downloads the pydantic package into your browser the first time you run it (a few seconds).</p>`,
concepts:[["async / await","async def makes a coroutine; await pauses it while waiting so other work can run."],["asyncio.gather","Run several coroutines concurrently and get the results in input order."],["Semaphore","Limits how many tasks run at once, to respect rate limits."],["Blocking call","Code that freezes the event loop (time.sleep, requests); avoid it in async code."],["Pydantic BaseModel","A class whose type hints are checked and converted automatically."],["ValidationError","Pydantic's detailed ‘what's wrong’ error; great for repair loops."]],
resources:[
 {t:"Python docs: asyncio (coroutines and tasks)",u:"https://docs.python.org/3/library/asyncio-task.html",type:"docs"},
 {t:"Real Python: Async IO in Python, a complete walkthrough",u:"https://realpython.com/async-io-python/",type:"article"},
 {t:"Pydantic docs: Models",u:"https://docs.pydantic.dev/latest/concepts/models/",type:"docs"},
 {t:"Pydantic docs: Fields",u:"https://docs.pydantic.dev/latest/concepts/fields/",type:"docs"}
],
quiz:[
 {q:"You call <code>ask(\"hi\")</code> where ask is <code>async def</code>, without await. What do you get?",o:["The answer","A coroutine object that hasn't run yet","An error immediately","None"],a:1,e:"Coroutines only run when awaited (or scheduled with gather or tasks)."},
 {q:"Three independent 2-second LLM calls with <code>asyncio.gather</code> take roughly…",o:["6 seconds","2 seconds","0 seconds","It depends on the model's temperature"],a:1,e:"They wait at the same time, so the total is about the slowest one."},
 {q:"Why wrap calls in <code>asyncio.Semaphore(5)</code>?",o:["To make them sequential","To allow at most 5 at once, avoiding rate limits (429)","Encryption","To cache results"],a:1,e:"Concurrency with a cap is fast and polite."},
 {q:"<code>Movie(year=\"1979\")</code> where year is <code>int</code> in a Pydantic model gives…",o:["year == \"1979\" (unchanged)","year == 1979 (converted to int)","Always an error","None"],a:1,e:"Pydantic converts compatible values (lax mode). Something like \"soon\" would raise ValidationError."},
 {q:"Why do LLM libraries love Pydantic?",o:["It's required by Python","It turns your model into a JSON schema for the LLM and validates the reply","It makes models faster","It stores API keys"],a:1,e:"The schema goes to the model, and validation checks what comes back."}
],
exercise:{title:"Concurrent fake LLM calls + a Pydantic model",
task:`<p><b>Part A (async)</b>. <code>llm</code> is an <code>async</code> function that takes a prompt and returns a reply.</p>
<ul>
<li><code>async def ask_all(prompts, llm)</code>: run all calls <b>concurrently</b> and return the replies in the same order.</li>
<li><code>async def ask_limited(prompts, llm, limit=2)</code>: the same, but never more than <code>limit</code> calls at the same time (use <code>asyncio.Semaphore</code>).</li>
</ul>
<p><b>Part B (Pydantic)</b>. Define <code>class Movie(BaseModel)</code>: <code>title: str</code> (at least 1 character), <code>year: int</code> (1888 to 2100), <code>rating: float</code> (0 to 10), and <code>genres: list[str]</code> (default empty). Then write <code>parse_movie(json_text)</code>, which returns a <code>Movie</code>, or <code>None</code> if validation fails.</p>
<p class="small muted">The checks use <code>await</code> at the top level, which this exercise box supports.</p>`,
starter:py`import asyncio
from pydantic import BaseModel, Field, ValidationError


async def ask_all(prompts, llm):
    replies = []
    for p in prompts:                 # TODO: this runs one after another - make it concurrent
        replies.append(await llm(p))
    return replies


async def ask_limited(prompts, llm, limit=2):
    return await ask_all(prompts, llm)   # TODO: cap concurrency with asyncio.Semaphore(limit)


class Movie(BaseModel):
    title: str                        # TODO: add Field constraints
    year: int
    rating: float


def parse_movie(json_text):
    return Movie.model_validate_json(json_text)   # TODO: return None on ValidationError


async def fake_llm(prompt):
    await asyncio.sleep(0.2)
    return prompt.upper()

print(await ask_all(["a", "b", "c"], fake_llm))
`,
solution:py`import asyncio
from pydantic import BaseModel, Field, ValidationError


async def ask_all(prompts, llm):
    return list(await asyncio.gather(*(llm(p) for p in prompts)))


async def ask_limited(prompts, llm, limit=2):
    sem = asyncio.Semaphore(limit)

    async def one(p):
        async with sem:
            return await llm(p)

    return list(await asyncio.gather(*(one(p) for p in prompts)))


class Movie(BaseModel):
    title: str = Field(min_length=1)
    year: int = Field(ge=1888, le=2100)
    rating: float = Field(ge=0, le=10)
    genres: list[str] = []


def parse_movie(json_text):
    try:
        return Movie.model_validate_json(json_text)
    except ValidationError:
        return None


async def fake_llm(prompt):
    await asyncio.sleep(0.2)
    return prompt.upper()

print(await ask_all(["a", "b", "c"], fake_llm))
`,
tests:py`import asyncio, time
state = {"now": 0, "peak": 0}
async def slow_llm(p):
    state["now"] += 1; state["peak"] = max(state["peak"], state["now"])
    await asyncio.sleep(0.2)
    state["now"] -= 1
    return "reply:" + p

t0 = time.perf_counter()
r = await ask_all(["a", "b", "c", "d", "e"], slow_llm)
dt = time.perf_counter() - t0
assert r == ["reply:a", "reply:b", "reply:c", "reply:d", "reply:e"], "Replies must be in input order: " + repr(r)
assert dt < 0.7, f"ask_all took {dt:.2f}s - 5 calls of 0.2s should run concurrently (~0.2s), use asyncio.gather"
state["peak"] = 0
t0 = time.perf_counter()
r = await ask_limited(["a", "b", "c", "d"], slow_llm, limit=2)
dt = time.perf_counter() - t0
assert r == ["reply:a", "reply:b", "reply:c", "reply:d"], "ask_limited must keep order"
assert state["peak"] <= 2, f"At most 2 calls at once, but {state['peak']} ran together - use asyncio.Semaphore(limit)"
assert state["peak"] == 2 and dt < 0.7, "With limit=2, two calls should still run at the same time"
m = parse_movie('{"title": "Alien", "year": "1979", "rating": 8.5}')
assert isinstance(m, Movie) and m.year == 1979 and m.genres == [], "Valid JSON should give a Movie (year converted to int, genres default [])"
assert parse_movie('{"title": "", "year": 2000, "rating": 5}') is None, "Empty title must fail (min_length=1)"
assert parse_movie('{"title": "Old", "year": 1500, "rating": 5}') is None, "year must be >= 1888"
assert parse_movie('{"title": "X", "year": 2000, "rating": 11}') is None, "rating must be <= 10"
assert parse_movie('{"title": "X", "year": "soon", "rating": 5}') is None, "Non-numeric year must fail"
assert parse_movie('not json') is None, "Invalid JSON should return None too"
print("✅ All checks passed!")
`},
project:{title:"Summarise many texts concurrently into validated objects",
desc:"Combine both ideas: send several short texts to a model <b>concurrently</b> (with a concurrency cap), ask for a structured summary, and validate each reply with a Pydantic model. Time it against a one-at-a-time version to feel the speed-up.",
steps:["Make a list of 6 to 10 short texts (paragraphs from articles or your notes).","Define <code>class Summary(BaseModel)</code> with <code>title</code>, <code>bullets: list[str]</code> and <code>sentiment: Literal[\"positive\", \"neutral\", \"negative\"]</code>.","Write an async <code>summarise(text)</code> using your provider's async client, wrapped in a semaphore of 3.","Run them all with <code>asyncio.gather</code>, print the results, and compare the total time with a plain loop."],
code:{gemini:py`# pip install google-genai pydantic
import asyncio, time
from typing import Literal
from pydantic import BaseModel
from google import genai

class Summary(BaseModel):
    title: str
    bullets: list[str]
    sentiment: Literal["positive", "neutral", "negative"]

client = genai.Client()
sem = asyncio.Semaphore(3)          # free tier has rate limits - stay polite

async def summarise(text: str) -> Summary:
    async with sem:
        resp = await client.aio.models.generate_content(        # the async version of the client
            model="gemini-flash-latest",
            contents=f"Summarise:\n<text>{text}</text>",
            config={"response_mime_type": "application/json", "response_schema": Summary},
        )
        return resp.parsed

async def main(texts):
    t0 = time.perf_counter()
    results = await asyncio.gather(*(summarise(t) for t in texts))
    for s in results:
        print(f"- {s.title} ({s.sentiment}): {'; '.join(s.bullets)}")
    print(f"{len(texts)} texts in {time.perf_counter() - t0:.1f}s")

texts = [open(f"texts/{i}.txt", encoding="utf-8").read() for i in range(1, 7)]
asyncio.run(main(texts))
`,
openai:py`# pip install openai pydantic
import asyncio, time
from typing import Literal
from pydantic import BaseModel
from openai import AsyncOpenAI

class Summary(BaseModel):
    title: str
    bullets: list[str]
    sentiment: Literal["positive", "neutral", "negative"]

client = AsyncOpenAI()
sem = asyncio.Semaphore(3)

async def summarise(text: str) -> Summary:
    async with sem:
        resp = await client.responses.parse(
            model="gpt-6-luna",
            input=f"Summarise:\n<text>{text}</text>",
            text_format=Summary,
        )
        return resp.output_parsed

async def main(texts):
    t0 = time.perf_counter()
    results = await asyncio.gather(*(summarise(t) for t in texts))
    for s in results:
        print(f"- {s.title} ({s.sentiment}): {'; '.join(s.bullets)}")
    print(f"{len(texts)} texts in {time.perf_counter() - t0:.1f}s")

texts = [open(f"texts/{i}.txt", encoding="utf-8").read() for i in range(1, 7)]
asyncio.run(main(texts))
`,
anthropic:py`# pip install anthropic pydantic
import asyncio, time
from typing import Literal
from pydantic import BaseModel
import anthropic

class Summary(BaseModel):
    title: str
    bullets: list[str]
    sentiment: Literal["positive", "neutral", "negative"]

client = anthropic.AsyncAnthropic()
sem = asyncio.Semaphore(3)

async def summarise(text: str) -> Summary:
    async with sem:
        resp = await client.messages.parse(
            model="claude-sonnet-5-5", max_tokens=800,
            messages=[{"role": "user", "content": f"Summarise:\n<text>{text}</text>"}],
            output_format=Summary,
        )
        return resp.parsed_output

async def main(texts):
    t0 = time.perf_counter()
    results = await asyncio.gather(*(summarise(t) for t in texts))
    for s in results:
        print(f"- {s.title} ({s.sentiment}): {'; '.join(s.bullets)}")
    print(f"{len(texts)} texts in {time.perf_counter() - t0:.1f}s")

texts = [open(f"texts/{i}.txt", encoding="utf-8").read() for i in range(1, 7)]
asyncio.run(main(texts))
`}}
});
})();
