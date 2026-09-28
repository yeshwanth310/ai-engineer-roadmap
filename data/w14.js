(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
W.push({
id:14, phase:4, title:"Beyond text: multimodal inputs & fine-tuning vs RAG",
goal:"Send images and PDFs to models (multimodal), and understand — in plain English — what fine-tuning is and when to choose prompting, RAG or fine-tuning.",
plan:[["30m","Read"],["10m","Quiz"],["40m","Exercise"],["40m","Mini project"]],
analogy:"Multimodal means the model has eyes (and sometimes ears), not just a text box: you can hand it a photo of a receipt the way you'd hand it to a friend. For fine-tuning vs RAG, imagine preparing an employee: RAG is giving them an open-book exam with the company handbook on the desk; fine-tuning is sending them on a training course so certain habits (tone, format, style) become second nature. Training changes behaviour — it's a poor way to teach facts that change every week.",
why:"Lots of real business data lives in screenshots, scanned forms, charts and PDFs, so multimodal apps unlock huge value cheaply. And knowing when NOT to fine-tune saves weeks of effort — most teams should exhaust prompting and RAG first.",
explain:`
<h3>Multimodal: images, PDFs, audio</h3>
<p>Modern models like Gemini, GPT and Claude are <b>multimodal</b>: besides text they accept images and documents (Gemini also handles audio and video). Under the hood the image is turned into tokens too, so images count toward your context window and bill. You send them as extra <b>parts</b> of the message, next to your text instruction:</p>
<ul>
<li><b>Gemini</b> — add <code>types.Part.from_bytes(data=..., mime_type="image/jpeg")</code> to <code>contents</code> (PDFs work the same way with <code>application/pdf</code>).</li>
<li><b>OpenAI</b> — an <code>input_image</code> item containing a URL or a <b>data URL</b> (<code>data:image/png;base64,...</code>).</li>
<li><b>Claude</b> — an <code>image</code> content block with <code>{"type": "base64", "media_type": ..., "data": ...}</code>.</li>
</ul>
<p><b>Base64</b> is simply a way to write binary data (like a photo) using only ordinary letters and digits, so it can travel inside JSON. It's not encryption — just packaging. Great uses: reading receipts and invoices into structured data, describing charts, checking screenshots, extracting tables from PDFs. Combine with Week 7's structured output for superpowers.</p>
<h3>Fine-tuning vs RAG vs prompting</h3>
<p><b>Fine-tuning</b> means continuing to train a model on your own examples (hundreds or thousands of input → ideal output pairs) so its <i>default behaviour</i> changes. It's good at teaching <b>style, tone, format and narrow skills</b> consistently — and can let a small, cheap model do a task that otherwise needs a big one. It's bad at teaching <b>facts</b>: they're blurred into the model, can't be cited, and go stale.</p>
<table class="tbl"><tr><th>Need</th><th>Best first choice</th></tr>
<tr><td>Answer from private or frequently changing documents, with citations</td><td><b>RAG</b></td></tr>
<tr><td>A particular format or tone, a few examples are enough</td><td><b>Prompting</b> (+ few-shot)</td></tr>
<tr><td>Very consistent style/format at high volume, you have lots of good examples</td><td><b>Fine-tuning</b> (after trying the above)</td></tr></table>
<p>The practical order: <b>prompting → RAG → fine-tuning</b>, and they combine (a fine-tuned model can still use RAG). Fine-tuning options differ by provider and change often — check each provider's current docs before planning around it.</p>`,
concepts:[["Multimodal","A model that accepts more than text: images, PDFs, audio, video."],["Part / content block","One piece of a message — text, image, or file."],["Base64","A way to write binary data as plain text so it fits in JSON. Not encryption."],["Data URL","A string like data:image/png;base64,... that embeds a file inline."],["Fine-tuning","Extra training on your examples to change a model's default behaviour."],["Training examples","Input → ideal output pairs used for fine-tuning (often in a JSONL file)."]],
resources:[
 {t:"Gemini API: Image understanding",u:"https://ai.google.dev/gemini-api/docs/image-understanding",type:"docs"},
 {t:"Gemini API: Document (PDF) understanding",u:"https://ai.google.dev/gemini-api/docs/document-processing",type:"docs"},
 {t:"Claude docs: Vision",u:"https://docs.claude.com/en/docs/build-with-claude/vision",type:"docs"},
 {t:"OpenAI: Images and vision",u:"https://platform.openai.com/docs/guides/images-vision",type:"docs"},
 {t:"Finetuning Large Language Models — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/finetuning-large-language-models/",type:"course"}
],
quiz:[
 {q:"What does ‘multimodal’ mean for an LLM?",o:["It runs on many servers","It can take inputs like images/PDFs/audio, not just text","It speaks many languages","It has many model sizes"],a:1,e:"Multimodal = multiple kinds of input (and sometimes output)."},
 {q:"What is base64?",o:["An encryption method","A way to encode binary data as plain text so it can travel in JSON","A compression format that halves size","A model name"],a:1,e:"It's packaging, not security — anyone can decode it."},
 {q:"Your support bot must answer from a policy manual updated weekly, with citations. Best approach?",o:["Fine-tune every week","RAG","Raise temperature","Bigger context only, no retrieval ever"],a:1,e:"Fresh, citable knowledge is RAG's sweet spot."},
 {q:"Fine-tuning is best at teaching…",o:["Fast-changing facts","Consistent style, tone, format or a narrow skill","Real-time stock prices","Citations"],a:1,e:"Training shapes behaviour; retrieval supplies facts."},
 {q:"Sensible order to try approaches?",o:["Fine-tuning → RAG → prompting","Prompting → RAG → fine-tuning","Only fine-tuning","Only RAG"],a:1,e:"Start cheap and simple; fine-tune only when you've proven you need it."}
],
exercise:{title:"Build multimodal messages for 3 providers",
task:`<p>Offline practice with the exact message shapes each API expects (image bytes are provided).</p>
<ul><li><code>to_base64(data)</code> → base64 <b>string</b> (use <code>base64.b64encode(data).decode("ascii")</code>).</li>
<li><code>to_data_url(data, mime)</code> → <code>"data:MIME;base64,B64"</code>.</li>
<li><code>image_message(provider, data, mime, prompt)</code> returns:
<ul><li><code>"gemini"</code> → a list of parts: <code>[{"inline_data": {"mime_type": mime, "data": b64}}, {"text": prompt}]</code></li>
<li><code>"openai"</code> → <code>{"role": "user", "content": [{"type": "input_text", "text": prompt}, {"type": "input_image", "image_url": data_url}]}</code></li>
<li><code>"anthropic"</code> → <code>{"role": "user", "content": [{"type": "image", "source": {"type": "base64", "media_type": mime, "data": b64}}, {"type": "text", "text": prompt}]}</code></li>
<li>anything else → <code>ValueError</code></li></ul></li>
<li><code>recommend(fresh_or_private_knowledge, needs_consistent_style, num_examples)</code> → <code>"rag"</code> if the first flag is true; else <code>"fine-tune"</code> if style is needed <b>and</b> num_examples ≥ 100; else <code>"prompting"</code>.</li></ul>`,
starter:py`import base64

def to_base64(data):
    pass

def to_data_url(data, mime):
    pass

def image_message(provider, data, mime, prompt):
    pass

def recommend(fresh_or_private_knowledge, needs_consistent_style, num_examples):
    pass

PNG = bytes([137, 80, 78, 71, 13, 10, 26, 10])   # first bytes of a PNG file
print(to_data_url(PNG, "image/png"))
print(image_message("anthropic", PNG, "image/png", "What is in this image?"))
`,
solution:py`import base64

def to_base64(data):
    return base64.b64encode(data).decode("ascii")

def to_data_url(data, mime):
    return f"data:{mime};base64,{to_base64(data)}"

def image_message(provider, data, mime, prompt):
    b64 = to_base64(data)
    if provider == "gemini":
        return [{"inline_data": {"mime_type": mime, "data": b64}}, {"text": prompt}]
    if provider == "openai":
        return {"role": "user", "content": [{"type": "input_text", "text": prompt},
                                            {"type": "input_image", "image_url": to_data_url(data, mime)}]}
    if provider == "anthropic":
        return {"role": "user", "content": [{"type": "image", "source": {"type": "base64", "media_type": mime, "data": b64}},
                                            {"type": "text", "text": prompt}]}
    raise ValueError(f"unknown provider {provider}")

def recommend(fresh_or_private_knowledge, needs_consistent_style, num_examples):
    if fresh_or_private_knowledge:
        return "rag"
    if needs_consistent_style and num_examples >= 100:
        return "fine-tune"
    return "prompting"
`,
tests:py`PNG = bytes([137, 80, 78, 71, 13, 10, 26, 10])
assert to_base64(PNG) == "iVBORw0KGgo=", "Base64 wrong: " + repr(to_base64(PNG))
assert isinstance(to_base64(b"hi"), str), "to_base64 must return a str, not bytes"
assert to_data_url(PNG, "image/png") == "data:image/png;base64,iVBORw0KGgo="
g = image_message("gemini", PNG, "image/png", "Describe")
assert g == [{"inline_data": {"mime_type": "image/png", "data": "iVBORw0KGgo="}}, {"text": "Describe"}], "Gemini parts wrong: " + repr(g)
o = image_message("openai", PNG, "image/png", "Describe")
assert o == {"role": "user", "content": [{"type": "input_text", "text": "Describe"}, {"type": "input_image", "image_url": "data:image/png;base64,iVBORw0KGgo="}]}, "OpenAI message wrong: " + repr(o)
a = image_message("anthropic", PNG, "image/png", "Describe")
assert a["content"][0] == {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": "iVBORw0KGgo="}}, "Claude image block wrong"
assert a["content"][1] == {"type": "text", "text": "Describe"} and a["role"] == "user"
try:
    image_message("fax", PNG, "image/png", "x"); assert False, "Unknown provider should raise ValueError"
except ValueError:
    pass
assert recommend(True, True, 5000) == "rag", "Fresh/private knowledge -> rag"
assert recommend(False, True, 500) == "fine-tune"
assert recommend(False, True, 20) == "prompting", "Too few examples to fine-tune"
assert recommend(False, False, 1000) == "prompting"
print("✅ All checks passed!")
`},
project:{title:"Receipt scanner: photo → structured expense",
desc:"Take photos of 3–5 receipts with your phone and turn each into a validated Expense record (merchant, date, total, items) saved to expenses.csv.",
steps:["Save receipt photos as receipts/*.jpg.","Send each image plus an instruction, asking for structured output (Pydantic Expense model).","Append results to expenses.csv and print a monthly total.","Try a blurry photo and a PDF invoice — how does it cope? Add a ‘confidence’ field and flag low-confidence rows for review."],
code:{gemini:py`import csv, glob, pathlib
from pydantic import BaseModel
from google import genai
from google.genai import types

class Expense(BaseModel):
    merchant: str
    date: str          # YYYY-MM-DD
    total: float
    items: list[str]

client = genai.Client()
rows = []
for path in glob.glob("receipts/*.jpg"):
    img = pathlib.Path(path).read_bytes()
    resp = client.models.generate_content(
        model="gemini-flash-latest",
        contents=[types.Part.from_bytes(data=img, mime_type="image/jpeg"),
                  "Extract this receipt. Use YYYY-MM-DD for the date."],
        config={"response_mime_type": "application/json", "response_schema": Expense},
    )
    e: Expense = resp.parsed
    rows.append([path, e.merchant, e.date, e.total, "; ".join(e.items)])

with open("expenses.csv", "w", newline="") as f:
    csv.writer(f).writerows([["file", "merchant", "date", "total", "items"], *rows])
print("Total:", sum(r[3] for r in rows))
`,
openai:py`import base64, csv, glob, pathlib
from pydantic import BaseModel
from openai import OpenAI

class Expense(BaseModel):
    merchant: str
    date: str
    total: float
    items: list[str]

client = OpenAI()
rows = []
for path in glob.glob("receipts/*.jpg"):
    b64 = base64.b64encode(pathlib.Path(path).read_bytes()).decode()
    resp = client.responses.parse(
        model="gpt-6-luna",
        input=[{"role": "user", "content": [
            {"type": "input_text", "text": "Extract this receipt. Use YYYY-MM-DD for the date."},
            {"type": "input_image", "image_url": f"data:image/jpeg;base64,{b64}"}]}],
        text_format=Expense,
    )
    e = resp.output_parsed
    rows.append([path, e.merchant, e.date, e.total, "; ".join(e.items)])

with open("expenses.csv", "w", newline="") as f:
    csv.writer(f).writerows([["file", "merchant", "date", "total", "items"], *rows])
print("Total:", sum(r[3] for r in rows))
`,
anthropic:py`import base64, csv, glob, pathlib
from pydantic import BaseModel
import anthropic

class Expense(BaseModel):
    merchant: str
    date: str
    total: float
    items: list[str]

client = anthropic.Anthropic()
rows = []
for path in glob.glob("receipts/*.jpg"):
    b64 = base64.b64encode(pathlib.Path(path).read_bytes()).decode()
    resp = client.messages.parse(
        model="claude-sonnet-5-5", max_tokens=1024, output_format=Expense,
        messages=[{"role": "user", "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": b64}},
            {"type": "text", "text": "Extract this receipt. Use YYYY-MM-DD for the date."}]}],
    )
    e = resp.parsed_output
    rows.append([path, e.merchant, e.date, e.total, "; ".join(e.items)])

with open("expenses.csv", "w", newline="") as f:
    csv.writer(f).writerows([["file", "merchant", "date", "total", "items"], *rows])
print("Total:", sum(r[3] for r in rows))
`}}
});
})();
