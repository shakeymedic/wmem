#!/usr/bin/env python3
"""Builds a readable HTML page for each newsletter issue from its PDF.

Run it by hand (or from the newsletter pipeline) after an issue is added to updates.js:

    python3 -m pip install pdfplumber        # once
    python3 -I scripts/build-issue-pages.py                  # every issue without a page yet
    python3 -I scripts/build-issue-pages.py --drive-id <id>  # one issue
    python3 -I scripts/build-issue-pages.py --all            # rebuild every page

It downloads each PDF from Google Drive (the driveId in updates.js), pulls the text out in the
order it was written, and writes newsletters/<series>/<slug>.html. Then it adds `htmlPath` to the
issue in updates.js and the page to sitemap.xml. The pages are plain static HTML and are committed;
Netlify does not run this script.

The text is copied from the PDF word for word. Nothing is summarised or reworded. Headings, lists,
tables and links are rebuilt from the layout, so they can differ a little from the PDF; each page
says so and links to the PDF. An issue whose text does not come out cleanly is skipped and listed.

Needs: python3, pdfplumber, node (to read updates.js), and pdftotext (poppler-utils) for the check.
"""
import argparse
import collections
import html
import json
import re
import statistics
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://emevidence.org"
SERIES_DIR = {"em": "em", "phem": "phem", "anaes": "anaes", "trauma": "trauma", "quarterly": "quarterly"}
MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
LONG_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
               "September", "October", "November", "December"]
BULLETS = "•·›→▸▶▪◦●○■□✓✔➤►"
MIN_CHARS = 0.998   # letters and digits on the page must match the PDF this closely
MIN_NGRAMS = 0.97   # share of the PDF's text that must read in the same order


# ─────────────────────────────────────────────────────────────
# updates.js
# ─────────────────────────────────────────────────────────────
def load_updates():
    """Reads the updates array (and each entry's series) by running updates.js in node."""
    js = r"""
const fs = require("fs"), vm = require("vm");
const src = fs.readFileSync(process.argv[1], "utf8");
const ctx = { document: { readyState: "complete", addEventListener() {}, getElementById() { return null; } } };
vm.runInNewContext(src + "\nthis.updates = updates; this.seriesOf = seriesOf;", ctx);
const out = ctx.updates.map(e => ({
  ...e,
  links: e.links.map(l => ({ ...l, series: ctx.seriesOf({ label: l.title, links: [l] }) })),
  series: ctx.seriesOf(e)
}));
process.stdout.write(JSON.stringify(out));
"""
    r = subprocess.run(["node", "-e", js, str(ROOT / "updates.js")], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def parse_date(s):
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})$", s)
    if m:
        return int(m[1]), int(m[2]), int(m[3])
    m = re.match(r"^(\d{1,2}) ([A-Za-z]{3})[A-Za-z]* (\d{4})$", s)
    if not m:
        raise ValueError(f"Unreadable date {s!r}")
    return int(m[3]), MONTHS.index(m[2].lower()) + 1, int(m[1])


def plan_pages(updates):
    """One page per PDF. Slugs: issue-N when updates.js names the issue number, otherwise the
    issue date; quarterlies are YYYY-qN-<series>. A clash (e.g. an earlier version of the same
    issue) gets the date added. Newest entries come first, so the final version keeps the short name."""
    used = set()
    pages = []
    for ei, entry in enumerate(updates):
        y, mo, d = parse_date(entry["date"])
        iso = f"{y:04d}-{mo:02d}-{d:02d}"
        single = len(entry["links"]) == 1
        for li, link in enumerate(entry["links"]):
            series = link["series"]["key"] if not single else entry["series"]["key"]
            series_name = link["series"]["name"] if not single else entry["series"]["name"]
            title = re.sub(r"\.pdf$", "", link["title"], flags=re.I)
            text = title + (" " + entry["label"] if single else "")
            if series == "quarterly":
                q = re.search(r"\bQ([1-4])\s*(\d{4})", text) or re.search(r"\bQ([1-4])\b.*?(\d{4})", text)
                sub = "phem" if re.search(r"\bphem\b", text, re.I) else "anaes" if re.search(r"anaesth", text, re.I) else "em"
                slug = f"{q[2]}-q{q[1]}-{sub}" if q else f"{iso}-{sub}"
            else:
                n = re.search(r"\bIssue (\d+)\b", title) or (single and re.search(r"\bIssue (\d+)\b", entry["label"]))
                slug = f"issue-{n[1]}" if n else iso
            path = f"/newsletters/{SERIES_DIR[series]}/{slug}.html"
            if path in used:
                path = f"/newsletters/{SERIES_DIR[series]}/{slug}-{iso}.html"
            used.add(path)
            pages.append({
                "entry_index": ei, "link_index": li, "single": single, "path": path,
                "title": title, "label": entry["label"], "date": entry["date"], "iso": iso,
                "display_date": f"{d} {LONG_MONTHS[mo - 1]} {y}",
                "series": series, "series_name": series_name,
                "drive_id": link["driveId"], "audio_id": link.get("audioId"),
                "existing": (entry.get("htmlPath") if single else link.get("htmlPath")),
            })
    return pages


