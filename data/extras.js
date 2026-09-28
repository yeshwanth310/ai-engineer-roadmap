/* Extra plain-English sections appended to some early weeks (merged by js/app.js). */
(function(){
const P = window.ROADMAP.patches = window.ROADMAP.patches || {};
function add(id, html){ P[id] = P[id] || {}; P[id].explainMore = (P[id].explainMore || "") + html; }

add(1, `
<h3>A closer look at sampling: temperature and top-p</h3>
<p>At every step the model produces a <b>ranked shortlist of possible next tokens</b>, each with a likelihood — think of a weather forecast: “the” 40%, “a” 25%, “my” 10%, … Picking from this list is called <b>sampling</b>.</p>
<ul>
<li><b>Temperature</b> reshapes the odds. Near 0, the favourite nearly always wins (good for extraction, classification, code). Higher (e.g. 1.0) gives underdogs a fair chance (good for brainstorming, stories).</li>
<li><b>Top-p</b> (“nucleus sampling”) trims the shortlist: with top-p 0.9 the model only considers the smallest group of tokens that together cover 90% of the likelihood, so wild long-shots are thrown out. <b>Top-k</b> does something similar with a fixed count (“only the top 40”).</li>
<li>Rule of thumb: <b>change one knob, not both</b>, and leave defaults alone unless you have a reason. Even at temperature 0, answers can still vary slightly between calls, so never rely on identical output.</li>
</ul>
<h3>Why models “hallucinate”</h3>
<p>The model is trained to produce <i>plausible</i> text, not to check facts. If it doesn't know a book's author, the most plausible-sounding continuation is still <i>a</i> name — so it confidently gives one. It's like a student who'd rather guess than leave an answer blank. The cures you'll learn: give it the facts (RAG, Phase 4), let it call tools for live data (Phase 3), explicitly allow “I don't know”, and check outputs (Phase 7).</p>`);

add(6, `
<h3>Latency: why some calls feel slow</h3>
<p><b>Latency</b> is how long the user waits. Two numbers matter: <b>time to first token</b> (how long before anything appears) and <b>total time</b>. The model writes its answer one token at a time, so <b>long answers take longer</b> — output length usually matters more than input length. Bigger “smarter” models and “thinking/reasoning” modes are slower and pricier; small “flash/mini” models are fast and cheap. Quick wins: ask for shorter answers (and set a max output length), stream the reply (Week 5), and use the smallest model that passes your tests. You'll measure all of this properly in Week 23.</p>`);

add(13, `
<h3>In a bit more detail</h3>
<p><b>Keyword search</b> usually means an algorithm called <b>BM25</b> — a smarter version of “count matching words” that gives extra weight to rare words (a match on “E-4012” matters more than a match on “the”). <b>Semantic search</b> uses embeddings (Week 10). Each misses things the other catches, which is why hybrid search wins so often.</p>
<p>A <b>re-ranker</b> is a model that reads the question and one candidate chunk <i>together</i> and scores how well the chunk answers it. That's more accurate than comparing two separate embeddings, but slower — so you only re-rank a small shortlist. Hosted re-rankers exist (for example from Cohere and Voyage AI), or you can simply ask an LLM to pick the most relevant chunks.</p>`);
})();
(function(){
const P = window.ROADMAP.patches;
function add(id, html){ P[id] = P[id] || {}; P[id].explainMore = (P[id].explainMore || "") + html; }
add(5, `
<h3>How streaming works, in everyday terms</h3>
<p>Without streaming, you place an order and wait at the counter until the whole meal is ready. With streaming, dishes arrive one by one as they're cooked. Technically the connection stays open and the provider sends small <b>events</b> (“here are the next few words”) until a final “done” event that also carries the token usage. Your code just loops over the events and prints each piece.</p>
<ul>
<li><b>Stream</b> when a person is watching the screen (chatbots, assistants).</li>
<li><b>Don't bother</b> for background jobs, or when you need the complete answer before doing anything (e.g. you're going to parse JSON from it).</li>
<li>Remember to <b>collect the pieces</b> as they arrive so you can save the full reply into the history for the next turn.</li>
</ul>`);
add(12, `
<h3>When a RAG answer is wrong: a quick debugging checklist</h3>
<ol>
<li><b>Was the right chunk retrieved?</b> Print the retrieved chunks. If the answer isn't in them, it's a <i>retrieval</i> problem: try better chunking, more results (bigger top-k), hybrid search or re-ranking (Week 13).</li>
<li><b>Was it retrieved but ignored?</b> Then it's a <i>prompt</i> problem: make the grounding instructions stricter, put the most relevant chunks first, and label them clearly.</li>
<li><b>Did the model add facts that aren't in the sources?</b> Remind it to answer only from the sources and say “I don't know” otherwise. You'll learn to measure this automatically (“faithfulness”) in Week 22.</li>
</ol>
<p>This “retrieval first, then generation” way of thinking will save you hours.</p>`);
})();
(function(){
const P = window.ROADMAP.patches;
P[22] = P[22] || {};
P[22].explainMore = (P[22].explainMore || "") + `
<h3>Evaluating a RAG app: three simple questions</h3>
<ul>
<li><b>Retrieval hit rate</b>: for each test question, did the chunk that holds the answer show up in the top-k results? This is plain code, with no LLM needed.</li>
<li><b>Faithfulness (groundedness)</b>: is every claim in the answer supported by the retrieved sources? LLM-as-judge works well here. Give the judge the sources and the answer, and ask it to list any unsupported claims.</li>
<li><b>Answer relevance</b>: did it actually answer the question that was asked, or just say something true and nearby?</li>
</ul>
<p>Score these separately. That way, when quality drops, you know whether to fix the search step or the prompt, just like the debugging checklist in Week 12.</p>`;
})();
