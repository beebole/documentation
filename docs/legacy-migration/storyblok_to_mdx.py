#!/usr/bin/env python3
"""
One-off migration: Storyblok "Website" space (118349) en/help/* legacy articles
-> Mintlify MDX under help/legacy/.

Faithful archive. Token is read from the SB_TOKEN env var and never written out.
Run from the repo root:  SB_TOKEN=... python3 docs/legacy-migration/storyblok_to_mdx.py
"""
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error

SPACE = "118349"
MAPI = f"https://mapi.storyblok.com/v1/spaces/{SPACE}"
TOKEN = os.environ.get("SB_TOKEN")
if not TOKEN:
    sys.exit("SB_TOKEN env var is required")

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_DIR = os.path.join(REPO, "help", "legacy")
IMG_ROOT = os.path.join(REPO, "help", "images", "legacy")

# In-scope slugs (relative to en/help/), in desired nav order. `docs` -> index.
ORDER = [
    "docs", "learn-the-basics", "entities", "organizing-people",
    "onboard-your-team", "timesheets", "time-clock", "time-off",
    "work-schedules", "reporting", "costs-billing-budgets", "settings",
    "integrations", "mobile-app", "api", "faq",
]

warnings = []


def api_get(url, tries=6):
    for i in range(tries):
        req = urllib.request.Request(url, headers={"Authorization": TOKEN})
        try:
            with urllib.request.urlopen(req) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 5 * (i + 1)
                print(f"  429, backing off {wait}s...", flush=True)
                time.sleep(wait)
                continue
            raise
    raise RuntimeError(f"giving up on {url}")


def list_help_stories():
    data = api_get(f"{MAPI}/stories/?starts_with=en/help&per_page=100")
    out = {}
    for s in data["stories"]:
        if s.get("is_folder"):
            continue
        slug = s["full_slug"].split("en/help/", 1)[-1].strip("/")
        out[slug] = s["id"]
    return out  # {slug: id}


# ---------- link rewriting ----------
def rewrite_link(href):
    if not href:
        return href
    # Match optional beebole.com (any subdomain) + optional language prefix + /help/
    m = re.match(
        r"^(?:https?://[a-z0-9.-]*beebole\.com)?/(?:(?:en|fr|es)/)?help/(.*)$",
        href, re.I,
    )
    if m:
        rest = m.group(1)
        if rest.startswith(("legacy/", "images/")):
            return "/help/" + rest
        path, _, anchor = rest.partition("#")
        path = path.rstrip("/")
        out = "/help/legacy/" + path if path else "/help/legacy"
        if anchor:
            out += "#" + anchor
        return out
    # Other root-relative links are commercial-website routes -> absolute URL.
    if href.startswith("/") and not href.startswith("//"):
        rest = re.sub(r"^/(?:en|fr|es)(?=/|$)", "", href)
        rest = re.sub(r"^/website(?=/|$)", "", rest)
        if not rest.startswith("/"):
            rest = "/" + rest
        return "https://beebole.com" + rest
    return href


# ---------- inline ----------
def esc(text):
    # escape MDX-breaking chars in plain text (not code)
    return text.replace("{", "\\{").replace("}", "\\}").replace("<", "\\<")


def apply_marks(text, marks):
    code = bold = italic = strike = False
    link = None
    for m in marks or []:
        t = m.get("type")
        if t == "code":
            code = True
        elif t == "bold":
            bold = True
        elif t == "italic":
            italic = True
        elif t in ("strike", "strikethrough"):
            strike = True
        elif t == "link":
            link = m.get("attrs", {})
    if code:
        text = f"`{text}`"
    if bold:
        text = f"**{text}**"
    if italic:
        text = f"*{text}*"
    if strike:
        text = f"~~{text}~~"
    if link is not None:
        href = link.get("href") or link.get("url") or ""
        anchor = link.get("anchor")
        if anchor and "#" not in href:
            href = f"{href}#{anchor}"
        href = rewrite_link(href)
        text = f"[{text}]({href})"
    return text


def render_inline(nodes, slug):
    parts = []
    for n in nodes or []:
        t = n.get("type")
        if t == "text":
            raw = n.get("text", "")
            marks = n.get("marks") or []
            is_code = any(m.get("type") == "code" for m in marks)
            txt = raw if is_code else esc(raw)
            parts.append(apply_marks(txt, marks))
        elif t == "hard_break":
            parts.append("  \n")
        elif t == "image":
            parts.append(render_image(n, slug, inline=True))
        else:
            warnings.append(f"[{slug}] unknown inline node: {t}")
            parts.append(render_inline(n.get("content"), slug))
    return "".join(parts)


# ---------- images ----------
downloaded = {}