def set_html_paths(done):
    """Adds htmlPath to each issue in updates.js: on the entry when it has one PDF, on the link when
    an entry holds several. Edits the text in place so comments and layout are kept."""
    src = (ROOT / "updates.js").read_text()
    for p in done:
        did = re.escape(p["drive_id"])
        if p["single"]:
            # the entry object that contains this driveId: put htmlPath after its label line
            m = re.search(r'(\n(\s*)label: "[^"\n]*",\n)((?:(?!\n\s*\{\s*\n\s*date:)[\s\S])*?driveId: "' + did + '")', src)
            if not m:
                raise SystemExit(f"Could not find the entry for {p['drive_id']} in updates.js")
            block = m[3]
            if re.search(r"(^|\n)[ \t]*htmlPath:", block):
                block = re.sub(r'htmlPath: "[^"]*"', f'htmlPath: "{p["path"]}"', block, count=1)
                src = src[:m.start(3)] + block + src[m.end(3):]
            else:
                src = src[:m.end(1)] + f'{m[2]}htmlPath: "{p["path"]}",\n' + src[m.end(1):]
        else:
            m = re.search(r'(\{ title: "[^"\n]*", driveId: "' + did + r'"(?:, audioId: "[^"]*")?)(?:, htmlPath: "[^"]*")?( \})', src)
            if not m:
                raise SystemExit(f"Could not find the link for {p['drive_id']} in updates.js")
            src = src[:m.start()] + m[1] + f', htmlPath: "{p["path"]}"' + m[2] + src[m.end():]
            # an entry that has gained a second PDF keeps its pages on the links, not the entry
            starts = [x.start() for x in re.finditer(r"\{\s*\n\s*date:", src[:m.start()])]
            if starts:
                head = src[starts[-1]:m.start()]
                cleaned = re.sub(r'\n[ \t]*htmlPath: "[^"\n]*",', "", head)
                src = src[:starts[-1]] + cleaned + src[m.start():]
    (ROOT / "updates.js").write_text(src)


def update_sitemap(paths):
    f = ROOT / "sitemap.xml"
    src = f.read_text()
    add = [p for p in sorted(paths) if f"<loc>{SITE}{p}</loc>" not in src]
    if add:
        urls = "".join(f"  <url>\n    <loc>{SITE}{p}</loc>\n  </url>\n" for p in add)
        src = src.replace("</urlset>", urls + "</urlset>")
        f.write_text(src)


# ─────────────────────────────────────────────────────────────
# Download
# ─────────────────────────────────────────────────────────────
def fetch_pdf(drive_id, cache):
    out = cache / f"{drive_id}.pdf"
    if out.exists() and out.read_bytes()[:5] == b"%PDF-":
        return out
    url = f"https://drive.google.com/uc?export=download&id={drive_id}"
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                data = r.read()
            if data[:5] != b"%PDF-":
                # big files get a "can't scan for viruses" page with a confirm form
                m = re.search(rb'action="([^"]+)"', data)
                if m:
                    form = html.unescape(m[1].decode())
                    fields = dict(re.findall(r'name="([^"]+)" value="([^"]*)"', data.decode("utf8", "replace")))
                    q = "&".join(f"{k}={urllib.request.quote(v)}" for k, v in fields.items())
                    with urllib.request.urlopen(f"{form}?{q}", timeout=120) as r:
                        data = r.read()
            if data[:5] != b"%PDF-":
                raise RuntimeError("Drive did not return a PDF (is the file shared publicly?)")
            out.write_bytes(data)
            return out
        except Exception as e:  # network blips: retry with backoff
            if attempt == 3:
                raise RuntimeError(f"Download failed for {drive_id}: {e}")
            time.sleep(2 ** (attempt + 1))


# ─────────────────────────────────────────────────────────────
# Extraction
# WeasyPrint writes text in document order, so the order of characters in the PDF is the order
# the issue was written in. We keep that order and rebuild lines, blocks, rows and tables from
# the positions.
# ─────────────────────────────────────────────────────────────
class G:
    """One glyph."""
    __slots__ = ("t", "x0", "x1", "top", "bottom", "size", "bold", "italic", "href", "tag", "space_before")

    def __init__(self, c, href, tag):
        self.t = c["text"]
        self.x0, self.x1, self.top, self.bottom = c["x0"], c["x1"], c["top"], c["bottom"]
        self.size = round(c["size"], 1)
        fn = c.get("fontname", "")
        self.bold = bool(re.search(r"bold|black|heavy|semibold|demi", fn, re.I))
        self.italic = bool(re.search(r"italic|oblique", fn, re.I))
        self.href = href
        self.tag = tag
        self.space_before = False


class Frag:
    """Part of a line: glyphs on one baseline with no wide gap."""

    def __init__(self, g, page):
        self.gs = [g]
        self.page = page
        self.x0, self.x1, self.top, self.bottom = g.x0, g.x1, g.top, g.bottom
        self.marker = None  # list marker drawn apart from the text ("•", "3.")
        self.marker_glyphs = 0

    def add(self, g):
        self.gs.append(g)
        self.x1 = max(self.x1, g.x1)
        self.top = min(self.top, g.top)
        self.bottom = max(self.bottom, g.bottom)

    @property
    def size(self):
        # tags are set smaller; they don't decide the size of the line they sit on
        gs = [g for g in self.gs if not g.tag] or self.gs
        return collections.Counter(g.size for g in gs).most_common(1)[0][0]

    @property
    def text(self):
        return "".join((" " if g.space_before else "") + g.t for g in self.gs)


class Block:
    def __init__(self, f):
        self.frags = [f]
        self.page = f.page
        self.x0, self.x1, self.top, self.bottom = f.x0, f.x1, f.top, f.bottom
        self.pitch = None

    def add(self, f):
        if self.pitch is None:
            self.pitch = f.top - self.frags[-1].top
        self.frags.append(f)
        self.x1 = max(self.x1, f.x1)
        self.bottom = max(self.bottom, f.bottom)

    @property
    def glyphs(self):
        return [g for f in self.frags for g in f.gs]

    @property
    def size(self):
        gs = [g for g in self.glyphs if not g.tag] or self.glyphs
        return collections.Counter(g.size for g in gs).most_common(1)[0][0]

    @property
    def text(self):
        return join_frags([f.text for f in self.frags])


