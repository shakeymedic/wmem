// Checks the newsletter archive in updates.js before the site is deployed.
// Run: node scripts/validate-updates.js   (Netlify runs it as the build command)
// Exits non-zero on any error, so a bad entry stops the deploy and the live site stays as it was.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const file = path.join(__dirname, "..", "updates.js");
const src = fs.readFileSync(file, "utf8");

// Load only the data array, so the browser rendering code is not run
const start = src.indexOf("const updates = [");
const end = src.indexOf("\n];", start);
if (start < 0 || end < 0) fail(["Could not find the `const updates = [ ... ];` array in updates.js"]);
const ctx = {};
try {
    vm.runInNewContext(src.slice(start, end + 3).replace("const updates", "this.updates"), ctx);
} catch (e) {
    fail([`updates.js has a syntax error in the newsletter data: ${e.message}`]);
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
function parseDate(s) {
    if (typeof s !== "string") return null;
    let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
    m = /^(\d{1,2}) ([A-Za-z]+) (\d{4})$/.exec(s);
    if (!m) return null;
    const w = m[2].toLowerCase();
    const i = MONTHS.findIndex(n => n === w || n.slice(0, 3) === w || (w === "sept" && n === "september"));
    return i < 0 ? null : Date.UTC(+m[3], i, +m[1]);
}

const DRIVE_ID = /^[A-Za-z0-9_-]{25,}$/;
const ENTRY_KEYS = new Set(["date", "label", "tags", "htmlPath", "links"]);
const LINK_KEYS = new Set(["title", "driveId", "audioId"]);

const errors = [];
const seen = new Map();
const titles = new Map();
// Titles that name a specific issue or month must be unique, e.g. two "Issue 29" files means one is a stale draft
const SPECIFIC = /\bissue \d+\b|\b(january|february|march|april|may|june|july|august|september|october|november|december) \d{4}\b|\bq[1-4] \d{4}\b/;
const titleKey = t => t.toLowerCase().replace(/\.pdf$/, "").replace(/[^a-z0-9&]+/g, " ").trim();
let previous = Infinity;

ctx.updates.forEach((entry, i) => {
    const where = `Entry ${i + 1} (${entry && entry.label || entry && entry.date || "no label"})`;
    if (!entry || typeof entry !== "object") return errors.push(`${where}: not an object`);

    for (const k of Object.keys(entry)) if (!ENTRY_KEYS.has(k)) errors.push(`${where}: unknown field "${k}"`);

    const t = parseDate(entry.date);
    if (t === null) errors.push(`${where}: date "${entry.date}" is not like "2 Oct 2026"`);
    else {
        if (t > previous) errors.push(`${where}: dated ${entry.date} but sits below an older entry (newest must be at the top)`);
        previous = t;
    }

    if (typeof entry.label !== "string" || !entry.label.trim()) errors.push(`${where}: missing label`);
    else if (parseDate(entry.label.trim()) !== null) errors.push(`${where}: label is just a date; give it a name like "EM Evidence Rundown — Issue 32"`);

    if (entry.tags !== undefined && !(Array.isArray(entry.tags) && entry.tags.every(x => typeof x === "string" && x.trim())))
        errors.push(`${where}: tags must be a list of words`);

    if (!Array.isArray(entry.links) || entry.links.length === 0) return errors.push(`${where}: has no links`);

    entry.links.forEach((link, j) => {
        const lw = `${where}, link ${j + 1}`;
        for (const k of Object.keys(link)) {
            if (!LINK_KEYS.has(k)) errors.push(`${lw}: unknown field "${k}"${k === "audio" ? ' (put the audio file\'s ID in "audioId" on the issue\'s own link instead)' : ""}`);
        }
        if (typeof link.title !== "string" || !link.title.trim()) errors.push(`${lw}: missing title`);
        else {
            const key = titleKey(link.title);
            if (SPECIFIC.test(key)) {
                if (titles.has(key)) errors.push(`${lw}: "${link.title}" is already listed at ${titles.get(key)} (keep only the final version)`);
                else titles.set(key, lw);
            }
        }
        for (const key of ["driveId", "audioId"]) {
            const id = link[key];
            if (id === undefined && key === "audioId") continue;
            if (typeof id !== "string" || !DRIVE_ID.test(id)) { errors.push(`${lw}: ${key} "${id}" does not look like a Google Drive file ID`); continue; }
            if (seen.has(id)) errors.push(`${lw}: ${key} ${id} is already used by ${seen.get(id)} (duplicate upload or draft?)`);
            else seen.set(id, lw);
        }
    });
});

if (errors.length) fail(errors);
console.log(`updates.js OK: ${ctx.updates.length} newsletter entries checked.`);

function fail(list) {
    console.error(`updates.js has ${list.length} problem(s):`);
    list.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
}