def render_image(node, slug, inline=False):
    a = node.get("attrs", {}) or {}
    src = a.get("src") or ""
    alt = (a.get("alt") or a.get("title") or "").replace("\n", " ").strip()
    if not src:
        return ""
    fname = src.split("/")[-1].split("?")[0]
    fname = re.sub(r"[^A-Za-z0-9._-]", "-", fname) or "image"
    dest_dir = os.path.join(IMG_ROOT, slug)
    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, fname)
    if src not in downloaded:
        ok = False
        for attempt in range(4):
            try:
                req = urllib.request.Request(src, headers={"User-Agent": "legacy-migrate"})
                with urllib.request.urlopen(req) as r, open(dest, "wb") as f:
                    f.write(r.read())
                ok = True
                break
            except Exception as e:  # noqa
                last = e
                time.sleep(3 * (attempt + 1))
        if not ok:
            warnings.append(f"[{slug}] image download failed {src}: {last}")
        downloaded[src] = ok
    # The repo's commit hook optimizes PNG/JPG -> WebP, so reference the .webp
    # twin that will exist after optimization (keeps refs valid post-commit).
    ref_name = re.sub(r"\.(png|jpe?g)$", ".webp", fname, flags=re.I)
    ref = f"/help/images/legacy/{slug}/{ref_name}"
    if inline:
        return f"![{alt}]({ref})"
    return f"<Frame>\n  ![{alt}]({ref})\n</Frame>"


# ---------- blocks ----------
def render_list(node, slug, ordered, depth):
    lines = []
    items = node.get("content", []) or []
    for i, item in enumerate(items):
        marker = f"{i + 1}." if ordered else "-"
        sub = render_blocks(item.get("content", []), slug, depth + 1)
        sub_lines = sub.split("\n")
        indent = "  " * depth
        first = True
        for sl in sub_lines:
            if sl == "" and first:
                continue
            if first:
                lines.append(f"{indent}{marker} {sl}")
                first = False
            else:
                lines.append(f"{indent}  {sl}" if sl else "")
        if first:  # empty item
            lines.append(f"{indent}{marker} ")
    return "\n".join(lines)


def render_table(node, slug):
    rows = node.get("content", []) or []
    out = []
    header_done = False
    for r in rows:
        cells = r.get("content", []) or []
        texts = []
        for c in cells:
            texts.append(render_blocks(c.get("content", []), slug, 0).replace("\n", " ").strip())
        out.append("| " + " | ".join(texts) + " |")
        if not header_done:
            out.append("| " + " | ".join(["---"] * len(texts)) + " |")
            header_done = True
    return "\n".join(out)


def _multilink(ml):
    if not isinstance(ml, dict):
        return ""
    return ml.get("url") or ml.get("cached_url") or ""


def render_component_table(comp, slug):
    tbl = comp.get("table", {}) or {}
    rows = []
    thead = tbl.get("thead") or []
    if thead:
        rows.append([col.get("value", "") for col in thead])
    for r in tbl.get("tbody", []) or []:
        rows.append([col.get("value", "") for col in r.get("body", []) or []])
    if not rows:
        return ""
    out = ["| " + " | ".join(c.replace("\n", " ").strip() for c in rows[0]) + " |"]
    out.append("| " + " | ".join(["---"] * len(rows[0])) + " |")
    for r in rows[1:]:
        out.append("| " + " | ".join(c.replace("\n", " ").strip() for c in r) + " |")
    return "\n".join(out)


def render_embedded(body, slug):
    """Storyblok components embedded inline in richtext (`blok` nodes)."""
    out = []
    for comp in body:
        cn = comp.get("component")
        if cn == "component_video":
            url = comp.get("url", "")
            if url:
                out.append(f'<Frame>\n  <iframe src="{url}" allowFullScreen />\n</Frame>')
        elif cn == "component_article_cta":
            title = (comp.get("title") or "").replace('"', "'")
            desc = (comp.get("description") or "").strip()
            href = ""
            btns = comp.get("action_button") or []
            if btns:
                href = _multilink(btns[0].get("link_url"))
            href = rewrite_link(href)
            card = f'<Card title="{title}"'
            if href:
                card += f' href="{href}"'
            card += ">\n"
            if desc:
                card += f"  {esc(desc)}\n"
            card += "</Card>"
            out.append(card)
        elif cn == "component_table":
            out.append(render_component_table(comp, slug))
        else:
            warnings.append(f"[{slug}] unhandled embedded component: {cn}")
    return "\n\n".join(b for b in out if b)


def render_block(node, slug, depth=0):
    t = node.get("type")
    if t == "paragraph":
        return render_inline(node.get("content", []), slug)
    if t == "heading":
        lvl = max(1, min(6, node.get("attrs", {}).get("level", 2)))
        return "#" * lvl + " " + render_inline(node.get("content", []), slug)
    if t == "bullet_list":
        return render_list(node, slug, False, depth)
    if t == "ordered_list":
        return render_list(node, slug, True, depth)
    if t == "blockquote":
        inner = render_blocks(node.get("content", []), slug, depth)
        return "\n".join("> " + ln if ln else ">" for ln in inner.split("\n"))
    if t == "code_block":
        attrs = node.get("attrs", {}) or {}
        lang = (attrs.get("class") or "").replace("language-", "") or attrs.get("params") or ""
        code = "".join(c.get("text", "") for c in node.get("content", []) or [])
        code = code.strip("\n")  # drop source's trailing/leading blank lines
        if not lang:  # conservative highlight hint for obvious cases
            s = code.lstrip()
            if s[:1] in "{[":
                lang = "json"
            elif s.startswith(("curl", "$ curl", "wget", "http")):
                lang = "bash"
        return f"```{lang}\n{code}\n```"
    if t == "horizontal_rule":
        return "---"
    if t == "image":
        return render_image(node, slug, inline=False)
    if t == "table":
        return render_table(node, slug)
    if t in ("bullet_list_item", "list_item"):
        return render_blocks(node.get("content", []), slug, depth)
    if t == "blok":
        return render_embedded(node.get("attrs", {}).get("body", []) or [], slug)
    warnings.append(f"[{slug}] unknown block node: {t}")
    return render_inline(node.get("content"), slug)