def join_frags(texts):
    out = ""
    for t in texts:
        if not out:
            out = t
        elif needs_no_space(out, t):
            out += t
        else:
            out += " " + t
    return out


def needs_no_space(prev, nxt):
    """Line breaks after a hyphen, slash or en dash inside a word carry no space."""
    if not prev or not nxt or prev.endswith(" ") or nxt.startswith(" "):
        return True
    return len(prev) >= 2 and prev[-1] in "-/–" and prev[-2] != " "


def is_white(color):
    if color is None:
        return True
    if isinstance(color, (int, float)):
        return color >= 0.97
    try:
        vals = list(color)
    except TypeError:
        return True
    if len(vals) == 1:
        return vals[0] >= 0.97
    if len(vals) == 3:
        return min(vals) >= 0.97
    if len(vals) == 4:  # CMYK
        return max(vals) <= 0.03
    return True


def page_glyphs(page):
    annots = []
    for a in page.annots or []:
        uri = a.get("uri")
        if isinstance(uri, bytes):
            uri = uri.decode("latin-1")
        if uri and re.match(r"^(https?:|mailto:)", uri.strip(), re.I):
            annots.append((a["x0"], a["top"], a["x1"], a["bottom"], uri.strip()))
    # small filled boxes behind short labels ("LEAD", "RCT") mark tags
    tag_rects = []
    for r in page.rects:
        h = r["bottom"] - r["top"]
        w = r["x1"] - r["x0"]
        if r.get("fill") and not is_white(r.get("non_stroking_color")) and 4 < h < 17 and w < 260:
            tag_rects.append((r["x0"] - 0.5, r["top"] - 0.5, r["x1"] + 0.5, r["bottom"] + 0.5))
    gs = []
    for c in page.chars:
        if not c.get("upright", True):
            continue
        t = c["text"]
        if t == "":
            continue
        cx, cy = (c["x0"] + c["x1"]) / 2, (c["top"] + c["bottom"]) / 2
        href = next((u for (x0, y0, x1, y1, u) in annots if x0 - 0.5 <= cx <= x1 + 0.5 and y0 - 0.5 <= cy <= y1 + 0.5), None)
        # which tag box the glyph sits in (numbered from 1), so neighbouring tags stay apart
        tag = next((k + 1 for k, (x0, y0, x1, y1) in enumerate(tag_rects)
                    if x0 <= c["x0"] and c["x1"] <= x1 and y0 <= c["top"] and c["bottom"] <= y1), 0)
        gs.append(G(c, href, tag))
    return gs


def build_frags(gs, pageno):
    """Splits the glyph stream into line fragments and decides where the spaces go."""
    frags = []
    cur = None
    pending = False
    for g in gs:
        if g.t.isspace() or g.t == "\u00ad":  # soft hyphen: invisible, dropped
            pending = pending or g.t.isspace()
            continue
        if cur is not None:
            last = cur.gs[-1]
            h = min(g.bottom - g.top, last.bottom - last.top) or 1
            overlap = min(g.bottom, last.bottom) - max(g.top, last.top)
            gap = g.x0 - last.x1
            # a gap with no space character in it is a new cell, unless a tag's padding explains it
            if pending:
                split = 2.0 * max(g.size, last.size)
            elif g.tag or last.tag:
                split = max(2.0 * max(g.size, last.size), 12)
            elif g.t in ",.;:)]%" or last.t in "([":
                split = 2.0 * max(g.size, last.size)  # punctuation belongs to the text before it
            else:
                split = 0.8 * max(g.size, last.size)
            if overlap > 0.35 * h and -max(1.5, 0.3 * g.size) < gap < split:
                g.space_before = pending
                cur.add(g)
                pending = False
                continue
            frags.append(cur)
        cur = Frag(g, pageno)
        pending = False
    if cur is not None:
        frags.append(cur)
    for f in frags:
        place_spaces(f)
    return attach_markers(frags)


MARKER = re.compile(r"^(?:[•·▪◦●○■□‣⁃›▸➤►✓✔]|\d{1,3}[.)]|[a-z][.)]|[–-])$")
SYMBOL_MARKER = re.compile(r"^[•·▪◦●○■□‣⁃›▸➤►✓✔]$")


def attach_markers(frags):
    """WeasyPrint draws list bullets and numbers after the rest of the page. Each one is moved
    back onto the line it belongs to (the text just to its right), so the list keeps its order."""
    drop = set()
    for i, f in enumerate(frags):
        t = f.text.strip()
        if not MARKER.match(t):
            continue
        h = f.bottom - f.top

        def fits(g):
            return g is not f and g.marker is None and not MARKER.match(g.text.strip()) \
                and min(g.bottom, f.bottom) - max(g.top, f.top) > 0.3 * min(h, g.bottom - g.top) \
                and -0.5 <= g.x0 - f.x1 <= 30

        # out of order (drawn later): any marker; in order: only bullet symbols
        cands = [g for g in frags[:i] if fits(g)]
        if not cands and SYMBOL_MARKER.match(t):
            cands = [g for g in frags[i + 1:i + 4] if fits(g)]
        if cands:
            g = min(cands, key=lambda g: (abs(g.top - f.top), g.x0 - f.x1))
            g.marker = t
            g.marker_glyphs = len(f.gs)
            drop.add(i)
    return [f for i, f in enumerate(frags) if i not in drop]


