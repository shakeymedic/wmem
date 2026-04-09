// Evidence Rundown Newsletter Archive
// This file is the single source of truth for newsletter links on the website.
// The cron pipeline should update the `updates` array below after each newsletter is sent.

const docIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;flex-shrink:0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

// ============================================================
// NEWSLETTER DATA — add new entries at the TOP of this array
// Each entry: { date, label, links: [{ title, driveId }] }
// driveId is the Google Drive file ID (file must be publicly shared)
// ============================================================
const updates = [
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
// ============================================================
function renderUpdates() {
    const container = document.getElementById("updatesTimeline");
    if (!container) return;

    if (updates.length === 0) {
        container.innerHTML = `<p class="empty-update">No updates available yet.</p>`;
        return;
    }

    container.innerHTML = updates.map(week => `
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
            </div>
        </div>
    `).join("");
}

// Auto-render on DOM ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderUpdates);
} else {
    renderUpdates();
}
