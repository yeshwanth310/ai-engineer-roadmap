(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
const harness = py`
CASES = [  # a tiny "golden set": question, facts the answer MUST contain, tag
    {"q": "How many days of paid leave?", "must": ["24"], "tag": "hr"},
    {"q": "How do I reset my password?", "must": ["settings"], "tag": "it"},
    {"q": "What is the CEO's salary?", "must": ["don't know"], "tag": "refusal"},
]
JUDGE = ("You are a strict grader. Question: {q}\nAnswer: {a}\n"
         "Is the answer helpful, grounded and polite? Reply with JSON {{\"score\": 1-5, \"reason\": \"...\"}}")

def my_app(question: str) -> str:
    ...   # import your Week 12 RAG app here

results = []
for c in CASES:
    answer = my_app(c["q"])
    contains_ok = all(m.lower() in answer.lower() for m in c["must"])
    verdict = judge(JUDGE.format(q=c["q"], a=answer))          # LLM-as-judge
    results.append({**c, "answer": answer, "contains_ok": contains_ok, **verdict})
    print(f"[{c['tag']:8}] contains={contains_ok!s:5} judge={verdict['score']}  {c['q']}")
print("pass rate:", sum(r["contains_ok"] for r in results) / len(results))
`;
W.push({
id:22, phase:7, title:"Evals: testing LLM apps (incl. LLM-as-judge)",
goal:"Build an evaluation set and harness: rule-based checks, LLM-as-judge grading, pass rates per category — so you can change prompts or models with confidence.",
plan:[["25m","Read"],["10m","Quiz"],["45m","Exercise"],["40m","Mini project"]],
analogy:"Evals are the driving test for your app. You don't judge a learner driver by one lucky trip round the block — you use a standard route with specific checks (mirror, signal, parking). An eval set is that standard route: the same questions every time, scored the same way, so you can tell whether a change made things better or worse.",
why:"Without evals, every prompt tweak is a guess — you fix one answer and silently break three others. With evals you can swap models, cut costs and ship improvements knowing exactly what changed. Teams that ship great AI products almost always have strong evals.",
explain:`
<p>Normal software tests check exact outputs: <code>add(2, 2) == 4</code>. LLM outputs vary in wording, so we need <b>evals</b> — a set of test inputs plus a way to score the outputs.</p>
<ul>
<li><b>Golden dataset</b> — 20–100 realistic inputs (start with 20!), ideally from real users, each with what a good answer must contain or avoid. Include tricky and adversarial cases and questions the app <i>should refuse</i>.</li>
<li><b>Code-based graders</b> — cheap, fast, deterministic: exact match, “contains the right number”, valid JSON, correct tool called, response under 100 words, cites a source.</li>
<li><b>LLM-as-judge</b> — a second model grades the answer against a clear rubric (“Score 1–5 for groundedness: does every claim appear in the sources?”). Great for fuzzy qualities like helpfulness or tone. Judges have biases (they can favour longer answers), so give them specific criteria, ask for a short reason, and spot-check them against your own judgement.</li>
<li><b>Human review</b> — the gold standard for a small sample. Read real outputs regularly; you'll find failure types nobody thought to test.</li>
</ul>
<p>Report results <b>per category</b> (tags like “billing”, “refusal”) — an overall 90% can hide a category at 40%. For agents, also evaluate the <b>path</b>: did it call the right tools, in a sensible number of steps? Run your evals before and after every change — like a regression test suite.</p>`,
concepts:[["Eval","A repeatable test of an LLM app: inputs + scoring method."],["Golden dataset","A curated set of test cases with expected qualities."],["Code-based grader","A program that checks outputs (contains, valid JSON, length…)."],["LLM-as-judge","Using a model with a rubric to grade another model's output."],["Rubric","Explicit scoring criteria given to a judge (human or LLM)."],["Regression","Something that used to work breaking after a change."]],
resources:[
 {t:"Evaluating AI Agents — DeepLearning.AI",u:"https://www.deeplearning.ai/short-courses/evaluating-ai-agents/",type:"course"},
 {t:"Your AI Product Needs Evals — Hamel Husain",u:"https://hamel.dev/blog/posts/evals/",type:"article"},
 {t:"Claude docs: Define success criteria & build evaluations",u:"https://docs.claude.com/en/docs/test-and-evaluate/develop-tests",type:"docs"},
 {t:"OpenAI: Evaluation best practices",u:"https://platform.openai.com/docs/guides/evaluation-best-practices",type:"docs"}
],
quiz:[
 {q:"Why can't you test LLM apps only with exact-match assertions?",o:["LLMs are too slow","The same correct answer can be worded many ways","Python can't compare strings","Exact match is illegal"],a:1,e:"Use flexible graders: contains, JSON validity, rubric-based judges."},
 {q:"What is LLM-as-judge?",o:["A lawsuit about AI","Using a model with a rubric to grade outputs","A model that writes laws","Fine-tuning"],a:1,e:"A judge model scores outputs against explicit criteria."},
 {q:"Overall pass rate is 90%, but refusal cases pass 40%. What does this show?",o:["Everything is fine","Why you should report results per category","Evals are useless","You need more GPUs"],a:1,e:"Averages hide weak spots; slice by tag."},
 {q:"A known weakness of LLM judges is…",o:["They can't read","Biases such as preferring longer answers — so use specific rubrics and spot-check","They are always perfect","They only work in French"],a:1,e:"Calibrate judges against human judgement."},
 {q:"When should you run your eval set?",o:["Once, at launch","Before and after every prompt/model/code change","Never","Only when users complain"],a:1,e:"Evals act as a regression suite."}
],
exercise:{title:"Write an eval harness",
task:`<p>Implement graders and a runner:</p>
<ul><li><code>grade_contains(output, must)</code> → <code>True</code> if every string in <code>must</code> appears in output (case-insensitive).</li>
<li><code>grade_max_words(output, n)</code> → <code>True</code> if the output has at most n words.</li>
<li><code>run_evals(app, cases, judge)</code>: for each case <code>{"input", "must", "max_words", "tag"}</code> call <code>out = app(case["input"])</code>. A case <b>passes</b> if both code graders pass <b>and</b> <code>judge(case["input"], out)</code> (returns a score 1–5) is ≥ 4. Return:
<pre class="code">{"pass_rate": passed/total rounded to 2 dp,
 "by_tag": {tag: passed/total_for_tag rounded to 2},
 "failures": [inputs of failed cases, in order]}</pre></li></ul>`,
starter:py`def grade_contains(output, must):
    pass

def grade_max_words(output, n):
    pass

def run_evals(app, cases, judge):
    pass

# a fake app + fake judge so we can test the harness itself
def app(q):
    return {"leave?": "You get 24 days of paid leave.",
            "password?": "Go to settings and click reset."}.get(q, "I think it is probably fine.")
def judge(q, out):
    return 2 if "probably" in out else 5

CASES = [
    {"input": "leave?", "must": ["24"], "max_words": 20, "tag": "hr"},
    {"input": "password?", "must": ["settings"], "max_words": 20, "tag": "it"},
    {"input": "salary?", "must": ["don't know"], "max_words": 20, "tag": "refusal"},
]
print(run_evals(app, CASES, judge))
`,
solution:py`def grade_contains(output, must):
    low = output.lower()
    return all(m.lower() in low for m in must)

def grade_max_words(output, n):
    return len(output.split()) <= n

def run_evals(app, cases, judge):
    passed_total, by_tag, failures = 0, {}, []
    for c in cases:
        out = app(c["input"])
        ok = (grade_contains(out, c["must"]) and grade_max_words(out, c["max_words"])
              and judge(c["input"], out) >= 4)
        t = by_tag.setdefault(c["tag"], [0, 0])
        t[1] += 1
        if ok:
            passed_total += 1; t[0] += 1
        else:
            failures.append(c["input"])
    return {"pass_rate": round(passed_total / len(cases), 2),
            "by_tag": {k: round(p / n, 2) for k, (p, n) in by_tag.items()},
            "failures": failures}
`,
tests:py`assert grade_contains("You get 24 Days", ["24", "days"]) is True, "grade_contains should be True when all strings appear (case-insensitive)"
assert grade_contains("You get 24", ["24", "weeks"]) is False
assert grade_contains("anything", []) is True, "No requirements -> pass"
assert grade_max_words("one two three", 3) is True and grade_max_words("one two three four", 3) is False
def app(q):
    return {"leave?": "You get 24 days of paid leave.", "password?": "Go to settings and click reset.",
            "long?": "word " * 50}.get(q, "I think it is probably fine.")
def judge(q, out):
    return 2 if "probably" in out else 5
CASES = [{"input": "leave?", "must": ["24"], "max_words": 20, "tag": "hr"},
         {"input": "password?", "must": ["settings"], "max_words": 20, "tag": "it"},
         {"input": "salary?", "must": ["don't know"], "max_words": 20, "tag": "refusal"},
         {"input": "long?", "must": [], "max_words": 20, "tag": "hr"}]
r = run_evals(app, CASES, judge)
assert r is not None, "run_evals returned None"
assert r["pass_rate"] == 0.5, "Expected pass_rate 0.5, got " + repr(r["pass_rate"])
assert r["by_tag"] == {"hr": 0.5, "it": 1.0, "refusal": 0.0}, "by_tag wrong: " + repr(r["by_tag"])
assert r["failures"] == ["salary?", "long?"], "failures wrong: " + repr(r["failures"])
calls = []
def judge2(q, out):
    calls.append(q); return 4
r2 = run_evals(app, CASES[:2], judge2)
assert r2["pass_rate"] == 1.0, "A judge score of 4 should pass"
print("✅ All checks passed!")
`},
project:{title:"Eval suite for your RAG app",
desc:"Write 20 test cases for your Week 12 ‘chat with my docs’ app (answerable, unanswerable, tricky), grade them with code checks plus an LLM judge, and save a results table you can compare after every change.",
steps:["Create cases.json with 20 cases: question, must-contain facts, tag.","Implement judge() with structured output: {score: int, reason: str}.","Run the suite, save results to results_YYYYMMDD.csv, print pass rate by tag.","Change one thing (chunk size, k, prompt wording) and rerun — did it really improve?"],
code:{gemini: py`import json
from google import genai
client = genai.Client()

def judge(prompt: str) -> dict:
    r = client.models.generate_content(model="gemini-flash-latest", contents=prompt,
                                       config={"response_mime_type": "application/json"})
    return json.loads(r.text)
` + harness,
openai: py`import json
from openai import OpenAI
client = OpenAI()

def judge(prompt: str) -> dict:
    r = client.responses.create(model="gpt-6-luna", input=prompt,
                                text={"format": {"type": "json_object"}})
    return json.loads(r.output_text)
` + harness,
anthropic: py`import json
import anthropic
client = anthropic.Anthropic()
SCHEMA = {"type": "object", "properties": {"score": {"type": "integer"}, "reason": {"type": "string"}},
          "required": ["score", "reason"], "additionalProperties": False}

def judge(prompt: str) -> dict:
    r = client.messages.create(model="claude-sonnet-5-5", max_tokens=300,
                               messages=[{"role": "user", "content": prompt}],
                               output_config={"format": {"type": "json_schema", "schema": SCHEMA}})
    return json.loads(next(b.text for b in r.content if b.type == "text"))
` + harness}}
});
})();