def place_spaces(f):
    """Adds a space where glyphs sit apart with no space character between them (tags next to
    text), without breaking up letter-spaced capitals."""
    gaps = collections.defaultdict(list)
    for a, b in zip(f.gs, f.gs[1:]):
        if not b.space_before and (a.size, a.bold) == (b.size, b.bold):
            gaps[(a.size, a.bold)].append(b.x0 - a.x1)
    ls = {k: (statistics.median(v) if len(v) >= 3 else 0.0) for k, v in gaps.items()}
    for a, b in zip(f.gs, f.gs[1:]):
        if b.space_before or b.t in ",.;:)]%" or a.t in "([":
            continue
        gap = b.x0 - a.x1
        if (a.size, a.bold) == (b.size, b.bold):
            base = max(ls.get((a.size, a.bold), 0.0), 0.0)
            if gap > base + 0.25 * a.size and gap > 1.2:
                b.space_before = True
        else:
            base = max(ls.get((a.size, a.bold), 0.0), ls.get((b.size, b.bold), 0.0), 0.0)
            if gap > base + 0.2 * min(a.size, b.size) and gap > 1.2:
                b.space_before = True
        if a.tag != b.tag and gap > 1.0:
            b.space_before = True


def starts_bullet(f):
    return f.marker is not None or f.gs[0].t in BULLETS


def ordered_marker(b):
    m = b.frags[0].marker
    return m if m and re.match(r"^\d+[.)]$", m) else None


def all_tags(f):
    return all(g.tag for g in f.gs)


def late_to_front(frags):
    """A box or table carried over from the previous page can be drawn after other content on
    the page. Lines that sit above everything drawn before them on the page go first."""
    front, rest = [], []
    top = float("inf")
    i = 0
    while i < len(frags):
        if rest and frags[i].bottom <= top + 2:
            j = i
            while j < len(frags) and frags[j].bottom <= top + 2:
                j += 1
            front.extend(frags[i:j])
            i = j
            continue
        rest.append(frags[i])
        top = min(top, frags[i].top)
        i += 1
    out = front + rest
    # and the reverse: a page footer drawn before the boxes above it goes last
    if len(out) > 2:
        span = max(f.bottom for f in out) - min(f.top for f in out)
        for i in range(len(out) - 2, -1, -1):
            f, nxt = out[i], out[i + 1]
            later = out[i + 1:]
            if f.top - nxt.top > 0.4 * span and nxt.x0 < f.x1 and max(g.bottom for g in later) <= f.top + 2:
                out = out[:i] + later + [f]
    return out


def build_blocks(frags):
    blocks = []
    cur = None
    for f in frags:
        if cur is not None:
            last = cur.frags[-1]
            new = False
            if f.page != cur.page:
                new = True
            elif f.top < last.top - 2 or (f.top < last.bottom - 2 and f.x0 > last.x1):
                new = True  # moved up or sideways: next column or cell
            elif abs(f.size - cur.frags[0].size) > 0.6 or abs(f.size - last.size) > 0.6:
                new = True
            elif starts_bullet(f) or all_tags(f) or all_tags(last):
                new = True
            else:
                pitch = f.top - last.top
                limit = (cur.pitch * 1.3) if cur.pitch else 2.1 * max(f.size, last.size)
                if pitch > limit + 0.5:
                    new = True
                elif abs(f.x0 - cur.x0) > 4 and abs(center(f) - center(last)) > 3:
                    # hanging indent after a bullet is still the same item
                    first = cur.frags[0]
                    hang = starts_bullet(first) and len(first.gs) > 1 and abs(f.x0 - first.gs[1].x0) <= 4
                    if not hang:
                        new = True
            if not new:
                cur.add(f)
                continue
            blocks.append(cur)
        cur = Block(f)
    if cur is not None:
        blocks.append(cur)
    return blocks


def center(x):
    return (x.x0 + x.x1) / 2


def group_rows(blocks):
    """Finds blocks laid out side by side (table cells, columns, stat boxes). Returns a list of
    ("block", b) and ("row", [[cell blocks], ...]) in document order."""
    items = []
    pending = []
    row = None  # {"page", "bottom", "cells"}

    def flush_pending():
        for x in pending:
            items.append(("block", x))
        pending.clear()

    for b in blocks:
        if row is not None:
            cell = row["cells"][-1]
            cx0 = min(x.x0 for x in cell)
            cx1 = max(x.x1 for x in cell)
            same_page = b.page == row["page"]
            if same_page and b.x0 >= cx1 - 2 and b.top < row["bottom"] - 2:
                row["cells"].append([b])  # next cell to the right
            elif same_page and b.top >= cell[-1].bottom - 2 and (
                    abs(b.x0 - cx0) <= 6 or abs(center(b) - (cx0 + cx1) / 2) <= 10
                    or (min(b.x1, cx1) - max(b.x0, cx0) >= 0.5 * min(b.x1 - b.x0, cx1 - cx0)
                        and b.x0 >= max(x.x1 for x in row["cells"][-2]) - 2)):
                cell.append(b)  # further down the same cell
            elif same_page and b.top < row["bottom"] - 2:
                cell.append(b)  # anything else inside the row stays in reading order
            else:
                items.append(("row", row["cells"]))
                row = None
            if row is not None:
                row["bottom"] = max(row["bottom"], b.bottom)
                continue
        if pending and b.page == pending[-1].page:
            prev = pending[-1]
            if b.top < prev.bottom - 2 and b.x0 >= prev.x1 - 2:
                # b starts beside what came before it: the blocks just before it, to its left
                # and starting near its top, are the first cell of a row
                k = len(pending)
                while k > 0 and pending[k - 1].page == b.page and pending[k - 1].x1 <= b.x0 + 2 \
                        and pending[k - 1].top >= b.top - 12:
                    k -= 1
                first = pending[k:]
                if first and min(x.top for x in first) <= b.bottom and max(x.bottom for x in first) >= b.top:
                    del pending[k:]
                    flush_pending()
                    row = {"page": b.page, "cells": [first, [b]], "bottom": max(x.bottom for x in first + [b])}
                    continue
        pending.append(b)
    if row is not None:
        items.append(("row", row["cells"]))
    flush_pending()
    return items


