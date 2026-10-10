// Lists the tools due their two-yearly review, most overdue first (never-reviewed tools come first).
// Run: node scripts/review-due.js [count]      e.g. `node scripts/review-due.js 4` for the next four
// Used by the monthly review routine; see TOOL_REVIEWS.md.

const tools = require("../tools.js");

const REVIEW_INTERVAL_DAYS = 730;
const count = Number(process.argv[2]) || Infinity;
const now = Date.now();

function reviewedAt(tool) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tool.lastReviewed || "");
    return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
}

const due = tools
    .map(t => ({ t, at: reviewedAt(t) }))
    .filter(({ at }) => at === null || (now - at) / 86400000 >= REVIEW_INTERVAL_DAYS)
    // Never reviewed first (in file order), then oldest review first
    .sort((a, b) => (a.at === null ? 0 : 1) - (b.at === null ? 0 : 1) || (a.at || 0) - (b.at || 0));

console.log(`${due.length} of ${tools.length} tools are due a review.`);
due.slice(0, count).forEach(({ t }) => {
    console.log(`- ${t.id} | ${t.name} | ${t.url} | last reviewed: ${t.lastReviewed || "never"}`);
});
