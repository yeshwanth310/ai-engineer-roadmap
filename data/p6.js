(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
/* ================= TOOLKIT P6 ================= */
W.push({
id:106, phase:0, title:"Comprehensions, sorting & Pythonic tools",
skip:"you write list and dict comprehensions comfortably, and sort lists of dicts with sorted(..., key=lambda ...).",
goal:"Transform and filter collections in one readable line with comprehensions, sort data by any field, and use handy built-ins (enumerate, zip, any, all, sum, max) that show up constantly in AI code.",
plan:[["25m","Read & try"],["10m","Quiz"],["45m","Exercise"],["40m","Mini project"]],
analogy:"A <b>list comprehension</b> is a sorting machine on a conveyor belt: “for every item coming in, if it passes the check, put this version of it in the output box.” <b>sorted(..., key=...)</b> is telling a librarian “line these books up by page count” instead of by title. The <code>key</code> is the thing you measure each book by.",
why:"AI code is full of reshaping data: pull the text out of search results, keep only chunks above a score, batch 100 texts per embedding call, rank models by eval score. Comprehensions and sorting make those one-liners readable, and you'll see them in every SDK example.",
explain:`
<p><b>List comprehensions</b> build a new list from an old one:</p>
<pre class="code">texts   = [r["text"] for r in results]                  # transform every item
good    = [r for r in results if r["score"] > 0.8]       # filter
lengths = [len(t) for t in texts if t]                   # both</pre>
<p>Read it as “<i>[what to keep] for [each item] in [collection] if [condition]</i>”. The same idea gives you <b>dict comprehensions</b> <code>{w: len(w) for w in words}</code> and <b>set comprehensions</b> <code>{r["source"] for r in results}</code>. If a comprehension gets hard to read, a normal for loop is perfectly fine. Clarity wins.</p>
<p><b>Sorting:</b> <code>sorted(items)</code> returns a new sorted list, while <code>items.sort()</code> sorts in place. To sort by a field, pass a <code>key</code> function:</p>
<pre class="code">sorted(results, key=lambda r: r["score"], reverse=True)      # best first
sorted(results, key=lambda r: (-r["score"], r["cost"]))      # score high→low, then cost low→high</pre>
<p>A <b>lambda</b> is a tiny unnamed function: <code>lambda r: r["score"]</code> means “given r, return r['score']”. Returning a <b>tuple</b> sorts by the first value, then breaks ties with the second.</p>
<p><b>Handy built-ins:</b></p>
<ul>
<li><code>enumerate(items, start=1)</code> gives <code>(1, item), (2, item)...</code>, which is perfect for numbering sources [1], [2] in a RAG prompt.</li>
<li><code>zip(texts, vectors)</code> pairs two lists item by item (Week 10 does exactly this).</li>
<li><code>sum(...)</code>, <code>max(..., key=...)</code> and <code>min(...)</code>. <code>any(...)</code> is True if at least one item is truthy, and <code>all(...)</code> is True if every item is.</li>
<li>Slicing in steps, <code>items[i:i+100]</code> inside <code>range(0, len(items), 100)</code>, splits a list into batches (Week 11 uses this for embedding calls).</li>
<li>A <b>generator expression</b> <code>sum(len(t) for t in texts)</code> is a comprehension without the brackets. It computes items one at a time instead of building a list.</li>
</ul>`,
concepts:[["List comprehension","[expr for x in items if cond]: build a list in one line."],["Dict / set comprehension","{k: v for ...} and {x for ...}: build dicts and sets the same way."],["sorted + key","Sort by any field; a tuple key breaks ties; reverse=True for descending."],["lambda","A tiny inline function, e.g. lambda r: r[\"score\"]."],["enumerate / zip","Number items; pair up two lists item by item."],["any / all / sum / max","Quick yes/no checks and totals over a collection."]],
resources:[
 {t:"The Python Tutorial: List comprehensions",u:"https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions",type:"docs"},
 {t:"Python docs: Sorting techniques (HOWTO)",u:"https://docs.python.org/3/howto/sorting.html",type:"docs"},
 {t:"Real Python: When to use a list comprehension",u:"https://realpython.com/list-comprehension-python/",type:"article"},
 {t:"Python docs: Built-in functions",u:"https://docs.python.org/3/library/functions.html",type:"docs"}
],
quiz:[
 {q:"What does <code>[x * 2 for x in [1, 2, 3] if x > 1]</code> give?",o:["[2, 4, 6]","[4, 6]","[1, 2, 3]","[2, 3]"],a:1,e:"Keep x > 1 (2 and 3), then double them."},
 {q:"How do you sort a list of result dicts by score, highest first?",o:["results.sort(\"score\")","sorted(results, key=lambda r: r[\"score\"], reverse=True)","max(results)","sorted(results, reverse=\"score\")"],a:1,e:"key says what to measure, and reverse=True puts the biggest first."},
 {q:"<code>key=lambda r: (-r[\"score\"], r[\"cost\"])</code> sorts by…",o:["Cost only","Score high→low, and ties broken by lower cost","Random","Score low→high"],a:1,e:"A tuple key sorts by the first item, then uses the second to break ties. The minus sign reverses score."},
 {q:"Which built-in numbers items as (1, item), (2, item)…?",o:["zip","enumerate(items, start=1)","range","sorted"],a:1,e:"enumerate adds a counter, and start=1 begins at 1."},
 {q:"How do you split 250 texts into batches of 100?",o:["[texts[i:i+100] for i in range(0, len(texts), 100)]","texts / 100","split(texts, 100)","texts[100]"],a:0,e:"Step through the start positions and slice each batch. That gives 3 batches: 100, 100 and 50."}
],
exercise:{title:"Reshape search results and eval scores",
task:`<p>Implement each in one or two lines if you can:</p>
<ul>
<li><code>texts_above(results, min_score)</code>: the <code>"text"</code> of every result whose <code>"score"</code> is at least <code>min_score</code>, in the original order.</li>
<li><code>sources(results)</code>: a <b>sorted list</b> of the unique <code>"source"</code> values.</li>
<li><code>leaderboard(evals, n=3)</code>: evals are dicts <code>{"model", "score", "cost"}</code>. Return the names of the top n models, by score (high first), with ties broken by lower cost.</li>
<li><code>batches(items, size)</code>: split a list into consecutive lists of at most <code>size</code> items.</li>
<li><code>numbered(texts)</code>: one string with lines like <code>"[1] first text"</code>, <code>"[2] second"</code>, joined by <code>"\n"</code>.</li>
</ul>`,
starter:py`def texts_above(results, min_score):
    return []  # TODO: list comprehension


def sources(results):
    return []  # TODO: set comprehension, then sorted()


def leaderboard(evals, n=3):
    return []  # TODO: sorted(..., key=lambda e: ...)


def batches(items, size):
    return [items]  # TODO


def numbered(texts):
    return ""  # TODO: enumerate(texts, start=1)


results = [
    {"text": "Refunds take 5 days", "score": 0.91, "source": "faq.md"},
    {"text": "Our office is in Pune", "score": 0.42, "source": "about.md"},
    {"text": "Refund form link", "score": 0.83, "source": "faq.md"},
]
print(texts_above(results, 0.8))
print(numbered(texts_above(results, 0.8)))
`,
solution:py`def texts_above(results, min_score):
    return [r["text"] for r in results if r["score"] >= min_score]


def sources(results):
    return sorted({r["source"] for r in results})


def leaderboard(evals, n=3):
    ranked = sorted(evals, key=lambda e: (-e["score"], e["cost"]))
    return [e["model"] for e in ranked[:n]]


def batches(items, size):
    return [items[i:i + size] for i in range(0, len(items), size)]


def numbered(texts):
    return "\n".join(f"[{i}] {t}" for i, t in enumerate(texts, start=1))


results = [
    {"text": "Refunds take 5 days", "score": 0.91, "source": "faq.md"},
    {"text": "Our office is in Pune", "score": 0.42, "source": "about.md"},
    {"text": "Refund form link", "score": 0.83, "source": "faq.md"},
]
print(texts_above(results, 0.8))
print(numbered(texts_above(results, 0.8)))
`,
tests:py`R = [
    {"text": "Refunds take 5 days", "score": 0.91, "source": "faq.md"},
    {"text": "Our office is in Pune", "score": 0.42, "source": "about.md"},
    {"text": "Refund form link", "score": 0.83, "source": "faq.md"},
]
assert texts_above(R, 0.8) == ["Refunds take 5 days", "Refund form link"], "texts_above gave " + repr(texts_above(R, 0.8))
assert texts_above(R, 0.83) == ["Refunds take 5 days", "Refund form link"], "Use >= (at least min_score)"
assert sources(R) == ["about.md", "faq.md"], "sources should be unique and sorted"
E = [{"model": "a", "score": 0.7, "cost": 1.0}, {"model": "b", "score": 0.9, "cost": 5.0},
     {"model": "c", "score": 0.9, "cost": 2.0}, {"model": "d", "score": 0.5, "cost": 0.1}]
assert leaderboard(E) == ["c", "b", "a"], "Highest score first, ties by lower cost. Got " + repr(leaderboard(E))
assert leaderboard(E, n=1) == ["c"]
assert batches(list(range(7)), 3) == [[0, 1, 2], [3, 4, 5], [6]], "batches(range(7), 3) wrong: " + repr(batches(list(range(7)), 3))
assert batches([], 3) == [], "No items -> no batches"
assert numbered(["first", "second"]) == "[1] first\n[2] second", "numbered gave " + repr(numbered(["first", "second"]))
assert numbered([]) == ""
print("✅ All checks passed!")
`},
project:{title:"Model leaderboard from a JSON Lines results file",
desc:"Imagine you ran the same 5 questions through several models and saved each graded answer as a line in <code>results.jsonl</code>. Write a script that turns that file into a tidy leaderboard: average score, total cost and pass rate per model, sorted best first. You'll do the real version of this in Week 22.",
steps:["Create <code>results.jsonl</code> with lines like <code>{\"model\": \"a\", \"question\": 1, \"score\": 0.8, \"cost\": 0.002}</code> (make up a dozen).","Load it with your <code>read_jsonl</code> from P4.","Group the rows per model with a dict comprehension, then compute the average score, total cost and pass rate (score ≥ 0.7).","Sort with a tuple key and print an aligned table with f-strings."],
code:{python:py`# leaderboard.py - run with:  python leaderboard.py
import json

rows = [json.loads(line) for line in open("results.jsonl", encoding="utf-8") if line.strip()]
models = sorted({r["model"] for r in rows})
by_model = {m: [r for r in rows if r["model"] == m] for m in models}

table = []
for model, rs in by_model.items():
    table.append({
        "model": model,
        "avg": sum(r["score"] for r in rs) / len(rs),
        "cost": sum(r["cost"] for r in rs),
        "pass": sum(1 for r in rs if r["score"] >= 0.7) / len(rs),
    })

table.sort(key=lambda t: (-t["avg"], t["cost"]))
print(f"{'#':<3}{'model':<16}{'avg':>6}{'pass':>7}{'cost $':>10}")
for i, t in enumerate(table, start=1):
    print(f"{i:<3}{t['model']:<16}{t['avg']:>6.2f}{t['pass']:>7.0%}{t['cost']:>10.4f}")
`}}
});
})();