def columns_match(cols, row, tol=6):
    xs = [c[0].x0 for c in row]
    return all(any(abs(x - c) <= tol for c in cols) for x in xs)


def build_tables(items):
    """Two or more rows whose cells line up become a table."""
    out = []
    i = 0
    while i < len(items):
        kind, val = items[i]
        if kind == "row":
            cols = [c[0].x0 for c in val]
            j = i + 1
            rows = [val]
            while j < len(items) and items[j][0] == "row" and len(items[j][1]) >= 2 and columns_match(cols, items[j][1]):
                rows.append(items[j][1])
                j += 1
            if len(rows) >= 2 and len(cols) >= 2:
                out.append(("table", {"cols": cols, "rows": rows}))
                i = j
                continue
        out.append(items[i])
        i += 1
    # a table that runs onto the next page continues as the same table
    merged = []
    for it in out:
        if merged and it[0] == "table" and merged[-1][0] == "table":
            a, b = merged[-1][1], it[1]
            if len(a["cols"]) == len(b["cols"]) and all(abs(x - y) <= 6 for x, y in zip(a["cols"], b["cols"])) \
                    and b["rows"][0][0][0].page == a["rows"][-1][0][0].page + 1:
                rows = b["rows"]
                if row_text(rows[0]) == row_text(a["rows"][0]):
                    rows = rows[1:]  # repeated header
                a["rows"].extend(rows)
                continue
        if merged and it[0] == "row" and merged[-1][0] == "table":
            a = merged[-1][1]
            if len(it[1]) >= 2 and columns_match(a["cols"], it[1]) and it[1][0][0].page == a["rows"][-1][0][0].page + 1:
                a["rows"].append(it[1])
                continue
        merged.append(it)
    return merged


def row_text(row):
    return [" ".join(b.text for b in cell) for cell in row]


# ─────────────────────────────────────────────────────────────
# Rendering
# ─────────────────────────────────────────────────────────────
def esc(s):
    return html.escape(s, quote=True)


def inline_html(block, plain=False, nobold=False):
    """Text of a block with bold, italic, links and tags kept."""
    seq = []  # (text, key) per glyph, with joining spaces as their own items (key None)
    for fi, f in enumerate(block.frags):
        for gi, g in enumerate(f.gs):
            if gi == 0 and fi > 0:
                if not needs_no_space(block.frags[fi - 1].text, f.text):
                    seq.append((" ", None))
            elif g.space_before:
                seq.append((" ", None))
            seq.append((g.t, (False, False, None, 0) if plain else (g.bold and not nobold, g.italic, g.href, g.tag)))
    # a space takes the style of its neighbours when they share it, otherwise it is plain
    # (but stays inside a link that continues on both sides)
    keyed = []
    for i, (t, k) in enumerate(seq):
        if k is None:
            left = next((seq[j][1] for j in range(i - 1, -1, -1) if seq[j][1] is not None), None)
            right = next((seq[j][1] for j in range(i + 1, len(seq)) if seq[j][1] is not None), None)
            if left == right and left is not None:
                k = left
            else:
                href = left[2] if left and right and left[2] == right[2] else None
                k = (False, False, href, 0)
        keyed.append((t, k))
    runs = []
    for t, k in keyed:
        if runs and runs[-1][1] == k:
            runs[-1][0].append(t)
        else:
            runs.append([[t], k])
    out = []
    i = 0
    while i < len(runs):
        href = runs[i][1][2]
        j = i
        while j < len(runs) and runs[j][1][2] == href:
            j += 1
        inner = "".join(style_run("".join(r[0]), r[1]) for r in runs[i:j])
        if href:
            out.append(f'<a href="{esc(href)}" rel="noopener">{inner.strip()}</a>' if inner.strip() else inner)
        else:
            out.append(inner)
        i = j
    s = "".join(out).strip()
    s = re.sub(r"</strong>(\s*)<strong>", r"\1", s)
    s = re.sub(r"</em>(\s*)<em>", r"\1", s)
    return re.sub(r"\s{2,}", " ", s)


def style_run(text, key):
    bold, italic, _href, tag = key
    t = html.escape(text, quote=False)
    if not text.strip():
        return t
    lead = t[:len(t) - len(t.lstrip())]
    trail = t[len(t.rstrip()):]
    core = t.strip()
    if tag:
        core = f'<span class="issue-tag">{core}</span>'
    else:
        if italic:
            core = f"<em>{core}</em>"
        if bold:
            core = f"<strong>{core}</strong>"
    return lead + core + trail


