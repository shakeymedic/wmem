// Evidence Rundown Newsletter Archive
// This file is the single source of truth for newsletter links on the website.
// The cron pipeline should update the `updates` array below after each newsletter is sent.

const docIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;flex-shrink:0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

// ============================================================
// NEWSLETTER DATA — add new entries at the TOP of this array
// Each entry: { date, label, tags?: [], htmlPath?: string, links: [{ title, driveId }] }
// driveId is the Google Drive file ID (file must be publicly shared)
// tags are topic labels (airway, sepsis, trauma, stroke, paeds, tox, cardiac, neuro, resus, safety)
// htmlPath is the on-site landing page for the issue (searchable)
// ============================================================
const updates = [
  {
    date: "30 April 2026",
    title: "Anaesthetics & ICU Evidence Rundown",
    driveId: "1pyYowACB0XWOaUVLcAv2ITGaDk9e7q0g",
    previewUrl: "https://drive.google.com/file/d/1pyYowACB0XWOaUVLcAv2ITGaDk9e7q0g/preview",
    downloadUrl: "https://drive.google.com/uc?export=download&id=1pyYowACB0XWOaUVLcAv2ITGaDk9e7q0g",
    tags: []
  },
  {
    date: "30 April 2026",
    title: "EM Evidence Rundown",
    driveId: "1rH82sJmngV6qVosYVJ6CeTVWe0OYw0RF",
    previewUrl: "https://drive.google.com/file/d/1rH82sJmngV6qVosYVJ6CeTVWe0OYw0RF/preview",
    downloadUrl: "https://drive.google.com/uc?export=download&id=1rH82sJmngV6qVosYVJ6CeTVWe0OYw0RF",
    tags: []
  },
    {
        date: "23 April 2026",
        label: "23 April 2026",
        links: [
            { title: "EM Evidence Rundown", driveId: "13U0WNszudqXVOUiwyHzL6xG8sxxezkVR" },
        ]
    },
    {
        date: "16 April 2026",
        label: "16 April 2026",
        links: [
            { title: "EM Evidence Rundown", driveId: "1JYbAuyVX_i4X--aSPew83yhhVho912cy" },
        ]
    },
    {
        date: "16 April 2026",
        label: "16 April 2026",
        links: [
            { title: "EM Evidence Rundown", driveId: "1TRqj8TG7dKkEvQSh5sexTrvrzdQ5r2gg" },
        ]
    },
    {
        date: "9 April 2026",
        label: "9 April 2026",
        links: [
            { title: "EM Evidence Rundown", driveId: "1__9-VSlzUVur9-CbZqQpI1pCO5J9hEe-" },
        ]
    },
    {
        date: "3 April 2026",
        label: "April 2026",
        links: [
            { title: "EM Evidence Rundown", driveId: "1kbjocLoOfZzU7g7hnbTdlGcu-MR4nkhN" },
            { title: "Anaesthetics & ICU Evidence Rundown", driveId: "1bFP0T7J829m386cf6f2lK7RXFBXBZxVg" },
            { title: "PHEM Evidence Rundown", driveId: "1OYpPE4mY2AEAimJsjQJBo6HCofc-ekz1" },
        ]
    },
    {
        date: "2 April 2026",
        label: "Early April 2026",
        links: [
            { title: "Anaesthetics & ICU Evidence Rundown", driveId: "1wLP_sv8rcpJo2rROiFm66CVevN04kbRM" },
            { title: "PHEM Evidence Rundown", driveId: "1eMPha3GrJk_RC31p-VGTXNFcsjCOvznV" },
        ]
    },
    {
        date: "16 March 2026",
        label: "Mid March 2026",
        links: [
            { title: "PHEM Q1 2026 Quarterly", driveId: "1eVlEqxECiDFy4F-aFT5XC4d9FaO5Pyrh" },
        ]
    },
    {
        date: "15 March 2026",
        label: "15 March 2026",
        links: [
            { title: "EM Evidence Rundown (v3)", driveId: "1K5n8VvhZxb9N3EkkoZgOBvDck-7uaBQF" },
            { title: "Anaesthetics & ICU Evidence Rundown (v3)", driveId: "1e26KWCDHAm5PJ6XL9EEzG94_bykEAumy" },
        ]
    },
    {
        date: "14 March 2026",
        label: "14 March 2026",
        links: [
            { title: "EM Evidence Rundown", driveId: "1AMQr_qyWtUqGC06oc6OlZh7xJZr0eYha" },
            { title: "Anaesthetics & ICU Evidence Rundown", driveId: "1t8Cb4oLLIomrR2Uk6sZ0jhiVsiuOpocu" },
        ]
    },
];

// ============================================================
// RENDER — builds the sidebar timeline from the data above
// Supports a tag filter (select#archiveTagFilter, optional).
// ============================================================
function collectAllTags() {
    const set = new Set();
    updates.forEach(w => (w.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort();
}

function buildTagFilter() {
    const sel = document.getElementById("archiveTagFilter");
    if (!sel) return;
    sel.innerHTML = `<option value="">All topics</option>` +
        collectAllTags().map(t => `<option value="${t}">${t}</option>`).join("");
    sel.addEventListener("change", () => renderUpdates(sel.value));
}

function renderUpdates(filterTag) {
    const container = document.getElementById("updatesTimeline");
    if (!container) return;

    const filtered = filterTag
        ? updates.filter(w => (w.tags || []).includes(filterTag))
        : updates;

    if (filtered.length === 0) {
        container.innerHTML = `<p class="empty-update">No updates available yet.</p>`;
        return;
    }

    container.innerHTML = filtered.map(week => `
        <div class="update-week">
            <div class="update-date">${week.date}</div>
            <div class="update-links">
                ${week.links.map(link => `
                    <a href="https://drive.google.com/file/d/${link.driveId}/view?usp=sharing"
                       target="_blank" rel="noopener" class="sidebar-link">
                        ${docIcon}
                        ${link.title}
                    </a>
                `).join("")}
                ${week.htmlPath ? `<a href="${week.htmlPath}" class="sidebar-link sidebar-link-html">Read on site →</a>` : ""}
                ${(week.tags && week.tags.length) ? `<div class="update-tags">${week.tags.map(t => `<span class="update-tag">${t}</span>`).join("")}</div>` : ""}
            </div>
        </div>
    `).join("");
}

function initArchive() {
    buildTagFilter();
    renderUpdates();
}

// Auto-render on DOM ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initArchive);
} else {
    initArchive();
}
