(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
/* ================= TOOLKIT P2 ================= */
W.push({
id:102, phase:0, title:"Lists, dictionaries & control flow (if, for, while)",
skip:"you can loop over a list of dictionaries, count things with a dict, and write if/elif/else without looking anything up.",
goal:"Store many values in lists and dictionaries, and make your program decide (if) and repeat (for, while). A chat history is just a list of dictionaries, so after this week you'll be able to read and reshape it.",
plan:[["30m","Read & try"],["10m","Quiz"],["45m","Exercise"],["35m","Mini project"]],
analogy:"A <b>list</b> is a numbered queue: first, second, third, in order. A <b>dictionary</b> is a coat-check desk: you hand over a ticket (the key, e.g. \"role\") and get back exactly one coat (the value, e.g. \"user\"). <b>if</b> is a fork in the road. <b>for</b> is “do this for every item on the conveyor belt”, and <b>while</b> is “keep going until the light turns red”.",
why:"LLM APIs speak in lists and dictionaries: a conversation is a list of <code>{\"role\": ..., \"content\": ...}</code> dictionaries, and tool calls, JSON replies and search results all look like this too. Loops and ifs are how you filter, count, trim and route them.",
explain:`
<p><b>Lists</b> hold items in order: <code>models = ["flash", "pro", "mini"]</code>.</p>
<ul>
<li>Positions start at <b>0</b>: <code>models[0]</code> is "flash", and <code>models[-1]</code> is the last item.</li>
<li><code>models.append("nano")</code> adds to the end. <code>len(models)</code> counts the items, and <code>"pro" in models</code> checks membership.</li>
<li>Slicing works like it does for strings: <code>history[-4:]</code> gives the last four messages.</li>
</ul>
<p><b>Dictionaries</b> (“dicts”) map keys to values: <code>msg = {"role": "user", "content": "Hi"}</code>.</p>
<ul>
<li>Read a value with <code>msg["role"]</code>. If the key might be missing, use <code>msg.get("name", "anonymous")</code>, which returns the default instead of crashing.</li>
<li>Set a value with <code>msg["content"] = "Hello"</code>. Loop over pairs with <code>for key, value in msg.items():</code>.</li>
<li>A classic counting pattern: <code>counts[word] = counts.get(word, 0) + 1</code>.</li>
</ul>
<p>Two more containers: a <b>tuple</b> <code>("gpt", 0.3)</code> is like a list that can't change, which is handy for fixed pairs. A <b>set</b> <code>{"a", "b"}</code> keeps only unique items, so it's good for removing duplicates.</p>
<p><b>if / elif / else</b> choose a path. <b>Indentation (4 spaces) is part of the syntax</b>: it shows which lines belong to the if.</p>
<pre class="code">if tokens > 100_000:
    print("too long, trim it")
elif tokens > 10_000:
    print("fine, but pricey")
else:
    print("cheap")</pre>
<p><b>for</b> loops walk through items: <code>for msg in history: print(msg["role"])</code>. Use <code>range(5)</code> for 0 to 4, and <code>enumerate(items)</code> when you need the position too. <b>while</b> loops repeat as long as a condition is true, which suits retries (“try again while it fails, up to 3 times”). <code>break</code> leaves a loop early and <code>continue</code> skips to the next item.</p>
<p><b>Truthiness:</b> empty things (<code>""</code>, <code>[]</code>, <code>{}</code>, <code>0</code>, <code>None</code>) count as False in an <code>if</code>. So <code>if not history:</code> means “if the history is empty”. <code>None</code> is Python's “nothing here” value.</p>`,
concepts:[["List","An ordered collection: items[0] is the first item and items[-1] the last."],["Dictionary","Key → value lookups, like {\"role\": \"user\"}. Use .get() when a key may be missing."],["Tuple / set","A tuple is a fixed sequence; a set holds unique items with no order."],["if / elif / else","Choose which block of code runs. Indentation marks the block."],["for / while","for repeats once per item; while repeats until a condition becomes false."],["None & truthiness","None means ‘no value’. Empty values count as False in conditions."]],
resources:[
 {t:"The Python Tutorial: Data structures (lists, dicts, sets, tuples)",u:"https://docs.python.org/3/tutorial/datastructures.html",type:"docs"},
 {t:"The Python Tutorial: More control flow tools",u:"https://docs.python.org/3/tutorial/controlflow.html",type:"docs"},
 {t:"Real Python: Dictionaries in Python",u:"https://realpython.com/python-dicts/",type:"article"},
 {t:"Python for Everybody: loops, lists and dictionaries chapters",u:"https://www.py4e.com/lessons",type:"course"}
],
quiz:[
 {q:"<code>history = [\"a\", \"b\", \"c\"]</code>. What is <code>history[-1]</code>?",o:["\"a\"","\"c\"","An error","-1"],a:1,e:"Negative positions count from the end, so -1 is the last item."},
 {q:"<code>msg = {\"role\": \"user\"}</code>. What does <code>msg.get(\"name\", \"anon\")</code> return?",o:["An error (KeyError)","None","\"anon\"","\"user\""],a:2,e:".get returns the default when the key is missing, whereas msg[\"name\"] would crash with a KeyError."},
 {q:"What tells Python which lines belong inside an <code>if</code>?",o:["Curly braces","The indentation","A semicolon","The word end"],a:1,e:"Python uses indentation (normally 4 spaces) to group code into blocks."},
 {q:"Which is best for “keep retrying until it works, at most 3 times”?",o:["A while loop with a counter (or for + break)","A set","A tuple","An f-string"],a:0,e:"Repeat-until-condition is exactly what while (or a for loop with break) is for."},
 {q:"<code>if not results:</code> runs when results is…",o:["A non-empty list","An empty list","Any list","Only None"],a:1,e:"Empty containers (and None) count as False, so not results is True when the list is empty."}
],
exercise:{title:"Work with a chat history",
task:`<p>A chat history is a list of dicts like <code>{"role": "user", "content": "Hi"}</code>. Implement:</p>
<ul>
<li><code>count_roles(messages)</code>: return a dict counting each role, e.g. <code>{"system": 1, "user": 2, "assistant": 1}</code>.</li>
<li><code>last_user_message(messages)</code>: return the <b>content</b> of the most recent message with role "user", or <code>None</code> if there isn't one.</li>
<li><code>fit_budget(messages, max_chars)</code>: keep the <b>newest</b> messages whose contents add up to at most <code>max_chars</code> characters. Walk backwards from the end and stop at the first message that doesn't fit. Return them in the <b>original order</b>.</li>
</ul>`,
starter:py`def count_roles(messages):
    counts = {}
    # TODO: loop over messages and count each message["role"]
    return counts


def last_user_message(messages):
    # TODO: walk backwards (reversed(messages)) and return the first user content
    return None


def fit_budget(messages, max_chars):
    kept = []
    # TODO: walk from newest to oldest, stop when the next one doesn't fit
    return kept


history = [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "Hi!"},
    {"role": "assistant", "content": "Hello! How can I help?"},
    {"role": "user", "content": "Explain tokens."},
]
print(count_roles(history))
print(last_user_message(history))
print(fit_budget(history, 40))
`,
solution:py`def count_roles(messages):
    counts = {}
    for m in messages:
        counts[m["role"]] = counts.get(m["role"], 0) + 1
    return counts


def last_user_message(messages):
    for m in reversed(messages):
        if m["role"] == "user":
            return m["content"]
    return None


def fit_budget(messages, max_chars):
    kept = []
    total = 0
    for m in reversed(messages):
        size = len(m["content"])
        if total + size > max_chars:
            break
        kept.append(m)
        total += size
    kept.reverse()
    return kept


history = [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "Hi!"},
    {"role": "assistant", "content": "Hello! How can I help?"},
    {"role": "user", "content": "Explain tokens."},
]
print(count_roles(history))
print(last_user_message(history))
print(fit_budget(history, 40))
`,
tests:py`H = [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "Hi!"},
    {"role": "assistant", "content": "Hello! How can I help?"},
    {"role": "user", "content": "Explain tokens."},
]
assert count_roles(H) == {"system": 1, "user": 2, "assistant": 1}, "count_roles gave " + repr(count_roles(H))
assert count_roles([]) == {}, "An empty history should give an empty dict"
assert last_user_message(H) == "Explain tokens.", "Should return the newest user content"
assert last_user_message(H[:1]) is None, "No user message should return None"
assert last_user_message(H[:3]) == "Hi!", "Should look backwards past the assistant message"
r = fit_budget(H, 39)
assert r == H[2:], "With 39 chars only the last two fit (22 + 15 = 37; adding 'Hi!' would make 40). Got " + repr(r)
assert fit_budget(H, 40) == H[1:], "With 40 chars the last three fit exactly (3 + 22 + 15)"
assert fit_budget(H, 10) == [], "If even the newest message doesn't fit, return []"
assert fit_budget(H, 1000) == H, "Everything fits and the order must be preserved"
print("✅ All checks passed!")
`},
project:{title:"Chat history inspector",
desc:"Save a (fake) conversation as a list of dictionaries and write a script that prints a short report: messages per role, the longest message, the last question, and what would survive a character budget.",
steps:["Create <code>inspect_chat.py</code> with a <code>history</code> list of 6 to 8 messages (system, user and assistant).","Paste in your three functions from the exercise.","Print a report using loops and f-strings: counts per role, the longest message and its length, and the last user question.","Try different budgets in a for loop (<code>for budget in [50, 100, 200]:</code>) and print how many messages are kept each time."],
code:{python:py`# inspect_chat.py - run with:  python inspect_chat.py
history = [
    {"role": "system", "content": "You are a friendly Python tutor."},
    {"role": "user", "content": "What is a list?"},
    {"role": "assistant", "content": "An ordered collection of items, like a queue."},
    {"role": "user", "content": "And a dictionary?"},
    {"role": "assistant", "content": "Key-value lookups, like a coat-check desk."},
    {"role": "user", "content": "Which should I use for a chat history?"},
]

# ... paste count_roles, last_user_message and fit_budget here ...

print("Messages per role:")
for role, n in count_roles(history).items():
    print(f"  {role:<10} {n}")

longest = history[0]
for m in history:
    if len(m["content"]) > len(longest["content"]):
        longest = m
print(f"Longest ({len(longest['content'])} chars, {longest['role']}): {longest['content']}")
print("Last question:", last_user_message(history))

for budget in [50, 100, 200]:
    kept = fit_budget(history, budget)
    print(f"Budget {budget:>3} chars -> keeps {len(kept)} of {len(history)} messages")
`}}
});
})();