def classify(block, body):
    gs = [g for g in block.glyphs if not g.t.isspace()]
    text = block.text.strip()
    letters = [c for c in text if c.isalpha()]
    if all(g.tag for g in gs):
        return "tags"
    if starts_bullet(block.frags[0]):
        return "li"
    non_tag = [g for g in gs if not g.tag]
    allbold = non_tag and all(g.bold for g in non_tag)
    size = block.size
    if allbold and len(text) <= 180 and len(block.frags) <= 4 and len(letters) >= 3:
        caps = all(not c.islower() for c in letters)
        if caps and len(letters) >= 4:
            return "h2"
        if size >= body * 1.08:
            return "h3"
        if not text.endswith((".", ",", ";")) and len(text) <= 120:
            return "h4"
    return "p"


def render_block(block, body, kind=None):
    kind = kind or classify(block, body)
    if kind == "tags":
        return "p", f'<p class="issue-tags">{inline_html(block)}</p>'
    if kind == "li" and block.frags[0].marker:
        return "li", inline_html(block)
    if kind == "li":
        # drop the bullet glyph
        f0 = block.frags[0]
        bullet = f0.gs[0]
        f0.gs = f0.gs[1:]
        if f0.gs:
            f0.gs[0].space_before = False
        inner = inline_html(block) if any(f.gs for f in block.frags) else ""
        f0.gs.insert(0, bullet)
        return "li", inner
    if kind in ("h2", "h3", "h4"):
        return kind, f"<{kind}>{inline_html(block, nobold=True)}</{kind}>"
    return "p", f"<p>{inline_html(block)}</p>"


class Lists:
    """Collects consecutive list items into <ul> or <ol>."""

    def __init__(self, out):
        self.out = out
        self.kind = None
        self.next = None

    def item(self, block, html_inner):
        num = ordered_marker(block)
        kind = "ol" if num else "ul"
        n = int(re.match(r"\d+", num)[0]) if num else None
        if self.kind != kind or (kind == "ol" and n != self.next and n == 1):
            self.close()
            self.out.append(f"<{kind}>")
            self.kind = kind
        if kind == "ol":
            self.out.append(f'<li value="{n}">{html_inner}</li>')
            self.next = n + 1
        else:
            self.out.append(f"<li>{html_inner}</li>")

    def close(self):
        if self.kind:
            self.out.append(f"</{self.kind}>")
        self.kind = None
        self.next = None


def render_items(items, body):
    out = []
    lists = Lists(out)
    for kind, val in items:
        if kind == "block":
            k, h = render_block(val, body)
            if k == "li":
                lists.item(val, h)
                continue
            lists.close()
            out.append(h)
            continue
        lists.close()
        if kind == "table":
            out.append(render_table(val, body))
        elif kind == "row":
            out.append(render_row(val, body))
    lists.close()
    return "\n".join(out)


def cell_html(cell, body, plain=False):
    if plain:
        return " ".join(inline_html(b, plain=True) for b in cell)
    parts = []
    lists = Lists(parts)
    for b in cell:
        k, h = render_block(b, body, kind="li" if starts_bullet(b.frags[0]) else ("tags" if is_tags(b) else "p"))
        if k == "li":
            lists.item(b, h)
            continue
        lists.close()
        parts.append(h)
    lists.close()
    if len(parts) == 1 and parts[0].startswith("<p>"):
        return parts[0][3:-4]
    return "".join(parts)


def render_table(t, body):
    cols = t["cols"]
    rows = t["rows"]
    cells_flat = [c for r in rows for c in r]
    if all(len(c) == 1 and starts_bullet(c[0].frags[0]) for c in cells_flat):
        # a grid of bullet points (e.g. "What's inside") is a list, in the order it was written
        return render_items([("block", c[0]) for c in cells_flat], body)
    head = None
    first = rows[0]
    if all(all(g.bold for b in cell for g in b.glyphs if not g.t.isspace() and not g.tag) for cell in first) and len(first) == len(cols):
        head, rows = first, rows[1:]
    h = ['<div class="issue-table-wrap"><table class="issue-table">']
    if head:
        h.append("<thead><tr>" + "".join(f'<th scope="col">{cell_html(c, body, plain=True)}</th>' for c in head) + "</tr></thead>")
    h.append("<tbody>")
    for r in rows:
        cells = [""] * len(cols)
        for c in r:
            idx = min(range(len(cols)), key=lambda k: abs(cols[k] - c[0].x0))
            cells[idx] = (cells[idx] + " " if cells[idx] else "") + cell_html(c, body)
        h.append("<tr>" + "".join(f"<td>{c}</td>" for c in cells) + "</tr>")
    h.append("</tbody></table></div>")
    return "".join(h)


def is_tags(b):
    return all(g.tag for g in b.glyphs if not g.t.isspace())


def render_row(cells, body):
    """Side-by-side boxes that are not a table. A row of tags stays one line; stat boxes (a big
    figure over a small label) become a list; a bold name beside its description becomes one
    paragraph; anything else (columns) is read one cell after the other."""
    if all(is_tags(b) for c in cells for b in c):
        return '<p class="issue-tags">' + " ".join(inline_html(b) for c in cells for b in c) + "</p>"
    small = all(len(c) <= 3 and sum(len(b.text.split()) for b in c) <= 30 for c in cells)
    statlike = small and all(len(c) == 1 or c[0].size > max(b.size for b in c[1:]) + 0.5 for c in cells) \
        and any(len(c) > 1 for c in cells)
    if statlike:
        lis = []
        for c in cells:
            parts = [f"<strong>{inline_html(c[0], plain=True)}</strong>" if len(c) > 1 else inline_html(c[0])]
            parts += [inline_html(b) for b in c[1:]]
            lis.append("<li>" + " ".join(parts) + "</li>")
        return '<ul class="issue-stats">' + "".join(lis) + "</ul>"
    if len(cells) == 2 and all(g.bold for b in cells[0] for g in b.glyphs if not g.t.isspace() and not g.tag) \
            and sum(len(b.text) for b in cells[0]) <= 80 and not any(starts_bullet(b.frags[0]) for b in cells[1]):
        name = " ".join(inline_html(b) for b in cells[0])
        return f"<p>{name} {inline_html(cells[1][0])}</p>" if len(cells[1]) == 1 \
            else f"<p>{name}</p>\n" + render_items([("block", b) for b in cells[1]], body)
    out = []
    for c in cells:
        out.append(render_items([("block", b) for b in c], body))
    return "\n".join(out)


