// Writes feed.xml (RSS 2.0) from the newsletter archive in updates.js.
// Run: node scripts/build-feed.js   (Netlify runs it as part of the build command, so the
// feed is regenerated every time the pipeline adds an issue; the file itself is not committed)

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "updates.js"), "utf8");

// Run updates.js with a stub document so its browser rendering code stays idle
const ctx = { document: { readyState: "complete", addEventListener() {}, getElementById() { return null; } } };
vm.runInNewContext(src + "\nthis.updates = updates; this.seriesOf = seriesOf;", ctx);

const SITE = "https://emevidence.org";
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function toDate(s) {
    let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 8));
    m = /^(\d{1,2}) ([A-Za-z]{3})[A-Za-z]* (\d{4})$/.exec(s);
    if (m) return new Date(Date.UTC(+m[3], MONTHS.indexOf(m[2].toLowerCase()), +m[1], 8));
    return null;
}

const esc = v => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const drive = id => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view?usp=sharing`;

const items = ctx.updates.map(entry => {
    const date = toDate(entry.date);
    const series = ctx.seriesOf(entry).name;
    const main = entry.links[0];
    const page = entry.htmlPath || main.htmlPath;
    const links = entry.links.map(l =>
        `<p><a href="${esc(drive(l.driveId))}">${esc(l.title.replace(/\.pdf$/i, ""))}</a>` +
        (l.audioId ? ` · <a href="${esc(drive(l.audioId))}">Audio summary</a>` : "") +
        (l.htmlPath ? ` · <a href="${esc(SITE + l.htmlPath)}">Read on emevidence.org</a>` : "") + `</p>`
    ).join("");
    const description = `<p>${esc(series)}.</p>${links}` +
        (entry.htmlPath ? `<p><a href="${esc(SITE + entry.htmlPath)}">Read on emevidence.org</a></p>` : "");
    return `    <item>
      <title>${esc(entry.label)}</title>
      <link>${esc(page ? SITE + page : drive(main.driveId))}</link>
      <guid isPermaLink="false">${esc(main.driveId)}</guid>
      ${date ? `<pubDate>${date.toUTCString()}</pubDate>` : ""}
      <category>${esc(series)}</category>
      <description>${esc(description)}</description>
    </item>`;
});

const newest = ctx.updates.map(e => toDate(e.date)).filter(Boolean).sort((a, b) => b - a)[0] || new Date();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>EM Evidence newsletters</title>
    <link>${SITE}/newsletters/</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Weekly EM Evidence Rundown, plus PHEM, Anaesthetics &amp; ICU, Major Trauma and quarterly State of the Science editions, for emergency medicine clinicians.</description>
    <language>en-gb</language>
    <lastBuildDate>${newest.toUTCString()}</lastBuildDate>
    <image>
      <url>${SITE}/icons/logo-256.png</url>
      <title>EM Evidence newsletters</title>
      <link>${SITE}/newsletters/</link>
    </image>
${items.join("\n")}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(root, "feed.xml"), xml);
console.log(`feed.xml written: ${items.length} items.`);
