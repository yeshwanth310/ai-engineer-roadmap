(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
/* ================= TOOLKIT P3 ================= */
W.push({
id:103, phase:0, title:"Functions, errors & exceptions",
skip:"you write functions with default and keyword arguments, and you know when to use try/except versus raise.",
goal:"Package code into reusable functions with sensible defaults, and handle things going wrong (bad input, missing files, failed API calls) without your program crashing or hiding the problem.",
plan:[["30m","Read & try"],["10m","Quiz"],["45m","Exercise"],["35m","Mini project"]],
analogy:"A <b>function</b> is a recipe card: it has a name (“pancakes”), ingredients you pass in (the parameters), and a result it hands back (<code>return</code>). Default arguments are the “if you don't say, we use 2 eggs” notes. An <b>exception</b> is the smoke alarm. <code>raise</code> sets it off on purpose (“this input is wrong!”), and <code>try/except</code> is the plan for what to do when it goes off, instead of the whole building being evacuated.",
why:"Every LLM call can fail: rate limits, timeouts, bad JSON, missing keys. Wrapping work in small functions and handling exceptions deliberately is what separates a demo that crashes from a tool you can trust, and it's the basis of the retry logic in Week 6.",
explain:`
<p><b>Defining a function:</b></p>
<pre class="code">def estimate_cost(tokens, price_per_million=0.30):
    """Return the dollar cost for a number of tokens."""
    return tokens / 1_000_000 * price_per_million</pre>
<ul>
<li><b>Parameters</b> are the inputs. <code>price_per_million=0.30</code> is a <b>default</b>, used when the caller doesn't pass one.</li>
<li><code>return</code> hands back a result and ends the function. With no return, the function gives <code>None</code>. Printing is not returning: print shows text, return gives your code a value to use.</li>
<li>Call it with <b>positional</b> arguments <code>estimate_cost(5000, 2.0)</code> or <b>keyword</b> arguments <code>estimate_cost(5000, price_per_million=2.0)</code>. Keyword arguments are clearer, and LLM SDKs use them everywhere (<code>model=..., contents=...</code>).</li>
<li>A <code>*</code> in the parameter list, as in <code>def f(q, *, tone="friendly")</code>, forces everything after it to be passed by keyword. The <code>"""docstring"""</code> describes what the function does, and tools and LLMs read it (you'll see this in Week 9!).</li>
<li>Variables created inside a function are <b>local</b>: they disappear when it returns. Pass values in and return values out rather than relying on outside variables.</li>
</ul>
<p><b>Exceptions</b> are Python's way of saying “I can't continue”. You've already met some: <code>ValueError</code> (e.g. <code>int("abc")</code>), <code>KeyError</code> (missing dict key), <code>TypeError</code> (wrong kind of value), <code>FileNotFoundError</code> and <code>ZeroDivisionError</code>. The <b>traceback</b> that prints is a map: read it from the bottom up. The last line says what went wrong, and the lines above say where.</p>
<pre class="code">try:
    temp = float(user_text)
except ValueError:
    print("Please type a number like 0.7")
    temp = 0.7
else:
    print("Got it")          # runs only if no exception happened
finally:
    print("done checking")   # always runs</pre>
<p>Rules of thumb:</p>
<ul>
<li><b>Catch specific exceptions</b> (<code>except ValueError</code>), never a bare <code>except:</code> that hides every bug, including typos.</li>
<li><b>Raise</b> your own when input is wrong: <code>raise ValueError("temperature must be between 0 and 2")</code>. A clear message saves hours later.</li>
<li><b>Fail loudly early</b> (e.g. at startup when an API key is missing) rather than quietly producing wrong results later.</li>
</ul>`,
concepts:[["Function","A named, reusable block of code: def name(params): ... return result"],["Default & keyword arguments","price=0.30 supplies a default; f(x, price=2.0) names the argument you pass."],["return vs print","return gives a value back to your code; print only shows text."],["Exception","An error object that stops normal flow, e.g. ValueError or KeyError."],["try / except / finally","Run risky code, handle specific failures, and always clean up."],["raise","Signal an error yourself, with a helpful message."]],
resources:[
 {t:"The Python Tutorial: Defining functions",u:"https://docs.python.org/3/tutorial/controlflow.html#defining-functions",type:"docs"},
 {t:"The Python Tutorial: Errors and exceptions",u:"https://docs.python.org/3/tutorial/errors.html",type:"docs"},
 {t:"Real Python: Python exceptions, an introduction",u:"https://realpython.com/python-exceptions/",type:"article"},
 {t:"Real Python: Understanding the Python traceback",u:"https://realpython.com/python-traceback/",type:"article"}
],
quiz:[
 {q:"A function prints a result but has no <code>return</code>. What does <code>x = f()</code> store?",o:["The printed text","None","0","An error"],a:1,e:"Without return, a function gives back None. Printing only shows text on the screen."},
 {q:"How should you read a long traceback?",o:["Top line only","From the bottom: the last line says what went wrong, the lines above say where","Ignore it and restart","Middle first"],a:1,e:"The final line holds the exception type and message; the lines above it are the path that led there."},
 {q:"Why avoid a bare <code>except:</code>?",o:["It is slower","It hides every error, including your own bugs and typos","It's not valid Python","It only catches KeyError"],a:1,e:"Catch the specific exceptions you expect, so unexpected bugs still surface."},
 {q:"The user passes temperature=5 but the allowed range is 0 to 2. Best move?",o:["Silently use 5","raise ValueError(\"temperature must be between 0 and 2\")","print a warning and continue","Return None"],a:1,e:"Raise with a clear message, and let the caller decide how to handle it."},
 {q:"In <code>def ask(q, *, model=\"flash\")</code>, how must model be passed?",o:["Positionally only","By keyword: ask(\"hi\", model=\"pro\")","It can't be changed","As a list"],a:1,e:"Parameters after * are keyword-only, which makes calls self-explanatory."}
],
exercise:{title:"Validate inputs with functions and exceptions",
task:`<p>Implement:</p>
<ul>
<li><code>make_prompt(question, *, tone="friendly", max_words=100)</code>: if <code>question.strip()</code> is empty, <code>raise ValueError("question must not be empty")</code>. Otherwise return exactly:<br><code>"Answer in a {tone} tone in at most {max_words} words.\nQuestion: {question}"</code> (with the question stripped).</li>
<li><code>parse_temperature(value)</code>: convert <code>value</code> (text or number) to float. Invalid text should raise the <code>ValueError</code> that <code>float()</code> gives you (just let it happen). If the number is below 0 or above 2, <code>raise ValueError("temperature must be between 0 and 2")</code>.</li>
<li><code>safe_temperatures(values)</code>: use try/except to return a tuple <code>(valid, errors)</code>: the list of parsed valid temperatures, and how many values failed.</li>
</ul>`,
starter:py`def make_prompt(question, *, tone="friendly", max_words=100):
    # TODO: raise ValueError for empty questions, otherwise build the prompt
    pass


def parse_temperature(value):
    # TODO: float(value), then check the 0..2 range
    return value


def safe_temperatures(values):
    valid, errors = [], 0
    # TODO: try parse_temperature on each value, count failures
    return valid, errors


print(make_prompt("  What is a token? ", tone="playful", max_words=30))
print(safe_temperatures(["0.7", "hot", 5, 1]))
`,
solution:py`def make_prompt(question, *, tone="friendly", max_words=100):
    q = question.strip()
    if not q:
        raise ValueError("question must not be empty")
    return f"Answer in a {tone} tone in at most {max_words} words.\nQuestion: {q}"


def parse_temperature(value):
    t = float(value)
    if t < 0 or t > 2:
        raise ValueError("temperature must be between 0 and 2")
    return t


def safe_temperatures(values):
    valid, errors = [], 0
    for v in values:
        try:
            valid.append(parse_temperature(v))
        except ValueError:
            errors += 1
    return valid, errors


print(make_prompt("  What is a token? ", tone="playful", max_words=30))
print(safe_temperatures(["0.7", "hot", 5, 1]))
`,
tests:py`assert make_prompt("  What is a token? ", tone="playful", max_words=30) == "Answer in a playful tone in at most 30 words.\nQuestion: What is a token?", "Got: " + repr(make_prompt("  What is a token? ", tone="playful", max_words=30))
assert make_prompt("Hi") == "Answer in a friendly tone in at most 100 words.\nQuestion: Hi", "Defaults should be friendly / 100"
try:
    make_prompt("   ")
    assert False, "make_prompt('   ') should raise ValueError"
except ValueError as e:
    assert "empty" in str(e), "The error message should mention 'empty'"
try:
    make_prompt("hi", "formal")
    assert False, "tone must be keyword-only (use * in the parameters)"
except TypeError:
    pass
assert parse_temperature("0.7") == 0.7 and parse_temperature(2) == 2.0, "parse_temperature should return floats"
for bad in [5, "-0.1", "2.5"]:
    try:
        parse_temperature(bad)
        assert False, f"parse_temperature({bad!r}) should raise ValueError"
    except ValueError as e:
        assert "between 0 and 2" in str(e), "Use the message 'temperature must be between 0 and 2'"
try:
    parse_temperature("hot")
    assert False, "Invalid text should raise ValueError"
except ValueError:
    pass
assert safe_temperatures(["0.7", "hot", 5, 1]) == ([0.7, 1.0], 2), "Got " + repr(safe_temperatures(["0.7", "hot", 5, 1]))
assert safe_temperatures([]) == ([], 0)
print("✅ All checks passed!")
`},
project:{title:"Settings prompt that never crashes",
desc:"Build a small command-line helper that asks for LLM settings (temperature, max output tokens, tone) and keeps asking politely until the input is valid, using your functions and try/except.",
steps:["Create <code>settings.py</code> and paste in <code>parse_temperature</code> and <code>make_prompt</code>.","Write <code>ask_until_valid(question, parser)</code>: a <code>while True</code> loop that calls <code>input()</code>, tries the parser, returns on success, and prints the error message and asks again on ValueError.","Add a parser for max tokens (a whole number from 1 to 8000).","Print the final settings and the prompt you would send. Try typing silly values to prove it never crashes."],
code:{python:py`# settings.py - run with:  python settings.py
def parse_temperature(value):
    t = float(value)
    if not 0 <= t <= 2:
        raise ValueError("temperature must be between 0 and 2")
    return t

def parse_max_tokens(value):
    n = int(value)
    if not 1 <= n <= 8000:
        raise ValueError("max tokens must be between 1 and 8000")
    return n

def ask_until_valid(question, parser):
    """Keep asking until parser(text) succeeds."""
    while True:
        text = input(question)
        try:
            return parser(text)
        except ValueError as e:
            print(f"  Sorry: {e}. Try again.")

temperature = ask_until_valid("Temperature (0-2): ", parse_temperature)
max_tokens = ask_until_valid("Max output tokens (1-8000): ", parse_max_tokens)
tone = input("Tone (e.g. friendly, formal): ").strip() or "friendly"

print(f"\nSettings: temperature={temperature}, max_tokens={max_tokens}, tone={tone!r}")
`}}
});
})();