def merge_across_pages(items):
    """Rejoins a paragraph that the PDF split over a page break."""
    out = []
    for it in items:
        if out and it[0] == "block" and out[-1][0] == "block":
            a, b = out[-1][1], it[1]
            if b.page == a.page + 1 and abs(a.x0 - b.x0) <= 4 and abs(a.size - b.size) <= 0.6 \
                    and not starts_bullet(b.frags[0]) and not all_tags(b.frags[0]) \
                    and not re.search(r'[.!?:)"”]$', a.text.strip()) and len(a.frags) >= 2 \
                    and not b.text[:1].isupper():
                for f in b.frags:
                    a.frags.append(f)
                a.bottom = b.bottom
                continue
        out.append(it)
    return out


def extract(pdf_path):
    import pdfplumber
    with pdfplumber.open(str(pdf_path)) as pdf:
        all_frags = []
        nglyph = 0
        n_images = 0
        for pi, page in enumerate(pdf.pages):
            gs = page_glyphs(page)
            nglyph += sum(1 for g in gs if not g.t.isspace())
            n_images += sum(1 for im in page.images if (im["x1"] - im["x0"]) > 40 and (im["bottom"] - im["top"]) > 40)
            all_frags.extend(late_to_front(build_frags(gs, pi)))
    sizes = collections.Counter()
    for f in all_frags:
        for g in f.gs:
            sizes[g.size] += 1
    body = sizes.most_common(1)[0][0]
    blocks = build_blocks(all_frags)
    used = sum(len(f.gs) + f.marker_glyphs for b in blocks for f in b.frags)
    assert used == nglyph, "glyphs lost while building blocks"
    items = group_rows(blocks)
    items = merge_across_pages(items)
    items = build_tables(items)
    return render_items(items, body), n_images


# ─────────────────────────────────────────────────────────────
# Checks
# ─────────────────────────────────────────────────────────────
def alnum(s):
    return re.sub(r"[^0-9a-zà-ÿ]", "", s.replace("\u00ad", "").lower())


def coverage(pdf_path, body_html):
    """Checks the page against pdftotext's reading of the PDF (independent of this script).
    Returns (chars, ngrams): how closely the counts of letters and digits match (1.0 = exactly,
    so nothing was dropped or doubled), and the share of the PDF's 8-character runs that appear on
    the page in the same order (low = text jumbled)."""
    ref = alnum(subprocess.run(["pdftotext", "-q", str(pdf_path), "-"], capture_output=True, text=True).stdout)
    body_html = re.sub(r'<li value="(\d+)">', r"\1", body_html)  # list numbers the browser draws
    page = alnum(html.unescape(re.sub(r"<[^>]+>", "", body_html)))
    if not ref:
        return 0.0, 0.0
    a, b = collections.Counter(ref), collections.Counter(page)
    chars = 1 - sum(((a - b) + (b - a)).values()) / len(ref)
    n = 8
    ga = collections.Counter(ref[i:i + n] for i in range(len(ref) - n + 1))
    gb = collections.Counter(page[i:i + n] for i in range(len(page) - n + 1))
    ngrams = sum((ga & gb).values()) / max(1, sum(ga.values()))
    return chars, ngrams


def looks_garbled(body_html):
    text = html.unescape(re.sub(r"<[^>]+>", " ", body_html))
    if "(cid:" in text or "�" in text:
        return True
    letters = sum(c.isalpha() for c in text)
    return letters < 2000


# ─────────────────────────────────────────────────────────────
# Page
# ─────────────────────────────────────────────────────────────
def drive_view(i):
    return f"https://drive.google.com/file/d/{i}/view?usp=sharing"


def drive_download(i):
    return f"https://drive.google.com/uc?export=download&id={i}"


