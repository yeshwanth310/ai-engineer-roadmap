(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
const G = "gemini-flash-latest";

/* ================= WEEK 1 ================= */
W.push({
id:1, phase:1, title:"What an LLM really is (no maths)",
goal:"Build an accurate mental model of large language models: tokens, next-token prediction, context windows and randomness — enough to reason about why they behave the way they do.",
plan:[["20m","Read & watch"],["15m","Quiz"],["40m","Exercise"],["45m","Mini project"]],
explain:`
<p>A <b>large language model (LLM)</b> is a program that has read a huge amount of text and learned one core skill: <b>given some text, guess what comes next</b>. It does this one small piece at a time. Chatting, summarising, coding and “reasoning” are all built on top of that single skill, repeated very quickly.</p>
<p>Those small pieces are called <b>tokens</b>. A token is usually a word or part of a word — “unbelievable” might become “un”, “believ”, “able”. As a rough rule of thumb, <b>one token ≈ 4 characters of English</b>, or about ¾ of a word. APIs charge by tokens and limit you by tokens, so it pays to think in them.</p>
<p>The model can only “see” a limited amount of text at once — its <b>context window</b>. Everything the model knows about <i>your</i> conversation must fit in that window: instructions, chat history, documents you paste, and its own reply. Modern models have very large windows, but bigger inputs are slower and cost more.</p>
<p>When the model picks the next token it has several plausible candidates. A setting often called <b>temperature</b> controls how adventurous it is: low = predictable and repetitive, high = varied and creative (and more likely to go off the rails). This is why the same prompt can give different answers.</p>
<p>Finally, models are trained up to a <b>knowledge cutoff</b> date and then frozen. They don't browse or remember past chats unless an app gives them that ability — which is exactly what you'll learn to build.</p>
<div class="callout"><b>Why it matters for an engineer:</b> LLMs are powerful but <i>probabilistic</i>. They can sound confident and still be wrong (“hallucinate”). Good LLM apps are designed around this: clear instructions, the right context, checks on the output.</div>`,
concepts:[["Token","A chunk of text (word or word-piece) the model reads and writes. ~4 characters of English."],["Next-token prediction","The model's one core skill: guessing the most fitting next piece of text."],["Context window","The maximum amount of tokens (input + output) the model can consider at once."],["Temperature","A dial for randomness: low = focused and repeatable, high = creative and varied."],["Hallucination","A fluent, confident answer that is simply made up."],["Knowledge cutoff","The date after which the model learned nothing new from training."]],
resources:[
 {t:"Intro to Large Language Models — Andrej Karpathy (1h talk)",u:"https://www.youtube.com/watch?v=zjkBMFhNj_g",type:"video"},
 {t:"Generative AI for Everyone — DeepLearning.AI",u:"https://www.deeplearning.ai/courses/generative-ai-for-everyone/",type:"course"},
 {t:"Gemini API: Understand and count tokens",u:"https://ai.google.dev/gemini-api/docs/tokens",type:"docs"},
 {t:"OpenAI Tokenizer (see text split into tokens)",u:"https://platform.openai.com/tokenizer",type:"tool"}
],
quiz:[
 {q:"At its core, what does an LLM do when it generates text?",o:["Looks up answers in a database","Repeatedly predicts a fitting next token","Runs a search engine query","Copies sentences it memorised word-for-word"],a:1,e:"Everything an LLM produces comes from predicting the next token, one after another. It is not looking things up unless an app gives it a tool to do so."},
 {q:"Roughly how many tokens is a 2,000-character English paragraph?",o:["About 50","About 500","About 2,000","About 8,000"],a:1,e:"The rule of thumb is ~4 characters per token, so 2,000 ÷ 4 ≈ 500 tokens."},
 {q:"What must fit inside the context window?",o:["Only your latest message","Only the model's reply","Instructions, history, pasted documents AND the reply","Nothing — context windows are unlimited"],a:2,e:"The window covers everything the model considers in one call, including the text it generates."},
 {q:"You want the same classification label every time for the same input. Which temperature is sensible?",o:["Low","High","It makes no difference","Temperature only affects images"],a:0,e:"Low temperature makes the model pick the most likely tokens, so outputs are more consistent."},
 {q:"A model confidently cites a research paper that does not exist. This is called…",o:["Overfitting","Tokenization","Hallucination","Streaming"],a:2,e:"Hallucination is fluent but made-up output. Grounding the model in real data (RAG, later in the roadmap) reduces it."}
],
exercise:{title:"Token budget estimator",
task:`<p>Before sending text to a model, apps often estimate its size. Implement:</p>
<ul><li><code>estimate_tokens(text)</code> → an <b>int</b> using the rule of thumb <i>1 token ≈ 4 characters</i>, rounded <b>up</b> (so <code>"hello"</code> → 2). Empty text → 0.</li>
<li><code>fits_in_context(prompt, max_output_tokens, context_limit)</code> → <code>True</code> if the estimated prompt tokens plus <code>max_output_tokens</code> is <b>less than or equal to</b> <code>context_limit</code>.</li></ul>`,
starter:py`import math

def estimate_tokens(text):
    # ~4 characters per token, rounded UP
    pass

def fits_in_context(prompt, max_output_tokens, context_limit):
    pass

print(estimate_tokens("hello"))   # expect 2
`,
solution:py`import math

def estimate_tokens(text):
    return math.ceil(len(text) / 4)

def fits_in_context(prompt, max_output_tokens, context_limit):
    return estimate_tokens(prompt) + max_output_tokens <= context_limit
`,
tests:py`assert estimate_tokens("") == 0, "Empty text should be 0 tokens"
assert estimate_tokens("hello") == 2, "'hello' has 5 chars -> ceil(5/4) = 2"
assert estimate_tokens("abcd") == 1, "4 chars should be exactly 1 token"
assert isinstance(estimate_tokens("abcdefgh"), int), "Return an int"
assert estimate_tokens("x" * 2000) == 500, "2000 chars -> 500 tokens"
assert fits_in_context("x" * 400, 100, 200) is True, "100 + 100 = 200 fits a 200 limit"
assert fits_in_context("x" * 404, 100, 200) is False, "101 + 100 = 201 does not fit"
print("✅ All checks passed!")
`},
project:{title:"Explore models in AI Studio & your first script",
desc:"Get hands-on intuition before writing real apps. You'll compare answers at different settings and count tokens with the real API.",
steps:["Finish the Setup page (API key + virtual environment).","In Google AI Studio, ask the same creative question 3 times; notice the answers differ. Ask a factual question about a very recent event and notice the knowledge cutoff.","Run the script below to count tokens for a paragraph of your choice and compare with the 4-characters rule.","Write 3 sentences in a notes file: what surprised you about tokens, randomness and cutoffs."],
code:{gemini:py`# pip install google-genai   (set GEMINI_API_KEY first — see Setup)
from google import genai

client = genai.Client()          # reads GEMINI_API_KEY from the environment
MODEL = "${G}"

text = "Large language models predict the next token, one at a time."
count = client.models.count_tokens(model=MODEL, contents=text)
print("Real token count:", count.total_tokens)
print("Rule-of-thumb   :", -(-len(text) // 4))

resp = client.models.generate_content(
    model=MODEL,
    contents="In two sentences, explain what a token is to a 12-year-old.",
)
print(resp.text)
print(resp.usage_metadata)       # prompt / response / total token counts
`.replace("${G}",G),
openai:py`# pip install openai   (needs OPENAI_API_KEY + API credits)
from openai import OpenAI

client = OpenAI()                # reads OPENAI_API_KEY from the environment
MODEL = "gpt-6-luna"             # any current model from the OpenAI models page

resp = client.responses.create(
    model=MODEL,
    input="In two sentences, explain what a token is to a 12-year-old.",
)
print(resp.output_text)
print("input tokens :", resp.usage.input_tokens)
print("output tokens:", resp.usage.output_tokens)
`}}
});

/* ================= WEEK 2 ================= */
W.push({
id:2, phase:1, title:"Prompting fundamentals",
goal:"Write prompts that are clear, specific and structured — using roles, instructions, delimiters and examples (few-shot) to get consistent output.",
plan:[["25m","Read"],["10m","Quiz"],["40m","Exercise"],["45m","Mini project"]],
explain:`
<p>A prompt is just the text you send the model — but <b>how</b> you write it changes results dramatically. Think of the model as a very capable new colleague who knows nothing about your situation. Vague request → generic answer.</p>
<p>A good prompt usually contains:</p>
<ul>
<li><b>Role / context</b> — who the model should act as and why (“You are a support assistant for a bike shop”).</li>
<li><b>Task</b> — exactly what to do, in direct language.</li>
<li><b>Constraints</b> — length, tone, what to avoid, what to do if unsure.</li>
<li><b>Output format</b> — bullet list, JSON, a single word…</li>
<li><b>Delimiters</b> — clearly separate instructions from data, e.g. wrap user text in <code>&lt;review&gt;...&lt;/review&gt;</code> or triple quotes. This reduces confusion and helps against injected instructions.</li>
</ul>
<p><b>Few-shot prompting</b> means showing a couple of input → output examples before the real input. The model copies the pattern. It is often the fastest way to get a consistent format or style.</p>
<p>APIs also split text into <b>system instructions</b> (the standing rules for the app, set by you, the developer) and <b>user messages</b> (what the end user types). Put stable behaviour in the system instruction.</p>
<div class="callout"><b>Rule of thumb:</b> if a smart human would need to ask a clarifying question, your prompt is missing something.</div>`,
concepts:[["System instruction","Standing developer rules for how the model should behave in your app."],["User message","The end user's input for a single turn."],["Few-shot","Giving a few example input→output pairs so the model copies the pattern."],["Zero-shot","Asking without examples — fine for simple tasks."],["Delimiters","Markers (tags, quotes) that separate instructions from data."],["Output format spec","Explicitly stating the shape of the answer you want."]],
resources:[
 {t:"ChatGPT Prompt Engineering for Developers — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/",type:"course"},
 {t:"Gemini API: Prompt design strategies",u:"https://ai.google.dev/gemini-api/docs/prompting-strategies",type:"docs"},
 {t:"Prompt Engineering Guide",u:"https://www.promptingguide.ai/",type:"guide"},
 {t:"OpenAI: Prompt engineering guide",u:"https://platform.openai.com/docs/guides/prompt-engineering",type:"docs"}
],
quiz:[
 {q:"What is the main purpose of delimiters like <review>...</review> in a prompt?",o:["They make the prompt shorter","They separate instructions from the data being processed","They increase the temperature","They are required by the API"],a:1,e:"Delimiters make it obvious which text is your instruction and which is content to work on — improving accuracy and reducing prompt-injection confusion."},
 {q:"Few-shot prompting means…",o:["Calling the API a few times","Giving a few worked examples of input → output","Using a small model","Limiting output to a few words"],a:1,e:"You show the pattern with examples; the model continues it."},
 {q:"Where should permanent app rules like “always answer in British English” go?",o:["The system instruction","Each user's message","The temperature setting","Nowhere — models ignore rules"],a:0,e:"System instructions hold standing developer rules; user messages vary per turn."},
 {q:"Which prompt is likely to give the most useful result?",o:["“Write about dogs.”","“Dogs?”","“Write a 3-bullet summary of the pros and cons of adopting a retired greyhound, for a first-time owner, in plain English.”","“Be creative.”"],a:2,e:"It states task, audience, format and length — all the key ingredients."},
 {q:"The model keeps returning paragraphs, but you need exactly one word: POSITIVE or NEGATIVE. Best first fix?",o:["Raise the temperature","State the exact allowed outputs and show 2–3 examples","Switch to a bigger model immediately","Add more politeness"],a:1,e:"An explicit output spec plus few-shot examples is the cheapest, most effective fix."}
],
exercise:{title:"Few-shot prompt builder",
task:`<p>Implement <code>build_prompt(instruction, examples, user_input)</code> that returns a single string in <b>exactly</b> this format:</p>
<pre class="code">&lt;instruction&gt;

Input: &lt;example 1 input&gt;
Output: &lt;example 1 output&gt;

Input: &lt;example 2 input&gt;
Output: &lt;example 2 output&gt;

Input: &lt;user_input&gt;
Output:</pre>
<p><code>examples</code> is a list of <code>(input, output)</code> tuples and may be empty. Blocks are separated by one blank line; there is no trailing space after the final <code>Output:</code>. Also strip leading/trailing whitespace from <code>user_input</code>.</p>`,
starter:py`def build_prompt(instruction, examples, user_input):
    parts = [instruction]
    # add one "Input: ...\nOutput: ..." block per example
    # then the final block for user_input
    return "\n\n".join(parts)

print(build_prompt(
    "Classify the sentiment as POSITIVE or NEGATIVE.",
    [("I love it", "POSITIVE"), ("Broke in a day", "NEGATIVE")],
    "  Works great!  ",
))
`,
solution:py`def build_prompt(instruction, examples, user_input):
    parts = [instruction]
    for inp, out in examples:
        parts.append(f"Input: {inp}\nOutput: {out}")
    parts.append(f"Input: {user_input.strip()}\nOutput:")
    return "\n\n".join(parts)
`,
tests:py`p = build_prompt("Classify.", [("I love it", "POSITIVE"), ("Bad", "NEGATIVE")], "  Great!  ")
expected = "Classify.\n\nInput: I love it\nOutput: POSITIVE\n\nInput: Bad\nOutput: NEGATIVE\n\nInput: Great!\nOutput:"
assert isinstance(p, str), "Return a string"
assert p.endswith("Output:"), "Prompt must end with 'Output:' and no trailing space"
assert "Input: Great!\n" in p, "user_input should be stripped"
assert p == expected, "Format mismatch. Got:\n" + repr(p)
assert build_prompt("Do it.", [], "x") == "Do it.\n\nInput: x\nOutput:", "Should work with zero examples"
print("✅ All checks passed!")
`},
project:{title:"Sentiment classifier CLI",
desc:"Turn your prompt builder into a real tool: classify product reviews from the terminal with a system instruction and few-shot examples.",
steps:["Copy your build_prompt function into classify.py.","Put the rules (allowed labels, one word only) in the system instruction.","Loop over 5 reviews you write yourself (include a sarcastic one!) and print the labels.","Try zero-shot vs few-shot and note which is more consistent."],
code:{gemini:py`from google import genai
from google.genai import types

client = genai.Client()
MODEL = "gemini-flash-latest"
SYSTEM = "You label product reviews. Reply with exactly one word: POSITIVE, NEGATIVE or MIXED."

EXAMPLES = [("Love it, works perfectly", "POSITIVE"),
            ("Stopped working after a week", "NEGATIVE"),
            ("Great sound but the battery is awful", "MIXED")]

def build_prompt(instruction, examples, user_input): ...  # your exercise solution

reviews = ["Oh great, another charger that melts. Fantastic.", "Does the job."]
for r in reviews:
    resp = client.models.generate_content(
        model=MODEL,
        contents=build_prompt("Label this review.", EXAMPLES, r),
        config=types.GenerateContentConfig(system_instruction=SYSTEM),
    )
    print(f"{resp.text.strip():9} <- {r}")
`,
openai:py`from openai import OpenAI

client = OpenAI()
MODEL = "gpt-6-luna"
SYSTEM = "You label product reviews. Reply with exactly one word: POSITIVE, NEGATIVE or MIXED."

EXAMPLES = [("Love it, works perfectly", "POSITIVE"),
            ("Stopped working after a week", "NEGATIVE"),
            ("Great sound but the battery is awful", "MIXED")]

def build_prompt(instruction, examples, user_input): ...  # your exercise solution

reviews = ["Oh great, another charger that melts. Fantastic.", "Does the job."]
for r in reviews:
    resp = client.responses.create(
        model=MODEL,
        instructions=SYSTEM,                     # the system instruction
        input=build_prompt("Label this review.", EXAMPLES, r),
    )
    print(f"{resp.output_text.strip():9} <- {r}")
`}}
});

/* ================= WEEK 3 ================= */
W.push({
id:3, phase:1, title:"Prompt patterns & prompts as code",
goal:"Use proven prompt patterns (step-by-step thinking, decomposition, self-check) and manage prompts as reusable, versioned templates in your code.",
plan:[["25m","Read"],["10m","Quiz"],["40m","Exercise"],["45m","Mini project"]],
explain:`
<p>Once you know the basics, a few <b>patterns</b> solve most problems:</p>
<ul>
<li><b>Think step by step</b> — asking the model to work through a problem before answering often improves accuracy on multi-step tasks. Many modern models do this internally (“thinking” or “reasoning” models), so you often just need to ask for a clear final answer.</li>
<li><b>Decomposition / prompt chaining</b> — split a big job into smaller prompts: <i>extract facts → draft → polish</i>. Each step is easier to test and fix.</li>
<li><b>Self-check</b> — ask the model to review its own answer against a checklist, or run a second “critic” prompt.</li>
<li><b>Give it an out</b> — say what to do when information is missing (“If the answer isn't in the text, reply <code>I don't know</code>”). This cuts hallucinations.</li>
</ul>
<p>In real apps, prompts are <b>code</b>. Store them as templates with named placeholders like <code>{customer_name}</code>, keep them in version control, and fill them programmatically. A missing placeholder should be a loud error, not a silent “{customer_name}” sent to the model.</p>
<div class="callout"><b>Tip:</b> keep a small file of test inputs for each prompt. When you edit the prompt, rerun them. This is the seed of “evals” (Phase 7).</div>`,
concepts:[["Chain-of-thought","Asking the model to reason through steps before answering."],["Prompt chaining","Splitting one task into a sequence of smaller prompts."],["Self-critique","A second pass where the model checks its own output."],["Prompt template","A reusable prompt with named placeholders filled by code."],["Escape hatch","An instruction for what to do when the model can't answer."]],
resources:[
 {t:"Building Systems with the ChatGPT API — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/building-systems-with-chatgpt/",type:"course"},
 {t:"Prompt Engineering Guide: techniques",u:"https://www.promptingguide.ai/techniques",type:"guide"},
 {t:"Gemini API: Prompt design strategies",u:"https://ai.google.dev/gemini-api/docs/prompting-strategies",type:"docs"},
 {t:"Python docs: string.Formatter / format strings",u:"https://docs.python.org/3/library/string.html#format-string-syntax",type:"docs"}
],
quiz:[
 {q:"What is prompt chaining?",o:["Sending the same prompt many times","Splitting a task into smaller sequential prompts","Joining prompts with commas","Using a blockchain"],a:1,e:"Each step's output feeds the next. Smaller steps are easier to control and debug."},
 {q:"Why tell the model what to do when the answer isn't available?",o:["To make responses longer","It reduces made-up answers by giving a safe alternative","It is required by the API","It raises temperature"],a:1,e:"Without an ‘out’, models tend to produce a plausible guess. An explicit fallback reduces hallucinations."},
 {q:"Your template has {name} but the code forgot to pass name. What's the best behaviour?",o:["Send the literal text '{name}' to the model","Silently replace it with an empty string","Raise a clear error before calling the model","Let the model guess a name"],a:2,e:"Fail fast. Silent gaps create weird outputs that are hard to debug."},
 {q:"Which is a self-critique pattern?",o:["Asking a second prompt to check the first answer against rules","Lowering max tokens","Using few-shot examples","Streaming the output"],a:0,e:"A reviewer/critic step catches errors the first pass missed."},
 {q:"Why keep prompts in version control?",o:["Git makes prompts run faster","So changes can be tracked, reviewed and rolled back like code","Models require it","It hides them from users"],a:1,e:"Prompts change app behaviour as much as code does, so treat them like code."}
],
exercise:{title:"Strict prompt template",
task:`<p>Implement a tiny template engine.</p>
<ul><li><code>find_placeholders(template)</code> → a <b>sorted list of unique</b> placeholder names found as <code>{name}</code> (names are letters, digits, underscores).</li>
<li><code>render(template, **values)</code> → fills placeholders. If any placeholder is missing from <code>values</code>, raise <code>KeyError</code> whose message lists the missing names. Extra values are fine.</li></ul>
<p>Hint: the <code>re</code> module: <code>re.findall(r"\{(\w+)\}", template)</code>.</p>`,
starter:py`import re

def find_placeholders(template):
    pass

def render(template, **values):
    pass

t = "Hi {name}, your order {order_id} ships {day}. Thanks, {name}!"
print(find_placeholders(t))
print(render(t, name="Asha", order_id=42, day="Friday"))
`,
solution:py`import re

def find_placeholders(template):
    return sorted(set(re.findall(r"\{(\w+)\}", template)))

def render(template, **values):
    missing = [p for p in find_placeholders(template) if p not in values]
    if missing:
        raise KeyError("Missing placeholders: " + ", ".join(missing))
    return re.sub(r"\{(\w+)\}", lambda m: str(values[m.group(1)]), template)
`,
tests:py`t = "Hi {name}, order {order_id} ships {day}. Bye {name}!"
assert find_placeholders(t) == ["day", "name", "order_id"], "Expected sorted unique names, got " + repr(find_placeholders(t))
assert find_placeholders("no vars") == [], "No placeholders -> []"
out = render(t, name="Asha", order_id=42, day="Fri", extra="ignored")
assert out == "Hi Asha, order 42 ships Fri. Bye Asha!", "Wrong render: " + repr(out)
try:
    render(t, name="Asha")
    assert False, "render should raise KeyError when values are missing"
except KeyError as e:
    msg = str(e)
    assert "day" in msg and "order_id" in msg, "KeyError message should list missing names, got " + msg
print("✅ All checks passed!")
`},
project:{title:"Two-step ‘explain like I'm new’ chain",
desc:"Build a two-prompt chain: step 1 extracts key facts from a pasted article; step 2 writes a beginner-friendly explanation using only those facts, then a critic step checks for claims not in the facts.",
steps:["Create prompts.py holding three templates: EXTRACT, EXPLAIN, CRITIC (use your render function).","Chain them: article → facts → explanation → critique.","Print each stage so you can see where quality drops.","Try an article with missing info and confirm the ‘I don't know’ escape hatch works."],
code:{gemini:py`from google import genai
client = genai.Client()
MODEL = "gemini-flash-latest"

EXTRACT = "List the 5 most important facts in the text as bullets. Text:\n<text>{article}</text>"
EXPLAIN = ("Using ONLY these facts, explain the topic to a beginner in 120 words. "
           "If something is unclear, say 'I don't know'.\nFacts:\n{facts}")
CRITIC  = "Facts:\n{facts}\n\nExplanation:\n{draft}\n\nList any claims in the explanation NOT supported by the facts, or reply OK."

def ask(prompt):
    return client.models.generate_content(model=MODEL, contents=prompt).text

article = open("article.txt").read()
facts = ask(render(EXTRACT, article=article))
draft = ask(render(EXPLAIN, facts=facts))
print(draft, "\n--- critic ---\n", ask(render(CRITIC, facts=facts, draft=draft)))
`,
openai:py`from openai import OpenAI
client = OpenAI()
MODEL = "gpt-6-luna"

EXTRACT = "List the 5 most important facts in the text as bullets. Text:\n<text>{article}</text>"
EXPLAIN = ("Using ONLY these facts, explain the topic to a beginner in 120 words. "
           "If something is unclear, say 'I don't know'.\nFacts:\n{facts}")
CRITIC  = "Facts:\n{facts}\n\nExplanation:\n{draft}\n\nList any claims in the explanation NOT supported by the facts, or reply OK."

def ask(prompt):
    return client.responses.create(model=MODEL, input=prompt).output_text

article = open("article.txt").read()
facts = ask(render(EXTRACT, article=article))
draft = ask(render(EXPLAIN, facts=facts))
print(draft, "\n--- critic ---\n", ask(render(CRITIC, facts=facts, draft=draft)))
`}}
});

/* ================= WEEK 4 ================= */
W.push({
id:4, phase:2, title:"Your first API calls",
goal:"Call Gemini from Python with the google-genai SDK (and see the OpenAI and Claude equivalents): models, contents, system instructions, config and reading the response.",
plan:[["20m","Read & setup check"],["10m","Quiz"],["40m","Exercise"],["50m","Mini project"]],
explain:`
<p>Chat apps like ChatGPT and the Gemini app are <b>products</b>; the <b>API</b> is the raw engine that lets <i>your</i> code send text and get text back. Your Plus/Pro chat subscriptions don't include API usage, but Google AI Studio gives a <b>free API key</b> with rate limits — perfect for learning.</p>
<p>Every call has the same ingredients:</p>
<ul>
<li><b>Client</b> — an object holding your API key (read from an environment variable, never hard-coded).</li>
<li><b>Model name</b> — which model to use, e.g. <code>gemini-flash-latest</code> (an alias that always points at the newest Flash model).</li>
<li><b>Contents / input</b> — your prompt, or a list of messages.</li>
<li><b>Config</b> — system instruction, max output tokens, and other options.</li>
</ul>
<p>The response is an object: the text (<code>resp.text</code> in Gemini, <code>resp.output_text</code> in OpenAI's Responses API, a list of content blocks in Claude) plus metadata like token usage. Different providers use different message shapes: Gemini calls roles <code>user</code>/<code>model</code> and splits content into <code>parts</code>; OpenAI uses <code>user</code>/<code>assistant</code> with <code>content</code>; Claude also uses <code>user</code>/<code>assistant</code>, but takes the system prompt as a separate <code>system</code> argument and always needs <code>max_tokens</code>. Converting between them is a common real-world chore — and this week's exercise.</p>
<div class="callout"><b>Security:</b> treat API keys like passwords. Use environment variables or a <code>.env</code> file that is listed in <code>.gitignore</code>.</div>`,
concepts:[["API key","A secret that identifies your account to the provider. Keep it out of code and git."],["SDK","The official Python library wrapping the HTTP API (google-genai, openai, anthropic)."],["Model alias","A name like gemini-flash-latest that points to the current recommended version."],["Role","Who said a message: user, model/assistant (and system instructions)."],["Usage metadata","Token counts returned with each response — the basis of cost."]],
resources:[
 {t:"Gemini API quickstart",u:"https://ai.google.dev/gemini-api/docs/quickstart",type:"docs"},
 {t:"Gemini API: Text generation",u:"https://ai.google.dev/gemini-api/docs/text-generation",type:"docs"},
 {t:"google-genai Python SDK (GitHub)",u:"https://github.com/googleapis/python-genai",type:"code"},
 {t:"OpenAI: Text generation (Responses API)",u:"https://platform.openai.com/docs/guides/text",type:"docs"}
],
quiz:[
 {q:"Where should your API key live?",o:["Hard-coded in the script","In an environment variable or git-ignored .env file","In a public GitHub README","In the prompt"],a:1,e:"Environment variables keep secrets out of your code and out of version control."},
 {q:"In the google-genai SDK, how do you get the generated text?",o:["resp.output_text","resp.text","resp.choices[0]","resp['answer']"],a:1,e:"Gemini's response has a .text convenience property. OpenAI's Responses API uses .output_text."},
 {q:"Gemini uses role 'model' where OpenAI uses…",o:["'system'","'bot'","'assistant'","'tool'"],a:2,e:"Same idea, different names: Gemini 'model' ≈ OpenAI 'assistant'."},
 {q:"Does a ChatGPT Plus subscription include OpenAI API credits?",o:["Yes, unlimited","Yes, $5 per month","No — API usage is billed separately","Only on weekends"],a:2,e:"Chat subscriptions and API billing are separate. That's why this roadmap uses Gemini's free tier for code."},
 {q:"What does the alias gemini-flash-latest do?",o:["Always points to the newest Flash model","Pins a model forever","Uses the slowest model","Disables safety filters"],a:0,e:"Aliases track the latest release; pin a specific version in production if you need stability."}
],
exercise:{title:"Convert chat history between providers",
task:`<p>Your app stores history in a neutral format: a list of dicts <code>{"role": "user"|"assistant", "text": ...}</code>. Implement:</p>
<ul><li><code>to_gemini(history)</code> → list of <code>{"role": "user"|"model", "parts": [{"text": ...}]}</code> (assistant → model).</li>
<li><code>to_openai(history)</code> → list of <code>{"role": "user"|"assistant", "content": ...}</code>.</li>
<li>Both should raise <code>ValueError</code> for any unknown role.</li></ul>`,
starter:py`def to_gemini(history):
    pass

def to_openai(history):
    pass

h = [{"role": "user", "text": "Hi"}, {"role": "assistant", "text": "Hello!"}]
print(to_gemini(h))
print(to_openai(h))
`,
solution:py`def _check(role):
    if role not in ("user", "assistant"):
        raise ValueError(f"Unknown role: {role}")

def to_gemini(history):
    out = []
    for m in history:
        _check(m["role"])
        role = "model" if m["role"] == "assistant" else "user"
        out.append({"role": role, "parts": [{"text": m["text"]}]})
    return out

def to_openai(history):
    out = []
    for m in history:
        _check(m["role"])
        out.append({"role": m["role"], "content": m["text"]})
    return out
`,
tests:py`h = [{"role": "user", "text": "Hi"}, {"role": "assistant", "text": "Hello!"}, {"role": "user", "text": "Bye"}]
g = to_gemini(h)
assert g == [{"role": "user", "parts": [{"text": "Hi"}]}, {"role": "model", "parts": [{"text": "Hello!"}]}, {"role": "user", "parts": [{"text": "Bye"}]}], "to_gemini wrong: " + repr(g)
o = to_openai(h)
assert o == [{"role": "user", "content": "Hi"}, {"role": "assistant", "content": "Hello!"}, {"role": "user", "content": "Bye"}], "to_openai wrong: " + repr(o)
assert to_gemini([]) == [] and to_openai([]) == [], "Empty history -> empty list"
for fn in (to_gemini, to_openai):
    try:
        fn([{"role": "robot", "text": "?"}])
        assert False, fn.__name__ + " should raise ValueError for unknown roles"
    except ValueError:
        pass
print("✅ All checks passed!")
`},
project:{title:"‘Ask’ command-line tool",
desc:"A reusable CLI: python ask.py \"your question\" --system \"You are a pirate\" prints the answer and token usage.",
steps:["Create ask.py using argparse for the question and an optional --system flag.","Call the model with the system instruction in config.","Print the answer, then token usage on a dim line.","Bonus: add --max-tokens and see how answers get cut off."],
code:{gemini:py`import argparse
from google import genai
from google.genai import types

p = argparse.ArgumentParser()
p.add_argument("question")
p.add_argument("--system", default="You are a concise, helpful assistant.")
p.add_argument("--max-tokens", type=int, default=800)
args = p.parse_args()

client = genai.Client()
resp = client.models.generate_content(
    model="gemini-flash-latest",
    contents=args.question,
    config=types.GenerateContentConfig(
        system_instruction=args.system,
        max_output_tokens=args.max_tokens,
    ),
)
print(resp.text)
u = resp.usage_metadata
print(f"\n[tokens] in={u.prompt_token_count} out={u.candidates_token_count} total={u.total_token_count}")
`,
openai:py`import argparse
from openai import OpenAI

p = argparse.ArgumentParser()
p.add_argument("question")
p.add_argument("--system", default="You are a concise, helpful assistant.")
p.add_argument("--max-tokens", type=int, default=800)
args = p.parse_args()

client = OpenAI()
resp = client.responses.create(
    model="gpt-6-luna",
    instructions=args.system,
    input=args.question,
    max_output_tokens=args.max_tokens,
)
print(resp.output_text)
u = resp.usage
print(f"\n[tokens] in={u.input_tokens} out={u.output_tokens} total={u.total_tokens}")
`}}
});

/* ================= WEEK 5 ================= */
W.push({
id:5, phase:2, title:"Conversations, memory of the chat & streaming",
goal:"Build multi-turn chat: understand that the model is stateless, manage history yourself (and trim it), and stream tokens for a responsive feel.",
plan:[["20m","Read"],["10m","Quiz"],["45m","Exercise"],["45m","Mini project"]],
explain:`
<p>Surprise: the model <b>remembers nothing between API calls</b>. It is <i>stateless</i>. A “conversation” is an illusion your app creates by <b>sending the whole history every time</b>. The SDKs offer helpers (Gemini's <code>client.chats.create()</code>, OpenAI's <code>previous_response_id</code>; with Claude you simply keep and resend the <code>messages</code> list yourself) that do this bookkeeping for you, but it's still happening.</p>
<p>Because history grows every turn, long chats eventually become slow, expensive, or too big for the context window. Common strategies:</p>
<ul>
<li><b>Sliding window</b> — keep the system instruction plus the most recent N messages / tokens.</li>
<li><b>Summarise</b> — replace old turns with a short summary (Week 17).</li>
<li><b>Retrieve</b> — store old content and fetch only relevant bits (RAG, Phase 4).</li>
</ul>
<p><b>Streaming</b> sends the reply in small chunks as it's generated, so users see text appear immediately instead of waiting for the full answer. Same total time, much better experience.</p>`,
concepts:[["Stateless","The model keeps no memory between calls; your app re-sends context."],["Chat history","The list of previous messages sent with each request."],["Sliding window","Keeping only the most recent messages that fit a budget."],["Streaming","Receiving the answer incrementally, chunk by chunk."],["Chat session helper","SDK object that tracks history for you (e.g. client.chats)."]],
resources:[
 {t:"Gemini API: Text generation — multi-turn & streaming",u:"https://ai.google.dev/gemini-api/docs/text-generation",type:"docs"},
 {t:"OpenAI: Conversation state",u:"https://platform.openai.com/docs/guides/conversation-state",type:"docs"},
 {t:"OpenAI: Streaming API responses",u:"https://platform.openai.com/docs/guides/streaming-responses",type:"docs"},
 {t:"Google Gemini Cookbook (GitHub)",u:"https://github.com/google-gemini/cookbook",type:"code"}
],
quiz:[
 {q:"How does a chatbot ‘remember’ earlier messages?",o:["The model stores them in its weights","The app re-sends the history with each request","The API keeps a permanent memory of all users","It doesn't — chatbots can't do multi-turn"],a:1,e:"Models are stateless; history is included in every call (by you or an SDK helper)."},
 {q:"What's the main benefit of streaming?",o:["Lower cost","Users see output immediately — better perceived speed","More accurate answers","Bigger context window"],a:1,e:"Streaming doesn't change cost or quality; it improves responsiveness."},
 {q:"In a sliding-window strategy, which message should you almost always keep?",o:["The oldest user message","The system instruction","The longest message","A random message"],a:1,e:"The system instruction defines behaviour — drop it and the app changes personality."},
 {q:"A chat has run for 300 turns and is getting slow and costly. Which is NOT a good fix?",o:["Trim to recent turns","Summarise older turns","Retrieve relevant old snippets only","Send the history twice to be safe"],a:3,e:"Duplicating history just makes it worse."},
 {q:"In the Gemini SDK, which helper manages chat history for you?",o:["client.chats.create(...)","client.history()","genai.memory()","client.models.remember()"],a:0,e:"chat = client.chats.create(model=...) then chat.send_message(...) keeps the history."}
],
exercise:{title:"Trim history to a token budget",
task:`<p>Implement <code>trim_history(messages, max_tokens)</code>. Each message is <code>{"role": ..., "text": ...}</code>. Use <code>count(text) = len(text.split())</code> as a toy token counter (provided).</p>
<ul><li>If the first message has role <code>"system"</code>, <b>always keep it</b> (its tokens count toward the budget).</li>
<li>Then keep the <b>most recent</b> other messages that fit, working backwards; stop at the first message that doesn't fit.</li>
<li>Return them in the original order.</li></ul>`,
starter:py`def count(text):
    return len(text.split())

def trim_history(messages, max_tokens):
    pass

msgs = [
    {"role": "system", "text": "You are helpful"},        # 3
    {"role": "user", "text": "one two three four"},        # 4
    {"role": "assistant", "text": "five six"},             # 2
    {"role": "user", "text": "seven eight nine"},          # 3
]
print(trim_history(msgs, 8))   # system + last two messages
`,
solution:py`def count(text):
    return len(text.split())

def trim_history(messages, max_tokens):
    kept, budget, rest = [], max_tokens, messages
    head = []
    if messages and messages[0]["role"] == "system":
        head = [messages[0]]
        budget -= count(messages[0]["text"])
        rest = messages[1:]
    for m in reversed(rest):
        c = count(m["text"])
        if c > budget:
            break
        kept.append(m)
        budget -= c
    return head + list(reversed(kept))
`,
tests:py`msgs = [
    {"role": "system", "text": "You are helpful"},
    {"role": "user", "text": "one two three four"},
    {"role": "assistant", "text": "five six"},
    {"role": "user", "text": "seven eight nine"},
]
r = trim_history(msgs, 8)
assert r == [msgs[0], msgs[2], msgs[3]], "Budget 8 should keep system + last two. Got: " + repr(r)
assert trim_history(msgs, 100) == msgs, "Big budget keeps everything in order"
assert trim_history(msgs, 3) == [msgs[0]], "Budget 3 only fits the system message"
no_sys = msgs[1:]
assert trim_history(no_sys, 5) == [no_sys[1], no_sys[2]], "Without system message keep most recent that fit"
assert trim_history(no_sys, 2) == [], "Stop at first message that doesn't fit (last msg is 3 tokens)"
print("✅ All checks passed!")
`},
project:{title:"Terminal chatbot with streaming",
desc:"A REPL chatbot that streams its replies, remembers the conversation, and supports /reset and /quit.",
steps:["Create chat.py with a persona system instruction.","Use a chat session (Gemini) or a message list (OpenAI / Claude) to keep history.","Stream each reply to the terminal as it arrives.","Add /reset (new session) and print a running token total."],
code:{gemini:py`from google import genai
from google.genai import types

client = genai.Client()
CONFIG = types.GenerateContentConfig(system_instruction="You are a friendly Python tutor. Keep answers short.")

def new_chat():
    return client.chats.create(model="gemini-flash-latest", config=CONFIG)

chat = new_chat()
while True:
    msg = input("\nyou> ").strip()
    if msg == "/quit": break
    if msg == "/reset": chat = new_chat(); print("(history cleared)"); continue
    print("bot> ", end="")
    for chunk in chat.send_message_stream(msg):
        print(chunk.text or "", end="", flush=True)
    print()
`,
openai:py`from openai import OpenAI

client = OpenAI()
SYSTEM = "You are a friendly Python tutor. Keep answers short."
history = []

while True:
    msg = input("\nyou> ").strip()
    if msg == "/quit": break
    if msg == "/reset": history = []; print("(history cleared)"); continue
    history.append({"role": "user", "content": msg})
    print("bot> ", end="")
    reply = ""
    stream = client.responses.create(model="gpt-6-luna", instructions=SYSTEM,
                                     input=history, stream=True)
    for event in stream:
        if event.type == "response.output_text.delta":
            print(event.delta, end="", flush=True)
            reply += event.delta
    history.append({"role": "assistant", "content": reply})
    print()
`}}
});

/* ================= WEEK 6 ================= */
W.push({
id:6, phase:2, title:"Errors, rate limits, retries & cost",
goal:"Make API code robust: handle errors, respect rate limits with exponential backoff, set timeouts, and estimate costs.",
plan:[["20m","Read"],["10m","Quiz"],["45m","Exercise"],["45m","Mini project"]],
explain:`
<p>Real API calls fail. Networks drop, servers get busy, and free tiers have <b>rate limits</b> (a maximum number of requests or tokens per minute/day). A robust app expects this.</p>
<ul>
<li><b>Client errors (4xx)</b> — your fault: bad key (401/403), bad request (400). Retrying won't help; fix the code.</li>
<li><b>Rate limit (429)</b> — slow down and retry later.</li>
<li><b>Server errors (5xx)</b> — temporary provider trouble; retrying usually works.</li>
</ul>
<p><b>Exponential backoff</b> is the standard retry strategy: wait 1s, then 2s, then 4s, 8s… (often plus a little random “jitter”) and give up after a few attempts. The official SDKs already retry some errors automatically, but you should understand and control it.</p>
<p><b>Cost</b> = input tokens × input price + output tokens × output price. Output tokens usually cost several times more than input. Log usage from every response so you can see where the tokens go. Cheaper, faster models (“Flash”, “mini”, “Luna”) are fine for most tasks — start there.</p>`,
concepts:[["Rate limit","Cap on requests/tokens per time window; exceeding it returns HTTP 429."],["Exponential backoff","Retry with waits that double each time: 1s, 2s, 4s…"],["Jitter","Small random extra wait so many clients don't retry in sync."],["Timeout","Maximum time you'll wait for a response before giving up."],["Transient error","A temporary failure that may succeed on retry (429, 5xx)."]],
resources:[
 {t:"Gemini API: Rate limits",u:"https://ai.google.dev/gemini-api/docs/rate-limits",type:"docs"},
 {t:"Gemini API: Pricing",u:"https://ai.google.dev/gemini-api/docs/pricing",type:"docs"},
 {t:"Gemini API: Troubleshooting & error codes",u:"https://ai.google.dev/gemini-api/docs/troubleshooting",type:"docs"},
 {t:"OpenAI: Error codes",u:"https://platform.openai.com/docs/guides/error-codes",type:"docs"}
],
quiz:[
 {q:"You get HTTP 401/403 (invalid key). Should you retry automatically?",o:["Yes, 10 times","No — fix the key/config; retries won't help","Yes, with a bigger model","Only at night"],a:1,e:"Authentication errors are permanent until you fix them. Retry only transient errors like 429 and 5xx."},
 {q:"With exponential backoff starting at 1 second, the waits are…",o:["1, 1, 1, 1","1, 2, 3, 4","1, 2, 4, 8","8, 4, 2, 1"],a:2,e:"Each wait doubles."},
 {q:"Why add jitter?",o:["To make logs prettier","So many clients don't all retry at exactly the same moment","To reduce token usage","It's required by HTTP"],a:1,e:"Random offsets spread out retries and avoid a ‘thundering herd’."},
 {q:"Which usually costs more per token?",o:["Input tokens","Output tokens","They're always identical","Neither — tokens are free"],a:1,e:"Output (generated) tokens are typically priced several times higher than input."},
 {q:"What does HTTP 429 mean?",o:["Success","Too many requests — you hit a rate limit","Not found","Server crashed permanently"],a:1,e:"429 = rate limited. Back off and retry."}
],
exercise:{title:"Retry with exponential backoff",
task:`<p>Implement <code>call_with_retry(fn, max_attempts=4, base_delay=1.0, sleep=None)</code>:</p>
<ul><li>Call <code>fn()</code>. If it succeeds, return its result.</li>
<li>If it raises <code>TransientError</code>, wait <code>base_delay * 2**attempt_index</code> (1, 2, 4… seconds) by calling <code>sleep(seconds)</code>, then retry.</li>
<li>Any other exception must be re-raised <b>immediately</b> (no retry).</li>
<li>After <code>max_attempts</code> failed attempts, re-raise the last <code>TransientError</code>. Don't sleep after the final attempt.</li></ul>
<p>We pass a fake <code>sleep</code> so tests run instantly and can check your delays.</p>`,
starter:py`class TransientError(Exception):
    pass

def call_with_retry(fn, max_attempts=4, base_delay=1.0, sleep=None):
    import time
    sleep = sleep or time.sleep
    pass

# demo: fails twice, then works
calls = {"n": 0}
def flaky():
    calls["n"] += 1
    if calls["n"] < 3:
        raise TransientError("503 overloaded")
    return "ok!"

waits = []
print(call_with_retry(flaky, sleep=waits.append), waits)   # ok! [1.0, 2.0]
`,
solution:py`class TransientError(Exception):
    pass

def call_with_retry(fn, max_attempts=4, base_delay=1.0, sleep=None):
    import time
    sleep = sleep or time.sleep
    for attempt in range(max_attempts):
        try:
            return fn()
        except TransientError:
            if attempt == max_attempts - 1:
                raise
            sleep(base_delay * 2 ** attempt)
`,
tests:py`def make(fail_times, exc=None):
    state = {"n": 0}
    def f():
        state["n"] += 1
        if state["n"] <= fail_times:
            raise (exc or TransientError("busy"))
        return "done"
    return f, state

f, s = make(2); w = []
assert call_with_retry(f, sleep=w.append) == "done", "Should return fn's result after retries"
assert w == [1.0, 2.0], "Expected waits [1.0, 2.0], got " + repr(w)
f, s = make(0); w = []
assert call_with_retry(f, sleep=w.append) == "done" and w == [], "No waits when first call succeeds"
f, s = make(10); w = []
try:
    call_with_retry(f, max_attempts=4, sleep=w.append); assert False, "Should raise after max attempts"
except TransientError:
    pass
assert s["n"] == 4, "Should attempt exactly max_attempts times, attempted " + str(s["n"])
assert w == [1.0, 2.0, 4.0], "Should not sleep after the last attempt, got " + repr(w)
f, s = make(1, ValueError("bad request")); w = []
try:
    call_with_retry(f, sleep=w.append); assert False, "Non-transient errors must be re-raised"
except ValueError:
    pass
assert s["n"] == 1 and w == [], "Must not retry non-transient errors"
f, s = make(1); w = []
call_with_retry(f, base_delay=0.5, sleep=w.append)
assert w == [0.5], "base_delay should scale the waits"
print("✅ All checks passed!")
`},
project:{title:"Robust batch summariser with a cost log",
desc:"Summarise a folder of .txt files, surviving rate limits, and write a CSV of token usage and estimated cost per file.",
steps:["Wrap your API call with call_with_retry, mapping the SDK's rate-limit/server errors to TransientError.","Loop over ./notes/*.txt and write summaries to ./summaries/.","Record input/output tokens per file into usage.csv.","Add a price table (look up current prices) and print the estimated total."],
code:{gemini:py`import csv, glob, pathlib
from google import genai
from google.genai import errors

client = genai.Client()

def summarise(text):
    try:
        return client.models.generate_content(
            model="gemini-flash-latest",
            contents=f"Summarise in 3 bullets:\n<doc>{text}</doc>")
    except errors.APIError as e:
        if e.code in (429, 500, 503):
            raise TransientError(str(e))   # retry these
        raise                               # e.g. 400/403: fix your code

pathlib.Path("summaries").mkdir(exist_ok=True)
with open("usage.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["file", "in", "out"])
    for path in glob.glob("notes/*.txt"):
        resp = call_with_retry(lambda: summarise(open(path).read()))
        pathlib.Path("summaries", pathlib.Path(path).name).write_text(resp.text)
        u = resp.usage_metadata
        w.writerow([path, u.prompt_token_count, u.candidates_token_count])
`,
openai:py`import csv, glob, pathlib
import openai
from openai import OpenAI

client = OpenAI(max_retries=0, timeout=30)   # we do our own retries here

def summarise(text):
    try:
        return client.responses.create(
            model="gpt-6-luna",
            input=f"Summarise in 3 bullets:\n<doc>{text}</doc>")
    except (openai.RateLimitError, openai.InternalServerError, openai.APIConnectionError) as e:
        raise TransientError(str(e))

pathlib.Path("summaries").mkdir(exist_ok=True)
with open("usage.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["file", "in", "out"])
    for path in glob.glob("notes/*.txt"):
        resp = call_with_retry(lambda: summarise(open(path).read()))
        pathlib.Path("summaries", pathlib.Path(path).name).write_text(resp.output_text)
        w.writerow([path, resp.usage.input_tokens, resp.usage.output_tokens])
`}}
});

/* ================= WEEK 7 ================= */
W.push({
id:7, phase:3, title:"Structured output: getting JSON back",
goal:"Make models return machine-readable JSON reliably — using schema-constrained output features — and defensively parse messy responses.",
plan:[["20m","Read"],["10m","Quiz"],["45m","Exercise"],["45m","Mini project"]],
explain:`
<p>Free-form text is great for humans, but your <b>code</b> needs data: a name, a date, a list of items. <b>Structured output</b> means asking the model to answer in a fixed shape — usually <b>JSON</b> — that your program can load with <code>json.loads</code>.</p>
<p>There are three levels of reliability:</p>
<ul>
<li><b>Just ask</b> — “reply in JSON with keys name and age”. Works most of the time, but the model may wrap it in <code>&#96;&#96;&#96;json</code> fences or add chatty text.</li>
<li><b>JSON mode</b> — tell the API you want JSON (<code>response_mime_type="application/json"</code> in Gemini). Always valid JSON, but not necessarily your keys.</li>
<li><b>Schema-constrained output</b> — give the API a <b>schema</b> (e.g. a Pydantic model). The model is forced to follow it. Gemini: <code>response_schema=</code>; OpenAI: <code>client.responses.parse(text_format=...)</code>; Claude: <code>client.messages.parse(output_format=...)</code>. Use this whenever possible.</li>
</ul>
<p>Even so, write <b>defensive parsing</b>: strip code fences, find the JSON object in surrounding text, and check the required fields exist. Robust code survives old models, different providers and the occasional weird reply.</p>`,
concepts:[["JSON","A text format for data: objects {…}, lists […], strings, numbers, booleans, null."],["JSON mode","API setting guaranteeing syntactically valid JSON."],["Schema","A description of the exact fields and types you expect."],["Pydantic","Python library to define data models and validate data against them."],["Defensive parsing","Code that copes with fences, extra text and missing fields."]],
resources:[
 {t:"Gemini API: Structured output",u:"https://ai.google.dev/gemini-api/docs/structured-output",type:"docs"},
 {t:"OpenAI: Structured Outputs",u:"https://platform.openai.com/docs/guides/structured-outputs",type:"docs"},
 {t:"Getting Structured LLM Output — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/getting-structured-llm-output/",type:"course"},
 {t:"Python docs: json module",u:"https://docs.python.org/3/library/json.html",type:"docs"}
],
quiz:[
 {q:"What's the most reliable way to get data in an exact shape?",o:["Politely ask for JSON","Schema-constrained output (e.g. response_schema / text_format)","Raise the temperature","Use a longer prompt"],a:1,e:"Providing a schema to the API constrains generation to that structure."},
 {q:"The model replies: ```json\\n{\"a\": 1}\\n```  — json.loads on the whole string will…",o:["Work fine","Fail, because of the code-fence text around the JSON","Return None","Return a list"],a:1,e:"The backticks and 'json' label aren't valid JSON. Strip them first."},
 {q:"JSON mode alone guarantees…",o:["Valid JSON syntax, but not your specific fields","Exactly your schema","Correct facts","Shorter answers"],a:0,e:"JSON mode ensures parseable JSON; a schema ensures the right fields and types."},
 {q:"Which Python library is commonly used to define and validate schemas for LLM output?",o:["NumPy","Pydantic","Matplotlib","Requests"],a:1,e:"Both the Gemini and OpenAI SDKs accept Pydantic models as schemas."},
 {q:"Even with schemas, why keep validation in your code?",o:["It's not needed","Values can still be wrong or empty, and providers/models change","To slow the app down","JSON is always invalid"],a:1,e:"A schema guarantees shape, not truth. Check values that matter (e.g. a date in the future, a non-empty list)."}
],
exercise:{title:"Extract JSON from a messy reply",
task:`<p>Implement <code>extract_json(text)</code> that returns a Python dict from an LLM reply which may:</p>
<ul><li>be plain JSON: <code>{"a": 1}</code></li>
<li>be wrapped in markdown fences: <code>&#96;&#96;&#96;json ... &#96;&#96;&#96;</code> or <code>&#96;&#96;&#96; ... &#96;&#96;&#96;</code></li>
<li>have chatty text before/after: <code>Sure! Here you go: {"a": 1} Hope that helps.</code></li></ul>
<p>Strategy: try <code>json.loads</code> on the stripped text; otherwise take the substring from the first <code>{</code> to the last <code>}</code>. If nothing parses, raise <code>ValueError</code>.</p>
<p>Then implement <code>require_keys(data, keys)</code> that raises <code>ValueError</code> listing any missing keys, else returns <code>data</code>.</p>`,
starter:py`import json

def extract_json(text):
    pass

def require_keys(data, keys):
    pass

reply = 'Sure! Here is the data:\n{"name": "Ada", "skills": ["math", "code"]}\nAnything else?'
print(extract_json(reply))
`,
solution:py`import json

def extract_json(text):
    t = text.strip()
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        pass
    start, end = t.find("{"), t.rfind("}")
    if start != -1 and end > start:
        try:
            return json.loads(t[start:end + 1])
        except json.JSONDecodeError:
            pass
    raise ValueError("No valid JSON object found")

def require_keys(data, keys):
    missing = [k for k in keys if k not in data]
    if missing:
        raise ValueError("Missing keys: " + ", ".join(missing))
    return data
`,
tests:py`FENCE = chr(96) * 3
assert extract_json('{"a": 1}') == {"a": 1}, "Plain JSON"
assert extract_json(FENCE + 'json\n{"a": 1, "b": [1, 2]}\n' + FENCE) == {"a": 1, "b": [1, 2]}, "Fenced json block"
assert extract_json(FENCE + '\n{"x": true}\n' + FENCE) == {"x": True}, "Fenced block without language"
assert extract_json('Sure! {"name": "Ada", "n": {"deep": 1}} Hope that helps.') == {"name": "Ada", "n": {"deep": 1}}, "JSON inside chatty text (nested braces)"
try:
    extract_json("I cannot help with that."); assert False, "Should raise ValueError when no JSON"
except ValueError:
    pass
d = {"name": "Ada", "age": 36}
assert require_keys(d, ["name"]) is d, "require_keys should return the data"
try:
    require_keys(d, ["name", "email", "phone"]); assert False, "Should raise for missing keys"
except ValueError as e:
    assert "email" in str(e) and "phone" in str(e), "Error should list missing keys"
print("✅ All checks passed!")
`},
project:{title:"Recipe extractor with a Pydantic schema",
desc:"Paste any recipe blog text and get back clean structured data (title, servings, ingredients with quantities, steps) saved as JSON.",
steps:["pip install pydantic. Define Ingredient and Recipe models.","Call the model with the schema and read the parsed object.","Save it to recipe.json and print a shopping list.","Try a messy blog post with a long personal story before the recipe."],
code:{gemini:py`from pydantic import BaseModel
from google import genai

class Ingredient(BaseModel):
    name: str
    quantity: str

class Recipe(BaseModel):
    title: str
    servings: int
    ingredients: list[Ingredient]
    steps: list[str]

client = genai.Client()
text = open("recipe_post.txt").read()
resp = client.models.generate_content(
    model="gemini-flash-latest",
    contents=f"Extract the recipe from this text:\n<post>{text}</post>",
    config={"response_mime_type": "application/json",
            "response_schema": Recipe},
)
recipe: Recipe = resp.parsed          # already a Recipe instance
open("recipe.json", "w").write(recipe.model_dump_json(indent=2))
for i in recipe.ingredients:
    print(f"- {i.quantity} {i.name}")
`,
openai:py`from pydantic import BaseModel
from openai import OpenAI

class Ingredient(BaseModel):
    name: str
    quantity: str

class Recipe(BaseModel):
    title: str
    servings: int
    ingredients: list[Ingredient]
    steps: list[str]

client = OpenAI()
text = open("recipe_post.txt").read()
resp = client.responses.parse(
    model="gpt-6-luna",
    input=f"Extract the recipe from this text:\n<post>{text}</post>",
    text_format=Recipe,
)
recipe: Recipe = resp.output_parsed
open("recipe.json", "w").write(recipe.model_dump_json(indent=2))
for i in recipe.ingredients:
    print(f"- {i.quantity} {i.name}")
`}}
});
})();
