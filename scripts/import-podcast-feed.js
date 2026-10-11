// One-off: copies the episodes from the old Spotify for Creators feed into podcast/imported-episodes.json,
// so they stay in podcast.xml after the show moves to emevidence.org.
// Run: node scripts/import-podcast-feed.js <old RSS feed URL>   (Spotify for Creators > Settings shows it)
//
// Each episode keeps its original guid, so apps and Spotify treat it as the same episode, not a new one.
// The audio still points at Spotify's servers; re-host it (see README.md, Podcast) before deleting the old account.

const fs = require("fs");
const path = require("path");

const url = process.argv[2];
if (!url) { console.error("Usage: node scripts/import-podcast-feed.js <old RSS feed URL>"); process.exit(1); }

const decode = s => s.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&").trim();
const tag = (xml, name) => { const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(xml); return m ? decode(m[1]) : ""; };
const attr = (xml, name, a) => { const m = new RegExp(`<${name}\\b[^>]*\\b${a}="([^"]*)"`).exec(xml); return m ? decode(m[1]) : ""; };

(async () => {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const xml = await res.text();
    const items = xml.split(/<item[\s>]/).slice(1).map(s => s.split("</item>")[0]);
    const episodes = items.map(it => ({
        title: tag(it, "title"),
        description: tag(it, "description"),
        guid: tag(it, "guid"),
        guidIsPermaLink: attr(it, "guid", "isPermaLink") === "true",
        pubDate: tag(it, "pubDate"),
        enclosureUrl: attr(it, "enclosure", "url"),
        enclosureLength: +attr(it, "enclosure", "length") || 0,
        enclosureType: attr(it, "enclosure", "type") || "audio/mpeg",
        duration: tag(it, "itunes:duration")
    }));
    const bad = episodes.filter(e => !e.guid || !e.title || !e.enclosureUrl || isNaN(new Date(e.pubDate)));
    if (bad.length) throw new Error(`${bad.length} episode(s) are missing a title, guid, date or audio: ${bad.map(e => e.title || "(untitled)").join("; ")}`);
    const out = path.join(__dirname, "..", "podcast", "imported-episodes.json");
    fs.writeFileSync(out, JSON.stringify(episodes, null, 2) + "\n");
    console.log(`Imported ${episodes.length} episode(s) from "${tag(xml, "title")}" into podcast/imported-episodes.json.`);
})().catch(e => { console.error(e.message); process.exit(1); });