def page_html(p, body, n_images):
    title = p["title"]
    date = p["display_date"]
    desc = (f"{title}, {date}: the full text of this {p['series_name']} issue from EM Evidence, "
            f"evidence summaries for UK emergency medicine clinicians. Read online or download the PDF.")
    if p["series"] == "quarterly":
        desc = (f"{title}, {date}: the full text of this quarterly State of the Science edition from EM Evidence. "
                f"Read online or download the PDF.")
    audio = ""
    if p["audio_id"]:
        audio = (f'\n                <a class="issue-btn issue-btn-secondary" href="{drive_view(p["audio_id"])}" target="_blank" rel="noopener">'
                 f'Listen to the audio summary</a>')
    figures = ""
    if n_images:
        figures = " This issue has figures or images that only appear in the PDF."
    canonical = SITE + p["path"]
    head_title = f"{title} ({date}) | EM Evidence"
    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{esc(head_title)}</title>
    <meta name="description" content="{esc(desc)}">
    <link rel="canonical" href="{esc(canonical)}">
    <link rel="alternate" type="application/rss+xml" title="EM Evidence newsletters" href="/feed.xml">

    <meta property="og:type" content="article">
    <meta property="og:site_name" content="EM Evidence">
    <meta property="og:title" content="{esc(title)}">
    <meta property="og:description" content="{esc(desc)}">
    <meta property="og:url" content="{esc(canonical)}">
    <meta property="og:image" content="https://emevidence.org/icons/og-image.jpg">
    <meta property="og:locale" content="en_GB">
    <meta property="article:published_time" content="{p['iso']}">
    <meta name="twitter:card" content="summary_large_image">

    <script src="/theme-init.js"></script>
    <script src="/analytics.js" defer></script>
    <link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/styles.css">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#2563a8">
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
</head>
<body>
    <a class="skip-link" href="#issueText">Skip to the issue</a>
    <header class="header">
        <div class="container">
            <div class="header-content">
                <a class="logo-section page-home-link" href="/">
                    <picture>
                        <source srcset="/icons/logo-128.webp" type="image/webp">
                        <img src="/icons/logo-128.png" alt="" class="logo" width="60" height="60">
                    </picture>
                    <div class="logo-text">
                        <p class="page-site-name">EM Evidence</p>
                        <p>Educational tools and resources</p>
                    </div>
                </a>
                <nav class="nav" aria-label="Main">
                    <a href="/#home" class="nav-link">Tools</a>
                    <a href="/#about" class="nav-link">About</a>
                    <a href="/newsletters/" class="nav-link active">Newsletters</a>
                    <a href="/#newsletter" class="nav-link">Subscribe</a>
                    <a href="/#contact" class="nav-link">Contact</a>
                    <button id="darkModeToggle" type="button" aria-label="Dark mode" aria-pressed="false" title="Toggle dark mode" class="theme-toggle">
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    </button>
                </nav>
            </div>
        </div>
    </header>

    <main class="container issue-page" id="main">
        <p class="issue-crumb"><a href="/newsletters/">Newsletter archive</a> <span aria-hidden="true">›</span> {esc(p['series_name'])}</p>
        <div class="issue-head archive-series-{p['series']}">
            <h1>{esc(title)}</h1>
            <p class="issue-meta">{esc(p['series_name'])} · <time datetime="{p['iso']}">{esc(date)}</time></p>
            <div class="issue-actions">
                <a class="issue-btn" href="{drive_download(p['drive_id'])}" rel="noopener">Download the PDF</a>
                <a class="issue-btn issue-btn-secondary" href="{drive_view(p['drive_id'])}" target="_blank" rel="noopener">Open in Google Drive</a>{audio}
            </div>
            <p class="issue-note">This is the text of the PDF, copied across so you can read and search it here. Tables and layout may look different from the original.{figures} The PDF is the definitive version.</p>
        </div>

        <article class="issue-text" id="issueText">
{body}
        </article>

        <div class="issue-foot">
            <a class="issue-btn" href="{drive_download(p['drive_id'])}" rel="noopener">Download the PDF</a>
            <a class="issue-back" href="/newsletters/">Back to the newsletter archive</a>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-bottom">
                <p><a href="/">Back to EM Evidence</a> · <a href="/newsletters/">Newsletter archive</a> · <a href="/privacy.html">Privacy</a></p>
                <p>Educational evidence summaries only. Not a substitute for clinical judgement, local guidelines or the primary sources.</p>
            </div>
        </div>
    </footer>
</body>
</html>
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--drive-id", action="append", help="only this issue (repeatable)")
    ap.add_argument("--all", action="store_true", help="rebuild pages that already exist")
    ap.add_argument("--pdf-dir", help="folder of downloaded PDFs (named <driveId>.pdf); downloads go here")
    ap.add_argument("--skip", action="append", default=[], help="driveId to leave out (repeatable)")
    ap.add_argument("--dry-run", action="store_true", help="extract and check, but write nothing")
    ap.add_argument("--preview", help="write the pages into this folder instead, leaving the site untouched")
    args = ap.parse_args()

    pages = plan_pages(load_updates())
    if args.drive_id:
        pages = [p for p in pages if p["drive_id"] in args.drive_id]
    elif not args.all:
        pages = [p for p in pages if not p["existing"]]
    pages = [p for p in pages if p["drive_id"] not in args.skip]

    cache = Path(args.pdf_dir) if args.pdf_dir else Path(tempfile.mkdtemp(prefix="issue-pdfs-"))
    cache.mkdir(parents=True, exist_ok=True)

    done, skipped = [], []
    for p in pages:
        try:
            pdf = fetch_pdf(p["drive_id"], cache)
            body, n_images = extract(pdf)
            cov, rev = coverage(pdf, body)
            if looks_garbled(body) or cov < MIN_CHARS or rev < MIN_NGRAMS:
                skipped.append((p, f"text did not come out cleanly (match {cov:.4f}, order {rev:.3f})"))
                continue
        except Exception as e:  # keep going; report at the end
            skipped.append((p, f"{type(e).__name__}: {e}"))
            continue
        print(f"ok  {p['path']}  match {cov:.4f} order {rev:.3f}  {p['title']}")
        if args.preview:
            out = Path(args.preview) / p["path"].lstrip("/")
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(page_html(p, body, n_images))
        elif not args.dry_run:
            out = ROOT / p["path"].lstrip("/")
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(page_html(p, body, n_images))
        done.append(p)

    if done and not args.dry_run and not args.preview:
        set_html_paths(done)
        update_sitemap([p["path"] for p in done])
    for p, why in skipped:
        print(f"SKIPPED {p['drive_id']}  {p['title']} ({p['date']}): {why}", file=sys.stderr)
    print(f"{len(done)} page(s) written, {len(skipped)} skipped.")
    sys.exit(1 if skipped and not done else 0)


if __name__ == "__main__":
    main()
