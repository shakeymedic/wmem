// Checks that every tool link and every newsletter (Google Drive) link opens for a member of the public.
// Run: node scripts/check-links.js   (needs Node 18+). Exits non-zero if any link is broken.
// A Drive file that isn't shared as "Anyone with the link can view" returns 401 here.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

// Load the data arrays only, so the browser code in these files isn't run
function loadArray(file, name) {
    const src = fs.readFileSync(path.join(root, file), "utf8");
    const start = src.indexOf(`const ${name} = [`);
    const end = src.indexOf("\n];", start);
    if (start < 0 || end < 0) throw new Error(`Could not find \`const ${name} = [ ... ];\` in ${file}`);
    const ctx = {};
    vm.runInNewContext(src.slice(start, end + 3).replace(`const ${name}`, `this.${name}`), ctx);
    return ctx[name];
}

const tools = loadArray("tools.js", "tools");
const updates = loadArray("updates.js", "updates");

const checks = [];
for (const t of tools) checks.push({ what: `Tool: ${t.name}`, url: t.url });
for (const entry of updates) {
    for (const link of entry.links || []) {
        for (const id of [link.driveId, link.audioId].filter(Boolean)) {
            checks.push({ what: `Newsletter: ${entry.label} (${entry.date})`, url: `https://drive.google.com/file/d/${id}/view` });
        }
    }
}

async function check(item) {
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const res = await fetch(item.url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
            return { ...item, status: res.status, ok: res.ok };
        } catch (err) {
            if (attempt === 2) return { ...item, status: err.name, ok: false };
        }
    }
}

(async () => {
    const results = [];
    // A few at a time, to be polite to Google and Netlify
    for (let i = 0; i < checks.length; i += 6) {
        results.push(...await Promise.all(checks.slice(i, i + 6).map(check)));
    }
    const broken = results.filter(r => !r.ok);
    console.log(`Checked ${results.length} links: ${results.length - broken.length} OK, ${broken.length} broken.`);
    for (const r of broken) console.log(`  ${r.status}  ${r.what}\n        ${r.url}`);
    process.exit(broken.length ? 1 : 0);
})();
