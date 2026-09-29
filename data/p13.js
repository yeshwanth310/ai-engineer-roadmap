(function(){
const W = window.ROADMAP.weeks; const py = String.raw;
/* ================= TOOLKIT P13 ================= */
W.push({
id:113, phase:0, title:"GitHub API: automate repos, issues & pull requests with Python",
skip:"you can call the GitHub REST API with a token, handle pagination and rate limits, and script issues and PRs with requests or PyGithub.",
goal:"Talk to GitHub from code instead of clicking around the website. Read repo data (stars, languages, commits, README), manage issues and pull requests, authenticate safely with a personal access token, and deal with pagination and rate limits. Then build a small automation: a weekly issue digest, an auto-labeller and a Gemini-written summary of open issues.",
plan:[["30m","Read & try"],["10m","Quiz"],["40m","Exercise"],["40m","Mini project"]],
analogy:"Think of GitHub as a huge library with a <b>service counter</b>. The website is you walking the shelves yourself. The <b>API</b> is handing a slip to the librarian: “details of repo X, please” or “file this note under issue 12”. Each counter window is an <b>endpoint</b>. Your <b>personal access token</b> is your library card: anyone can read the public shelves a little, but with a card you get more requests per hour and can write in your own books. Big answers come back in <b>pages</b> (“here are the first 30, ask for the next page”), and if you queue too often the librarian says “come back in an hour”. That's a <b>rate limit</b>.",
why:"Almost every AI engineering project lives on GitHub, and the API lets you automate the boring parts: triaging issues, labelling bugs, posting eval results on pull requests, collecting data about your repos. It's also a perfect first “real” API to practise on, because it's free and well documented. And it's the backbone of AI coding agents and bots: when an agent “opens a PR” or “comments on an issue”, it is calling exactly these endpoints.",
explain:`
<p><b>REST in GitHub terms.</b> The GitHub REST API lives at <code>https://api.github.com</code>. Each <b>endpoint</b> is an HTTP method plus a path. <code>GET /repos/{owner}/{repo}</code> reads a repo, and <code>POST /repos/{owner}/{repo}/issues</code> creates an issue. Answers come back as <b>JSON</b>, which becomes normal dicts and lists in Python (P7). Some endpoints you'll use all the time:</p>
<pre class="code">GET   /repos/{owner}/{repo}                      # repo info: stargazers_count, forks_count, default_branch...
GET   /repos/{owner}/{repo}/languages            # {"Python": 51234, "HTML": 2048} (bytes of code)
GET   /repos/{owner}/{repo}/commits?per_page=5   # latest commits
GET   /repos/{owner}/{repo}/readme               # README (content is base64-encoded)
GET   /repos/{owner}/{repo}/contents/{path}      # any file or folder
GET   /repos/{owner}/{repo}/issues?state=open    # issues AND pull requests (see below!)
POST  /repos/{owner}/{repo}/issues               # create: {"title": "...", "body": "...", "labels": ["bug"]}
POST  /repos/{owner}/{repo}/issues/{n}/comments  # comment on an issue OR a PR: {"body": "..."}
POST  /repos/{owner}/{repo}/issues/{n}/labels    # add labels: {"labels": ["bug"]}
PATCH /repos/{owner}/{repo}/issues/{n}           # edit / close: {"state": "closed"}
GET   /repos/{owner}/{repo}/pulls?state=open     # pull requests
GET   /repos/{owner}/{repo}/pulls/{n}/files      # files changed in a PR</pre>
<p><b>Gotcha:</b> to GitHub, every pull request is also an issue. So <code>/issues</code> returns PRs too. You can spot them because they have a <code>"pull_request"</code> key; plain issues don't. It's also why you comment on a PR's conversation through the <i>issues</i> comments endpoint.</p>
<p><b>Headers you should always send</b> (GitHub's docs recommend all three):</p>
<pre class="code">Accept: application/vnd.github+json
Authorization: Bearer YOUR_TOKEN            # leave out for anonymous, read-only calls
X-GitHub-Api-Version: 2026-03-10</pre>
<p>The API is versioned by date. Pinning the version means GitHub can't change a response under your feet. The current version is <code>2026-03-10</code>. If you send no version header, you get the older <code>2022-11-28</code>, which is supported until March 2028. One of the changes in 2026-03-10: <code>GET /rate_limit</code> no longer has a top-level <code>rate</code> field, so read <code>resources.core</code> instead.</p>
<p><b>Personal access tokens (PATs).</b> A PAT is a password-like string that lets a script act as you. Create one under GitHub → Settings → Developer settings → Personal access tokens.</p>
<ul>
<li><b>Fine-grained tokens</b> (recommended): one owner, only the repos you pick, individual permissions (e.g. <i>Issues: read and write</i>, <i>Pull requests: read</i>, <i>Contents: read</i>) and an expiry date.</li>
<li><b>Classic tokens</b> use broad “scopes” and can reach every repo you can. Only use one when a fine-grained token can't do the job.</li>
</ul>
<p>Give the <b>minimum</b> permissions and a short expiry. Store the token in an environment variable, conventionally <code>GITHUB_TOKEN</code>, via your <code>.env</code> file (P7), and <b>never commit it</b> (P11). GitHub's secret scanning will often catch a leaked token, but revoke it immediately if one leaks. On your own machine, <code>gh auth login</code> plus <code>gh auth token</code> avoids handling a PAT at all.</p>
<p><b>Rate limits.</b></p>
<ul>
<li>Without a token: <b>60 requests per hour</b>, counted per IP address.</li>
<li>With a PAT: <b>5,000 per hour</b>.</li>
<li>The built-in <code>GITHUB_TOKEN</code> inside GitHub Actions: 1,000 per hour per repository.</li>
</ul>
<p>Every response tells you where you stand: <code>x-ratelimit-limit</code>, <code>x-ratelimit-remaining</code> and <code>x-ratelimit-reset</code> (when the counter refills). Run out and you get <b>403 or 429</b>. Wait until the reset time, or for <code>retry-after</code> seconds if that header is present, rather than hammering the API. Checking <code>GET /rate_limit</code> doesn't count against your limit.</p>
<p><b>Pagination.</b> Lists come back in pages: 30 items by default, and <code>per_page=100</code> is the usual maximum. If there are more, the response has a <code>link</code> header like:</p>
<pre class="code">&lt;https://api.github.com/repositories/1300192/issues?page=2&gt;; rel="next", &lt;https://api.github.com/repositories/1300192/issues?page=5&gt;; rel="last"</pre>
<p>Keep requesting the <code>rel="next"</code> URL until there isn't one. In requests, <code>resp.links.get("next")</code> parses this for you. PyGithub and <code>gh api --paginate</code> do it automatically.</p>
<p><b>Three ways to call it:</b></p>
<ol>
<li><b>requests</b>: plain HTTP. You see everything, which makes it great for learning.</li>
<li><b>PyGithub</b> (<code>pip install PyGithub</code>): Python objects instead of URLs, e.g. <code>g.get_repo("owner/repo").get_issues(state="open")</code>, with pagination handled for you.</li>
<li><b>gh CLI</b> (P11): <code>gh issue list</code>, <code>gh pr view 5 --json files</code>, or raw <code>gh api repos/OWNER/REPO/issues --paginate</code> from the terminal.</li>
</ol>
<p><b>Next steps (just so you know they exist):</b></p>
<ul>
<li><b>GitHub Actions</b> can run your script on a schedule or on every new issue or PR. It hands the script a short-lived <code>GITHUB_TOKEN</code> automatically, so there's no PAT to manage.</li>
<li><b>Webhooks</b> flip the direction: GitHub calls <i>your</i> server's URL when something happens (issue opened, PR merged). That's how bots react instantly instead of polling.</li>
</ul>`,
concepts:[["Endpoint","A method + path the API offers, e.g. GET /repos/{owner}/{repo}/issues."],["Personal access token (PAT)","A password-like key for scripts. Prefer fine-grained, minimal permissions, an expiry, stored in GITHUB_TOKEN."],["API version header","X-GitHub-Api-Version: 2026-03-10 pins the response format so it can't change under you."],["Rate limit","60 requests/hour anonymous, 5,000/hour with a token. Watch x-ratelimit-remaining, back off on 403/429."],["Pagination","Results come in pages; follow the link header's rel=\"next\" URL until it's gone."],["Issues vs PRs","Every PR is also an issue: /issues returns both, and PRs carry a pull_request key."],["PyGithub","A Python library that wraps the API in objects and handles pagination for you."],["Webhook","GitHub calling your URL when an event happens, the reverse of you polling the API."]],
resources:[
 {t:"GitHub Docs: Getting started with the REST API",u:"https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api",type:"docs"},
 {t:"GitHub Docs: Managing your personal access tokens",u:"https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens",type:"docs"},
 {t:"GitHub Docs: Using pagination in the REST API",u:"https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api",type:"docs"},
 {t:"GitHub Docs: Rate limits for the REST API",u:"https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",type:"docs"},
 {t:"GitHub Docs: REST API endpoints for issues",u:"https://docs.github.com/en/rest/issues/issues",type:"docs"},
 {t:"GitHub Docs: API versions",u:"https://docs.github.com/en/rest/about-the-rest-api/api-versions",type:"docs"},
 {t:"PyGithub documentation (introduction & examples)",u:"https://pygithub.readthedocs.io/en/stable/introduction.html",type:"docs"}
],
quiz:[
 {q:"You call <code>GET /repos/{owner}/{repo}/issues</code> and some items have a <code>pull_request</code> key. Why?",o:["The API is broken","GitHub treats every pull request as an issue too, and that key marks the PRs","Those issues were closed","They are duplicates"],a:1,e:"Filter them out (or in) by checking for the pull_request key."},
 {q:"Which token setup follows GitHub's advice for a script that labels issues in one repo?",o:["A classic token with every scope, no expiry","A fine-grained token for just that repo with Issues read/write and an expiry, stored in GITHUB_TOKEN","Your GitHub password in the code","A token pasted into the README"],a:1,e:"Minimum access, short life, kept out of the code and out of git."},
 {q:"A list endpoint returns 30 items and a <code>link</code> header containing <code>rel=\"next\"</code>. What should your script do?",o:["Assume that's everything","Request the rel=\"next\" URL, and keep going until there's no next link","Retry the same URL","Increase the rate limit"],a:1,e:"That's pagination. You can also ask for per_page=100 to need fewer pages."},
 {q:"Your script gets HTTP 403 with <code>x-ratelimit-remaining: 0</code>. Best response?",o:["Retry in a tight loop","Wait until the time in x-ratelimit-reset (or retry-after), and authenticate if you weren't","Switch to another IP address","Delete the repo"],a:1,e:"Back off politely. A token raises the limit from 60 to 5,000 requests per hour."},
 {q:"What does the <code>X-GitHub-Api-Version</code> header do?",o:["Picks the Python version","Pins which dated version of the REST API answers, so responses don't change unexpectedly","Makes the request faster","It's required to read public repos"],a:1,e:"The current version is 2026-03-10. Without the header you get the older 2022-11-28 behaviour."}
],
exercise:{title:"Build a tiny, offline GitHub API toolkit",
task:`<p>No internet needed. You'll write the pieces every GitHub script needs and test them on sample data shaped exactly like the real API's.</p>
<ol>
<li><code>build_headers(token=None)</code> returns a dict with <code>"Accept": "application/vnd.github+json"</code> and <code>"X-GitHub-Api-Version": API_VERSION</code>. If a token is given (strip spaces first) and isn't empty, also add <code>"Authorization": "Bearer &lt;token&gt;"</code>. With no token, there must be <b>no</b> Authorization key.</li>
<li><code>repo_url(owner, repo, *parts, **params)</code> builds a URL like <code>https://api.github.com/repos/octocat/Hello-World/issues?state=open&amp;per_page=100</code>. Extra parts are joined with <code>/</code> (numbers allowed, e.g. <code>"pulls", 5, "files"</code>). Leave out the <code>?</code> part when there are no params. Tip: <code>urllib.parse.urlencode(params)</code>.</li>
<li><code>only_issues(items)</code> returns just the real issues. Drop any item whose <code>"pull_request"</code> key is present and not None.</li>
<li><code>next_link(link_header)</code> returns the URL marked <code>rel="next"</code>, or <code>None</code> if there isn't one (or the header is None or empty).</li>
<li><code>fetch_all(get, url)</code>: <code>get(url)</code> returns <code>(items, headers)</code>, where headers is a dict with lowercase keys. Collect the items from every page by following <code>next_link(headers.get("link"))</code>, and stop after 50 pages as a safety net.</li>
<li><code>auto_labels(issue, rules)</code>: <code>rules</code> maps a label to a list of keywords. Return a <b>sorted</b> list of labels whose keywords appear (case-insensitive) in the issue's title or body. The body may be None. Skip labels the issue already has; <code>issue["labels"]</code> is a list of dicts with a <code>"name"</code> key.</li>
</ol>`,
starter:py`from urllib.parse import urlencode

API = "https://api.github.com"
API_VERSION = "2026-03-10"


def build_headers(token=None):
    return {}  # TODO


def repo_url(owner, repo, *parts, **params):
    return API  # TODO


def only_issues(items):
    return items  # TODO: drop pull requests


def next_link(link_header):
    return None  # TODO


def fetch_all(get, url):
    items, headers = get(url)
    return items  # TODO: follow the pages


def auto_labels(issue, rules):
    return []  # TODO


sample = [
    {"number": 1, "title": "Crash when prompt is empty", "body": "Traceback ...", "labels": []},
    {"number": 2, "title": "Add streaming", "body": None, "labels": [], "pull_request": {"url": "..."}},
]
print(build_headers("ghp_example"))
print(repo_url("octocat", "Hello-World", "issues", state="open", per_page=100))
print([i["number"] for i in only_issues(sample)])
`,
solution:py`from urllib.parse import urlencode

API = "https://api.github.com"
API_VERSION = "2026-03-10"


def build_headers(token=None):
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": API_VERSION,
    }
    if token and token.strip():
        headers["Authorization"] = f"Bearer {token.strip()}"
    return headers


def repo_url(owner, repo, *parts, **params):
    path = "/".join([API, "repos", owner, repo] + [str(p) for p in parts])
    if params:
        path += "?" + urlencode(params)
    return path


def only_issues(items):
    return [it for it in items if it.get("pull_request") is None]


def next_link(link_header):
    if not link_header:
        return None
    for part in link_header.split(","):
        section = part.split(";")
        if len(section) < 2:
            continue
        url = section[0].strip().strip("<>")
        if any(s.strip() == 'rel="next"' for s in section[1:]):
            return url
    return None


def fetch_all(get, url):
    everything = []
    pages = 0
    while url and pages < 50:
        items, headers = get(url)
        everything.extend(items)
        url = next_link(headers.get("link"))
        pages += 1
    return everything


def auto_labels(issue, rules):
    text = f"{issue.get('title') or ''} {issue.get('body') or ''}".lower()
    have = {label["name"] for label in issue.get("labels", [])}
    found = {label for label, words in rules.items()
             if label not in have and any(w.lower() in text for w in words)}
    return sorted(found)


sample = [
    {"number": 1, "title": "Crash when prompt is empty", "body": "Traceback ...", "labels": []},
    {"number": 2, "title": "Add streaming", "body": None, "labels": [], "pull_request": {"url": "..."}},
]
print(build_headers("ghp_example"))
print(repo_url("octocat", "Hello-World", "issues", state="open", per_page=100))
print([i["number"] for i in only_issues(sample)])
`,
tests:py`h = build_headers("  ghp_abc123  ")
assert h.get("Accept") == "application/vnd.github+json", "build_headers: Accept must be application/vnd.github+json"
assert h.get("X-GitHub-Api-Version") == "2026-03-10", "build_headers: add X-GitHub-Api-Version = API_VERSION"
assert h.get("Authorization") == "Bearer ghp_abc123", "build_headers: Authorization should be 'Bearer <token>' with spaces stripped, got " + repr(h.get("Authorization"))
for empty in (None, "", "   "):
    assert "Authorization" not in build_headers(empty), f"build_headers({empty!r}) must not include an Authorization header"
assert len(build_headers()) == 2, "Anonymous headers should have exactly Accept and X-GitHub-Api-Version"

assert repo_url("octocat", "Hello-World") == "https://api.github.com/repos/octocat/Hello-World", "repo_url with no parts: " + repr(repo_url("octocat", "Hello-World"))
assert repo_url("octocat", "Hello-World", "issues", state="open", per_page=100) == "https://api.github.com/repos/octocat/Hello-World/issues?state=open&per_page=100", "repo_url with params: " + repr(repo_url("octocat", "Hello-World", "issues", state="open", per_page=100))
assert repo_url("o", "r", "pulls", 5, "files") == "https://api.github.com/repos/o/r/pulls/5/files", "repo_url must accept numbers in parts"
assert "?" not in repo_url("o", "r", "languages"), "No '?' when there are no params"

items = [
    {"number": 10, "title": "Bug: timeout", "labels": []},
    {"number": 11, "title": "Fix timeout", "labels": [], "pull_request": {"url": "https://api.github.com/repos/o/r/pulls/11"}},
    {"number": 12, "title": "Docs", "labels": [], "pull_request": None},
    {"number": 13, "title": "Idea", "labels": []},
]
assert [i["number"] for i in only_issues(items)] == [10, 12, 13], "only_issues should drop items with a pull_request value (keep order): " + repr([i["number"] for i in only_issues(items)])

L = '<https://api.github.com/repositories/1300192/issues?page=2>; rel="prev", <https://api.github.com/repositories/1300192/issues?page=4>; rel="next", <https://api.github.com/repositories/1300192/issues?page=515>; rel="last", <https://api.github.com/repositories/1300192/issues?page=1>; rel="first"'
assert next_link(L) == "https://api.github.com/repositories/1300192/issues?page=4", "next_link: pick the rel=\"next\" URL, got " + repr(next_link(L))
assert next_link('<https://api.github.com/x?page=1>; rel="first", <https://api.github.com/x?page=2>; rel="prev"') is None, "next_link: no rel=\"next\" means None"
assert next_link(None) is None and next_link("") is None, "next_link: missing header means None"

pages = {
    "u1": ([1, 2], {"link": '<u2>; rel="next", <u3>; rel="last"'}),
    "u2": ([3, 4], {"link": '<u1>; rel="prev", <u3>; rel="next"'}),
    "u3": ([5], {"link": '<u2>; rel="prev", <u1>; rel="first"'}),
}
calls = []
def fake_get(url):
    calls.append(url)
    return pages[url]
assert fetch_all(fake_get, "u1") == [1, 2, 3, 4, 5], "fetch_all should collect items from all 3 pages"
assert calls == ["u1", "u2", "u3"], "fetch_all should request each page once, in order: " + repr(calls)
assert fetch_all(lambda u: ([9], {}), "only") == [9], "fetch_all: a response without a link header is the last page"
loop_calls = []
def looping(u):
    loop_calls.append(u)
    return ([0], {"link": '<again>; rel="next"'})
assert len(fetch_all(looping, "start")) == 50 and len(loop_calls) == 50, "fetch_all: stop after 50 pages as a safety net"

rules = {"bug": ["crash", "error", "traceback"], "docs": ["readme", "typo"], "rag": ["embedding", "retrieval"]}
issue = {"title": "CRASH in retrieval step", "body": "Traceback: KeyError", "labels": []}
assert auto_labels(issue, rules) == ["bug", "rag"], "auto_labels should match case-insensitively and return sorted labels: " + repr(auto_labels(issue, rules))
assert auto_labels({"title": "Typo in README", "body": None, "labels": [{"name": "docs"}]}, rules) == [], "auto_labels: body may be None, and skip labels the issue already has"
assert auto_labels({"title": "Question", "body": "How do I start?", "labels": []}, rules) == [], "auto_labels: no keyword means no labels"
print("✅ All checks passed!")
`},
project:{title:"Issue assistant: digest, auto-labeller & Gemini summary",
desc:"Point a script at one of your repos (or a public one like <code>PyGithub/PyGithub</code> for read-only practice). It prints repo stats, builds a digest of issues opened in the last 7 days (PRs filtered out), suggests or applies labels by keyword, and asks Gemini for a short summary of what users are asking for. The same job is shown with requests, PyGithub and the gh CLI.",
steps:["Create a <b>fine-grained PAT</b> for one test repo with <i>Issues: read and write</i> and <i>Pull requests: read</i>, and a short expiry. Put <code>GITHUB_TOKEN=...</code> in <code>.env</code> (already in .gitignore) next to your <code>GEMINI_API_KEY</code>.","Run the read-only part first: repo stats, languages, the last 5 commits, and the issue digest. Print <code>x-ratelimit-remaining</code> to see your budget.","Run the auto-labeller with <code>DRY_RUN = True</code>, check its suggestions, then switch to False on <b>your own</b> test repo and watch the labels appear.","Send the digest to Gemini and ask for a 5-bullet summary of themes and the top 3 things to fix. Optionally post it as an issue comment.","Stretch: run it weekly with GitHub Actions (<code>on: schedule</code>, using the built-in <code>GITHUB_TOKEN</code>), and read about webhooks for reacting instantly."],
code:{requests:py`# pip install requests python-dotenv google-genai
import os
from datetime import datetime, timedelta, timezone

import requests
from dotenv import load_dotenv
from google import genai

load_dotenv()
OWNER, REPO = "your-username", "your-test-repo"
DRY_RUN = True
API = "https://api.github.com"
HEADERS = {
    "Accept": "application/vnd.github+json",
    "Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}",
    "X-GitHub-Api-Version": "2026-03-10",
}
session = requests.Session()
session.headers.update(HEADERS)


def get_all(url, **params):
    """Follow the link header's rel="next" until the last page."""
    params.setdefault("per_page", 100)
    items = []
    while url:
        r = session.get(url, params=params, timeout=30)
        if r.status_code in (403, 429) and r.headers.get("x-ratelimit-remaining") == "0":
            raise SystemExit(f"Rate limited until {r.headers.get('x-ratelimit-reset')} (epoch seconds)")
        r.raise_for_status()
        items.extend(r.json())
        url = r.links.get("next", {}).get("url")
        params = None  # the next URL already contains the query string
    return items


# 1) Repo facts
repo = session.get(f"{API}/repos/{OWNER}/{REPO}", timeout=30).json()
langs = session.get(f"{API}/repos/{OWNER}/{REPO}/languages", timeout=30).json()
commits = session.get(f"{API}/repos/{OWNER}/{REPO}/commits", params={"per_page": 5}, timeout=30).json()
print(f"{repo['full_name']}: {repo['stargazers_count']} stars, languages: {', '.join(langs)}")
for c in commits:
    print("  -", c["sha"][:7], c["commit"]["message"].splitlines()[0])

# 2) Weekly digest (issues only - PRs have a 'pull_request' key)
since = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
items = get_all(f"{API}/repos/{OWNER}/{REPO}/issues", state="open", since=since)
issues = [i for i in items if "pull_request" not in i]
digest = "\n".join(f"#{i['number']} {i['title']}: {(i['body'] or '')[:200]}" for i in issues)
print(f"\n{len(issues)} open issues updated this week\n{digest}")

# 3) Auto-label by keyword
RULES = {"bug": ["crash", "error", "traceback"], "docs": ["readme", "typo"], "question": ["how do i", "?"]}
for i in issues:
    text = f"{i['title']} {i['body'] or ''}".lower()
    have = {l["name"] for l in i["labels"]}
    new = sorted(l for l, words in RULES.items() if l not in have and any(w in text for w in words))
    if new:
        print(f"#{i['number']} -> {new}")
        if not DRY_RUN:
            session.post(f"{API}/repos/{OWNER}/{REPO}/issues/{i['number']}/labels",
                         json={"labels": new}, timeout=30).raise_for_status()

# 4) Ask Gemini for a summary
if issues:
    client = genai.Client()  # reads GEMINI_API_KEY
    resp = client.models.generate_content(
        model="gemini-flash-latest",
        contents="Summarise these GitHub issues in 5 bullets (themes), then list the top 3 things to fix:\n" + digest,
    )
    print("\nGemini summary:\n" + resp.text)
    # To post it: session.post(f"{API}/repos/{OWNER}/{REPO}/issues/NUMBER/comments", json={"body": resp.text})

print("Requests left this hour:", session.get(f"{API}/rate_limit", timeout=30).json()["resources"]["core"]["remaining"])
`,
pygithub:py`# pip install PyGithub python-dotenv google-genai
import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from github import Auth, Github
from google import genai

load_dotenv()
DRY_RUN = True
g = Github(auth=Auth.Token(os.environ["GITHUB_TOKEN"]))  # optional: api_version="2026-03-10" on recent releases
repo = g.get_repo("your-username/your-test-repo")

# 1) Repo facts
print(f"{repo.full_name}: {repo.stargazers_count} stars, languages: {', '.join(repo.get_languages())}")
for c in repo.get_commits()[:5]:
    print("  -", c.sha[:7], c.commit.message.splitlines()[0])
print("README starts:", repo.get_readme().decoded_content.decode()[:80])

# 2) Weekly digest - pagination is automatic; PRs have issue.pull_request set
since = datetime.now(timezone.utc) - timedelta(days=7)
issues = [i for i in repo.get_issues(state="open", since=since) if i.pull_request is None]
digest = "\n".join(f"#{i.number} {i.title}: {(i.body or '')[:200]}" for i in issues)
print(f"\n{len(issues)} open issues updated this week\n{digest}")

# 3) Auto-label by keyword
RULES = {"bug": ["crash", "error", "traceback"], "docs": ["readme", "typo"]}
for i in issues:
    text = f"{i.title} {i.body or ''}".lower()
    have = {l.name for l in i.labels}
    new = sorted(l for l, words in RULES.items() if l not in have and any(w in text for w in words))
    if new:
        print(f"#{i.number} -> {new}")
        if not DRY_RUN:
            i.add_to_labels(*new)

# Other everyday calls:
# issue = repo.create_issue(title="Eval score dropped", body="See run 42", labels=["bug"])
# issue.create_comment("Looking into it")
# issue.edit(state="closed")
# for pr in repo.get_pulls(state="open"):
#     print(pr.number, pr.title, [f.filename for f in pr.get_files()])
#     pr.create_issue_comment("Eval score: 0.88 (+0.04)")

# 4) Ask Gemini for a summary
if issues:
    resp = genai.Client().models.generate_content(
        model="gemini-flash-latest",
        contents="Summarise these GitHub issues in 5 bullets, then the top 3 things to fix:\n" + digest,
    )
    print("\nGemini summary:\n" + resp.text)

print("Requests left (remaining, limit):", g.rate_limiting)
g.close()
`,
gh:py`# gh CLI (after: gh auth login) - works in bash and PowerShell
gh api repos/OWNER/REPO --jq '.full_name, .stargazers_count'
gh api repos/OWNER/REPO/languages
gh api "repos/OWNER/REPO/commits?per_page=5" --jq '.[].commit.message'
gh api repos/OWNER/REPO/issues --paginate --jq '.[] | select(.pull_request == null) | "#\(.number) \(.title)"'
gh issue list --state open --limit 50
gh issue create --title "Eval score dropped" --body "See run 42" --label bug
gh issue comment 12 --body "Looking into it"
gh issue edit 12 --add-label docs
gh issue close 12
gh pr list --state open
gh pr view 5 --json files --jq '.files[].path'
gh pr comment 5 --body "Eval score: 0.88 (+0.04)"
gh api rate_limit --jq '.resources.core'

# Raw curl (bash). Token comes from the environment, never typed into the script.
curl -s -H "Accept: application/vnd.github+json" \
     -H "Authorization: Bearer $GITHUB_TOKEN" \
     -H "X-GitHub-Api-Version: 2026-03-10" \
     "https://api.github.com/repos/OWNER/REPO/issues?state=open&per_page=100" \
  | jq -r '.[] | select(.pull_request == null) | "#\(.number) \(.title)"'

# Add labels / close an issue with curl
curl -s -X POST -H "Authorization: Bearer $GITHUB_TOKEN" -H "X-GitHub-Api-Version: 2026-03-10" \
     https://api.github.com/repos/OWNER/REPO/issues/12/labels -d '{"labels":["bug"]}'
curl -s -X PATCH -H "Authorization: Bearer $GITHUB_TOKEN" -H "X-GitHub-Api-Version: 2026-03-10" \
     https://api.github.com/repos/OWNER/REPO/issues/12 -d '{"state":"closed"}'
`}}
});
})();
