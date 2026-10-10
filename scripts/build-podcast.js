// Writes podcast.xml (the podcast's RSS feed) from the audio summaries in updates.js.
// Run: node scripts/build-podcast.js   (Netlify runs it as part of the build command; the file itself is not committed)
//
// An issue is an episode when its link has audioId, audioBytes and audioSeconds. Show details are in
// podcast/show.json. Episodes that were on the old Spotify for Creators feed are kept, unchanged, in
// podcast/imported-episodes.json so podcast apps don't see them disappear or arrive twice.
// See the Podcast section of README.md.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "updates.js"), "utf8");
const show = JSON.parse(fs.readFileSync(path.join(root, "podcast", "show.json"), "utf8"));
const imported = JSON.parse(fs.readFileSync(path.join(root, "podcast", "imported-episodes.json"), "utf8"));

// Run updates.js with a stub document so its browser rendering code stays idle
const ctx = { document: { readyState: "complete", addEventListener() {}, getElementById() { return null; } } };
vm.runInNewContext(src + "\nthis.updates = updates;", ctx);

const SITE = "https://emevidence.org";
const FEED = `${SITE}/podcast.xml`;
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
// Drive's direct-download link: answers with audio/mpeg, the file's length and byte ranges (checked 10 Oct 2026)
const audioUrl = id => `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
const issueName = title => title.replace(/\.pdf$/i, "").replace(/\s+[—–-]\s+/, ", ");

const episodes = [];
for (const entry of ctx.updates) {
    for (const link of entry.links) {
        if (!link.audioId || !link.audioBytes || !link.audioSeconds) continue;
        const date = toDate(entry.date);
        if (!date) throw new Error(`build-podcast: unreadable date "${entry.date}" on ${link.title}`);
        const page = link.htmlPath || (entry.links.length === 1 && entry.htmlPath);
        const read = page ? SITE + page : drive(link.driveId);
        const name = issueName(link.title);
        episodes.push({
            date,
            xml: `    <item>
      <title>${esc(name)}</title>
      <description>${esc(`<p>Audio summary of ${name} (${entry.date}) for UK emergency medicine clinicians.</p><p><a href="${read}">Read the full issue, with references</a> · <a href="${SITE}/#newsletter">Subscribe to the newsletter</a></p>`)}</description>
      <link>${esc(read)}</link>
      <guid isPermaLink="false">emevidence-audio-${esc(link.audioId)}</guid>
      <pubDate>${date.toUTCString()}</pubDate>
      <enclosure url="${esc(audioUrl(link.audioId))}" length="${link.audioBytes}" type="audio/mpeg"/>
      <itunes:duration>${link.audioSeconds}</itunes:duration>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:explicit>false</itunes:explicit>
    </item>`
        });
    }
}

// Imported episodes are written back exactly as they were on the old feed (same guid, same audio)
for (const ep of imported) {
    const date = new Date(ep.pubDate);
    if (!ep.guid || !ep.title || !ep.enclosureUrl || isNaN(date)) throw new Error(`build-podcast: incomplete imported episode ${JSON.stringify(ep).slice(0, 120)}`);
    episodes.push({
        date,
        xml: `    <item>
      <title>${esc(ep.title)}</title>
      <description>${esc(ep.description || "")}</description>
      <guid isPermaLink="${ep.guidIsPermaLink ? "true" : "false"}">${esc(ep.guid)}</guid>
      <pubDate>${date.toUTCString()}</pubDate>
      <enclosure url="${esc(ep.enclosureUrl)}" length="${ep.enclosureLength || 0}" type="${esc(ep.enclosureType || "audio/mpeg")}"/>
      ${ep.duration ? `<itunes:duration>${esc(ep.duration)}</itunes:duration>` : ""}
      <itunes:explicit>false</itunes:explicit>
    </item>`
    });
}

episodes.sort((a, b) => b.date - a.date);
const newest = episodes.length ? episodes[0].date : new Date();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(show.title)}</title>
    <link>${SITE}/newsletters/</link>
    <atom:link href="${FEED}" rel="self" type="application/rss+xml"/>
    <description>${esc(show.description)}</description>
    <language>${esc(show.language)}</language>
    <copyright>${esc(show.copyright)}</copyright>
    <lastBuildDate>${newest.toUTCString()}</lastBuildDate>
    <image>
      <url>${SITE}${esc(show.image)}</url>
      <title>${esc(show.title)}</title>
      <link>${SITE}/newsletters/</link>
    </image>
    <itunes:image href="${SITE}${esc(show.image)}"/>
    <itunes:author>${esc(show.author)}</itunes:author>
    <itunes:subtitle>${esc(show.subtitle)}</itunes:subtitle>
    <itunes:summary>${esc(show.description)}</itunes:summary>
    <itunes:owner>
      <itunes:name>${esc(show.ownerName)}</itunes:name>
      <itunes:email>${esc(show.ownerEmail)}</itunes:email>
    </itunes:owner>
    <itunes:category text="${esc(show.category)}">
      <itunes:category text="${esc(show.subcategory)}"/>
    </itunes:category>
    <itunes:explicit>${show.explicit ? "true" : "false"}</itunes:explicit>
    <itunes:type>episodic</itunes:type>
${episodes.map(e => e.xml).join("\n")}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(root, "podcast.xml"), xml);
console.log(`podcast.xml written: ${episodes.length} episodes (${imported.length} imported).`);
