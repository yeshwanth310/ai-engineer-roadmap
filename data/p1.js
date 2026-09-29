(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
/* ================= TOOLKIT P1 ================= */
W.push({
id:101, phase:0, title:"Python basics: variables, types, strings & f-strings",
skip:"you can already explain the difference between a str, an int and a float, and you use f-strings without thinking about it.",
goal:"Get comfortable running Python and working with the four everyday value types (text, whole numbers, decimals, true/false), and build clean text with f-strings. That is exactly what you'll do when you build prompts.",
plan:[["30m","Read & try"],["10m","Quiz"],["40m","Exercise"],["40m","Mini project"]],
analogy:"A variable is a labelled box. <code>price = 2.5</code> means “put 2.5 in a box and stick the label <i>price</i> on it”. The <b>type</b> is what kind of thing is inside: text (a letter), a whole number (a count of apples), a decimal (a weight on a kitchen scale) or yes/no (a light switch). An <b>f-string</b> is a fill-in-the-blanks form letter: “Dear {name}, you owe {amount}”.",
why:"Nearly everything in LLM work is text: prompts, replies, file contents, JSON. Being fluent with strings and f-strings is the single most useful Python skill for this roadmap, and mixing up types (like the text \"5\" and the number 5) is the most common beginner bug.",
explain:`
<p><b>Running Python.</b> You can type Python straight into an interactive prompt (run <code>python</code> in a terminal, and <code>exit()</code> to leave), or save it in a file like <code>hello.py</code> and run <code>python hello.py</code>. The exercise box on this page runs real Python in your browser, so you can practise before installing anything.</p>
<p><b>Variables</b> are names for values: <code>model = "gemini-flash"</code>. The name goes on the left, the value on the right, and <code>=</code> means “store”, not “equals”. Names use lowercase_with_underscores by convention.</p>
<p><b>The four everyday types:</b></p>
<ul>
<li><code>str</code> (string): text in quotes, <code>"hello"</code> or <code>'hello'</code>. Triple quotes <code>"""..."""</code> allow several lines, which is handy for long prompts.</li>
<li><code>int</code>: whole numbers such as <code>12500</code>. You can write <code>1_000_000</code> with underscores to make it readable.</li>
<li><code>float</code>: decimals such as <code>0.30</code>. They are tiny approximations, so <code>0.1 + 0.2</code> prints <code>0.30000000000000004</code>. That's normal, so round when you display money.</li>
<li><code>bool</code>: <code>True</code> or <code>False</code>. You get these from comparisons like <code>tokens > 1000</code>.</li>
</ul>
<p>Use <code>type(x)</code> to see what something is. <b>Converting</b> between types is common: <code>int("42")</code> gives 42, <code>float("2.5")</code> gives 2.5, and <code>str(42)</code> gives "42". <code>input()</code> and files always give you <i>text</i>, so convert before doing maths: <code>"5" + "5"</code> is <code>"55"</code>, but <code>5 + 5</code> is <code>10</code>.</p>
<p><b>Useful string tools</b> (methods are actions attached to a value, called with a dot):</p>
<ul>
<li><code>.strip()</code> removes spaces and newlines at both ends. <code>.lower()</code> and <code>.upper()</code> change case.</li>
<li><code>.replace("a", "b")</code> swaps text. <code>.split()</code> breaks text into a list of words, and <code>" ".join(words)</code> glues a list back together.</li>
<li><code>len(text)</code> counts characters. <code>"cat" in text</code> checks whether text contains "cat". <code>text[:100]</code> gives the first 100 characters (this is called slicing).</li>
</ul>
<p><b>f-strings</b> put values into text: <code>f"{model} used {tokens} tokens"</code>. Inside the braces you can add formatting: <code>{tokens:,}</code> gives 12,500 (thousands separators) and <code>{cost:.2f}</code> gives 2 decimal places. This is how you'll build prompts from templates and print tidy usage reports.</p>
<div class="callout"><b>Strings can't be changed in place.</b> <code>text.strip()</code> gives you a <i>new</i> string. Store it with <code>text = text.strip()</code>, or the cleaned version is thrown away. This catches out everyone at least once.</div>`,
concepts:[["Variable","A name that points to a value, like a labelled box."],["str / int / float / bool","Text, whole number, decimal, and True/False: the everyday types."],["Type conversion","int(\"42\"), float(\"2.5\"), str(42): turning one type into another."],["String method","An action on a string, e.g. .strip(), .lower(), .split(), .replace()."],["f-string","f\"Hi {name}\": text with values (and formatting like {x:.2f}) filled in."],["Slicing","text[:100]: take part of a string (or list) by position."]],
resources:[
 {t:"The Python Tutorial: An informal introduction (numbers, text)",u:"https://docs.python.org/3/tutorial/introduction.html",type:"docs"},
 {t:"Real Python: Python f-strings",u:"https://realpython.com/python-f-strings/",type:"article"},
 {t:"Harvard CS50's Introduction to Programming with Python (free)",u:"https://cs50.harvard.edu/python/",type:"course"},
 {t:"Python for Everybody (free book and videos)",u:"https://www.py4e.com/",type:"course"}
],
quiz:[
 {q:"What does <code>\"5\" + \"5\"</code> produce?",o:["10","\"55\"","An error","5.5"],a:1,e:"Both are strings (text), so + glues them together. Convert with int() first to add them as numbers."},
 {q:"You write <code>text.strip()</code> but the spaces are still there when you print <code>text</code>. Why?",o:["strip() is broken","Strings can't be changed in place; you need text = text.strip()","You must import strip","strip only removes letters"],a:1,e:"String methods return a new string. Store the result."},
 {q:"Which f-string shows 1234.5678 as <code>1,234.57</code>?",o:["f\"{x}\"","f\"{x:,.2f}\"","f\"{x:.2}\"","f\"x:,2\""],a:1,e:"The comma adds thousands separators and .2f means 2 decimal places."},
 {q:"What type does <code>input()</code> always return?",o:["int","float","str","bool"],a:2,e:"User input is text. Convert it with int() or float() before doing maths."},
 {q:"What is <code>tokens > 1000</code> when tokens is 1500?",o:["\"True\"","True (a bool)","1500","1"],a:1,e:"Comparisons produce the bool values True or False."}
],
exercise:{title:"Clean text and format a usage line",
task:`<p>Implement three small functions (the kind of helpers you'll use constantly with LLMs):</p>
<ul>
<li><code>clean_prompt(text)</code>: remove spaces and newlines at both ends <b>and</b> squash any run of whitespace inside into a single space. <code>"  Hello \n   world  "</code> becomes <code>"Hello world"</code>. Hint: <code>" ".join(text.split())</code>.</li>
<li><code>parse_price(s)</code>: turn text like <code>"$2.50"</code> or <code>" 0.30 "</code> into a float (2.5, 0.3). Remove spaces and a leading <code>$</code>.</li>
<li><code>usage_line(model, tokens, price_per_million)</code>: cost = tokens ÷ 1,000,000 × price. Return an f-string exactly like <code>"gemini-flash: 12,000 tokens = $0.0036"</code> (thousands separators, and the cost with 4 decimals).</li>
</ul>`,
starter:py`def clean_prompt(text):
    # TODO: strip the ends and squash inner whitespace
    return text


def parse_price(s):
    # TODO: remove spaces and "$", then convert to float
    return s


def usage_line(model, tokens, price_per_million):
    cost = 0  # TODO: calculate the cost
    return f"{model}: {tokens} tokens = {cost}"


print(clean_prompt("  Hello \n   world  "))
print(parse_price("$2.50"))
print(usage_line("gemini-flash", 12000, 0.30))
`,
solution:py`def clean_prompt(text):
    return " ".join(text.split())


def parse_price(s):
    s = s.strip()
    if s.startswith("$"):
        s = s[1:]
    return float(s)


def usage_line(model, tokens, price_per_million):
    cost = tokens / 1_000_000 * price_per_million
    return f"{model}: {tokens:,} tokens = ${'$'}{cost:.4f}"


print(clean_prompt("  Hello \n   world  "))
print(parse_price("$2.50"))
print(usage_line("gemini-flash", 12000, 0.30))
`,
tests:py`assert clean_prompt("  Hello \n   world  ") == "Hello world", "clean_prompt should strip the ends and squash inner whitespace"
assert clean_prompt("one\ttwo\n\nthree") == "one two three", "Tabs and blank lines count as whitespace too"
assert clean_prompt("   ") == "", "Only spaces should become an empty string"
p = parse_price("$2.50")
assert isinstance(p, float), "parse_price must return a float, not " + type(p).__name__
assert p == 2.5, "parse_price('$2.50') should be 2.5"
assert parse_price(" 0.30 ") == 0.3, "parse_price should ignore surrounding spaces"
assert usage_line("gemini-flash", 12000, 0.30) == "gemini-flash: 12,000 tokens = $0.0036", "Got: " + usage_line("gemini-flash", 12000, 0.30)
assert usage_line("big-model", 2500000, 2.0) == "big-model: 2,500,000 tokens = $5.0000", "Got: " + usage_line("big-model", 2500000, 2.0)
print("✅ All checks passed!")
`},
project:{title:"Prompt cost calculator (command line)",
desc:"Write a tiny program that asks for a prompt, estimates its tokens with the ‘4 characters per token’ rule of thumb (Week 1), and prints a tidy cost table for a few model prices. It uses only what you learned today.",
steps:["Create <code>cost.py</code> and store a few example prices in variables (make them up or copy them from provider pricing pages).","Ask for a prompt with <code>input()</code> and clean it with your <code>clean_prompt</code>.","Estimate tokens: characters ÷ 4, rounded up. Then print one formatted line per model using f-strings.","Stretch goal: ask for the expected reply length too, and add output-token costs (which are usually higher)."],
code:{python:py`# cost.py - run with:  python cost.py
import math

PRICE_IN_PER_M = {            # dollars per 1M input tokens (example numbers; check real pricing pages)
    "small-fast-model": 0.30,
    "mid-model": 1.25,
    "big-smart-model": 2.00,
}

def clean_prompt(text):
    return " ".join(text.split())

prompt = clean_prompt(input("Paste your prompt: "))
tokens = math.ceil(len(prompt) / 4)          # rule of thumb: ~4 characters per token
print(f"\n{len(prompt):,} characters ≈ {tokens:,} tokens\n")
print(f"{'model':<20}{'cost':>12}")
for model, price in PRICE_IN_PER_M.items():
    cost = tokens / 1_000_000 * price
    print(f"{model:<20}{cost:>12.6f}")
`}}
});
})();