def render_blocks(nodes, slug, depth=0):
    out = []
    for n in nodes or []:
        out.append(render_block(n, slug, depth))
    return "\n\n".join(b for b in out if b is not None)


def richtext_to_md(doc, slug):
    if not isinstance(doc, dict):
        return ""
    return render_blocks(doc.get("content", []), slug, 0)


# ---------- page ----------
def convert(slug, story_id):
    story = api_get(f"{MAPI}/stories/{story_id}")["story"]
    c = story["content"]
    title = c.get("title") or slug
    desc = (c.get("seo_description") or "").strip()
    body = c.get("body") or []
    sections = []
    for blok in body:
        heading = (blok.get("heading") or "").strip()
        md = richtext_to_md(blok.get("content"), slug)
        chunk = ""
        if heading:
            chunk += f"## {heading}\n\n"
        chunk += md
        sections.append(chunk.strip())
    md_body = "\n\n".join(s for s in sections if s).strip()
    return title, desc, md_body


def write_mdx(out_slug, title, desc, md_body, prepend=""):
    fm = ["---", f"title: {json.dumps(title)}"]
    if desc:
        fm.append(f"description: {json.dumps(desc)}")
    # Pages with a huge heading count produce an unwieldy "On this page" TOC;
    # wide mode hides it and reclaims the horizontal space (e.g. the API page).
    if len(re.findall(r"^#{2,4} ", md_body, re.M)) > 40:
        fm.append('mode: "wide"')
    fm.append("---")
    content = "\n".join(fm) + "\n\n" + prepend + md_body + "\n"
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, f"{out_slug}.mdx")
    with open(path, "w") as f:
        f.write(content)
    print(f"  wrote help/legacy/{out_slug}.mdx ({len(md_body)} chars)", flush=True)


NOTICE = (
    "<Note>\n"
    "  **Archived documentation.** This section documents Beebole's previous "
    "system and is no longer maintained. For current documentation, see the "
    "[Documentation](/help/index) tab.\n"
    "</Note>\n\n"
)

# The Storyblok `docs` story is a lorem-ipsum dev stub, so we build a clean
# landing page instead of converting it.
LANDING_INDEX = (
    "---\n"
    'title: "Legacy documentation"\n'
    'description: "Archived help center for Beebole\'s previous system, kept for reference."\n'
    "---\n\n"
    + NOTICE
    + "This is the archived help center for Beebole's previous system, preserved "
    "for reference. The content here is no longer actively maintained.\n\n"
    "<CardGroup cols={2}>\n"
    '  <Card title="Getting Started" href="/help/legacy/learn-the-basics">\n'
    "    Basics, entities, and how the previous system fit together.\n"
    "  </Card>\n"
    '  <Card title="People & onboarding" href="/help/legacy/organizing-people">\n'
    "    Organizing people and teams, and onboarding your team.\n"
    "  </Card>\n"
    '  <Card title="Time tracking" href="/help/legacy/timesheets">\n'
    "    Timesheets, time clock, time off, and work schedules.\n"
    "  </Card>\n"
    '  <Card title="Reporting & billing" href="/help/legacy/reporting">\n'
    "    Reports, plus costs, billing, and budgets.\n"
    "  </Card>\n"
    '  <Card title="Configuration & integrations" href="/help/legacy/settings">\n'
    "    Settings, integrations, the mobile app, and the API.\n"
    "  </Card>\n"
    '  <Card title="FAQ" href="/help/legacy/faq">\n'
    "    Frequently asked questions about the previous system.\n"
    "  </Card>\n"
    "</CardGroup>\n"
)


def main():
    print("Listing en/help stories...", flush=True)
    stories = list_help_stories()
    # Curated landing page (the `docs` story is a lorem-ipsum stub, skipped).
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, "index.mdx"), "w") as f:
        f.write(LANDING_INDEX)
    print("  wrote help/legacy/index.mdx (curated landing)", flush=True)

    for slug in ORDER:
        if slug == "docs":
            continue  # placeholder stub; replaced by curated index above
        if slug not in stories:
            warnings.append(f"expected story missing: {slug}")
            continue
        print(f"Converting {slug}...", flush=True)
        title, desc, md = convert(slug, stories[slug])
        write_mdx(slug, title, desc, md, "")
        time.sleep(2)  # throttle mapi
    print("\nDONE.")
    if warnings:
        print(f"\n{len(warnings)} warnings:")
        for w in warnings:
            print("  -", w)


if __name__ == "__main__":
    main()
