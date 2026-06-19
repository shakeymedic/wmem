// Evidence Rundown Newsletter Archive
// This file is the single source of truth for newsletter links on the website.
// The pipeline updates the `updates` array after each newsletter is sent.
// Schema: { date, label, tags, links: [{ title, driveId }] }
// driveId: Google Drive file ID — must be set to "Anyone with the link can view"

const audioIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;flex-shrink:0;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;

const docIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;flex-shrink:0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

// ============================================================
// NEWSLETTER DATA — newest entries at TOP
// ============================================================
const updates = [
  {
    date: "18 June 2026",
    label: "18 June 2026",
    tags: [],
    links: [
      { title: "EM Evidence Rundown — Issue 17", driveId: "1I4zzD50P818UxZCf8dh_8DxaKDK3ROCq", audioId: "1xBcZM9xPGPwFeOQcTQ9K_HhSKH_TP7cK" }
    ]
  },
  {
    date: "11 June 2026",
    label: "11 June 2026",
    tags: ["sepsis", "stroke", "paeds", "safety", "measles", "defibrillation"],
    links: [
      { title: "EM Evidence Rundown — Issue 16", driveId: "1rR5Y-54WWvjF7QKfDJXtij1xWZLsh8UB", audioId: "1Vv2BJI33cwI69RdKm_ZtBb3lzV_WXA9a" }
    ]
  },
  {
    date: "4 June 2026",
    label: "4 June 2026",
    tags: [],
    links: [
      { title: "EM Evidence Rundown — Issue 15", driveId: "1LOdkrfpuixAc_t8KRw6eMYJCpeqbm_mc" }
    ]
  },
  {
    date: "2 June 2026",
    label: "2 June 2026",
    tags: ["anaesthetics", "icu", "airway", "safety", "resus", "obstetric", "periop"],
    links: [
      { title: "Anaesthetics & ICU Evidence Rundown — June 2026", driveId: "1EQ2zhyC7nOurdp8euaRnRlKGWKhGps6x" }
    ]
  },
  {
    date: "1 June 2026",
    label: "1 June 2026",
    tags: ["trauma", "resus", "airway", "phem", "blood", "safety"],
    links: [
      { title: "PHEM Evidence Rundown — June 2026", driveId: "1rD57qAhQfUOehCJP_joaN5abYyA4C0ot" }
    ]
  },
  {
    date: "28 May 2026",
    label: "28 May 2026",
    tags: ["sepsis", "stroke", "paeds", "anaphylaxis", "resus", "safety"],
    links: [
      { title: "EM Evidence Rundown — Issue 14", driveId: "1AI11gBycComEHNf0DOiNHE2KuAQIXSTz", audioId: "1NtmGagPu8mfF1M1BL-QWBn7KQIlev7-q" }
    ]
  },
  {
    date: "21 May 2026",
    label: "21 May 2026",
    tags: ["trauma", "resus", "sepsis", "paeds", "airway", "cardiac"],
    links: [
      { title: "EM Evidence Rundown — Issue 13", driveId: "1CONdPGX0_fLnR5O6FS3hz0wfVfIyUbQt", audioId: "1jYIborqVfxbZhPvcGnyzadw3b--DBph0" }
    ]
  },
  {
    date: "14 May 2026",
    label: "14 May 2026",
    tags: [],
    links: [
      { title: "EM Evidence Rundown", driveId: "1AnrZgedE4PRxl3Ebfj2oV02mVXiK5bEG", audioId: "1d4vOvcv9OpaOi08BO2epMR8HjLT1lyJd" }
    ]
  },
  {
    date: "7 May 2026",
    label: "7 May 2026",
    tags: ["resus", "stroke", "sepsis", "paeds", "airway", "cardiac"],
    links: [
      { title: "EM Evidence Rundown — Issue 11", driveId: "1W5u1q4MQ_6xuPqdCAEnUMW-4PqgppbbU", audioId: "1aBLNMe-dwaTsSnN7SurLuyGjLAnWIppg" }
    ]
  },
  {
    date: "30 April 2026",
    label: "30 April 2026",
    tags: ["sepsis", "airway", "resus", "cardiac", "trauma", "paeds", "safety"],
    links: [
      { title: "EM Evidence Rundown — Issue 10", driveId: "1rH82sJmngV6qVosYVJ6CeTVWe0OYw0RF" },
      { title: "Anaesthetics & ICU Evidence Rundown — May 2026", driveId: "1IIfC6NbsyUpFKrh0Og4Kzcjv6co1WJFO" },
      { title: "PHEM Evidence Rundown — May 2026", driveId: "10L-KCrjHLdpePs0OgkoTxq698d4QpUDy" }
    ]
  },
  {
    date: "23 April 2026",
    label: "23 April 2026",
    tags: ["cardiac", "stroke", "sepsis", "resus", "paeds", "airway"],
    links: [
      { title: "EM Evidence Rundown — Issue 9", driveId: "13U0WNszudqXVOUiwyHzL6xG8sxxezkVR" }
    ]
  },
  {
    date: "16 April 2026",
    label: "16 April 2026",
    tags: ["resus", "airway", "stroke", "sepsis", "paeds", "safety"],
    links: [
      { title: "EM Evidence Rundown — Issue 7 (Final)", driveId: "1JYbAuyVX_i4X--aSPew83yhhVho912cy" }
    ]
  },
  {
    date: "9 April 2026",
    label: "9 April 2026",
    tags: ["resus", "sepsis", "stroke", "paeds"],
    links: [
      { title: "EM Evidence Rundown — Issue 5", driveId: "1__9-VSlzUVur9-CbZqQpI1pCO5J9hEe-" }
    ]
  },
  {
    date: "3 April 2026",
    label: "April 2026",
    tags: ["airway", "sepsis", "trauma", "cardiac", "resus", "paeds"],
    links: [
      { title: "EM Evidence Rundown — Issue 4", driveId: "1kbjocLoOfZzU7g7hnbTdlGcu-MR4nkhN" },
      { title: "Anaesthetics & ICU Evidence Rundown — April 2026", driveId: "1bFP0T7J829m386cf6f2lK7RXFBXBZxVg" },
      { title: "PHEM Evidence Rundown — April 2026", driveId: "1OYpPE4mY2AEAimJsjQJBo6HCofc-ekz1" }
    ]
  },
  {
    date: "2 April 2026",
    label: "Early April 2026",
    tags: ["airway", "resus", "trauma"],
    links: [
      { title: "Anaesthetics & ICU Evidence Rundown", driveId: "1wLP_sv8rcpJo2rROiFm66CVevN04kbRM" },
      { title: "PHEM Evidence Rundown", driveId: "1eMPha3GrJk_RC31p-VGTXNFcsjCOvznV" }
    ]
  },
  {
    date: "16 March 2026",
    label: "Mid March 2026",
    tags: ["resus", "trauma", "airway"],
    links: [
      { title: "PHEM Q1 2026 Quarterly", driveId: "1eVlEqxECiDFy4F-aFT5XC4d9FaO5Pyrh" }
    ]
  },
  {
    date: "15 March 2026",
    label: "15 March 2026",
    tags: ["airway", "sepsis", "cardiac"],
    links: [
      { title: "EM Evidence Rundown (v3)", driveId: "1K5n8VvhZxb9N3EkkoZgOBvDck-7uaBQF" },
      { title: "Anaesthetics & ICU Evidence Rundown (v3)", driveId: "1e26KWCDHAm5PJ6XL9EEzG94_bykEAumy" }
    ]
  },
  {
    date: "14 March 2026",
    label: "14 March 2026",
    tags: ["airway", "sepsis"],
    links: [
      { title: "EM Evidence Rundown", driveId: "1AMQr_qyWtUqGC06oc6OlZh7xJZr0eYha" },
      { title: "Anaesthetics & ICU Evidence Rundown", driveId: "1t8Cb4oLLIomrR2Uk6sZ0jhiVsiuOpocu" }
    ]
  },
  {
    date: "5 March 2026",
    label: "5 March 2026",
    tags: ["resus", "sepsis", "stroke"],
    links: [
      { title: "EM Evidence Rundown", driveId: "1l_gmMRVScIZh1vnSujOulQc6foDqH2Ek" }
    ]
  }
];

// RENDER — builds the sidebar timeline from the data above
// Supports a tag filter (select#archiveTagFilter, optional).
// ============================================================
function collectAllTags() {
    const set = new Set();
    updates.forEach(w => (w.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort();
}

function buildTagFilter() {
    // Populate both desktop and mobile filter selects
    const tags = collectAllTags();
    const options = `<option value="">All topics</option>` +
        tags.map(t => `<option value="${t}">${t}</option>`).join("");

    const sel = document.getElementById("archiveTagFilter");
    if (sel) {
        sel.innerHTML = options;
        sel.addEventListener("change", () => renderUpdates(sel.value));
    }

    const selMobile = document.getElementById("mobileArchiveTagFilter");
    if (selMobile) {
        selMobile.innerHTML = options;
        selMobile.addEventListener("change", () => renderUpdates(selMobile.value));
    }
}

function buildTimelineHTML(filtered) {
    if (filtered.length === 0) {
        return `<p class="empty-update">No updates available yet.</p>`;
    }
    return filtered.map(week => `
        <div class="update-week">
            <div class="update-date">${week.date}</div>
            <div class="update-links">
                ${week.links.map(link => `
                    <a href="https://drive.google.com/file/d/${link.driveId}/view?usp=sharing"
                       target="_blank" rel="noopener" class="sidebar-link">
                        ${docIcon}
                        ${link.title}
                    </a>
                    ${link.audioId ? `<a href="https://drive.google.com/file/d/${link.audioId}/view?usp=sharing"
                       target="_blank" rel="noopener" class="sidebar-link sidebar-link-audio">
                        ${audioIcon}
                        Audio summary
                    </a>` : ""}
                `).join("")}
                ${week.htmlPath ? `<a href="${week.htmlPath}" class="sidebar-link sidebar-link-html">Read on site →</a>` : ""}
                ${(week.tags && week.tags.length) ? `<div class="update-tags">${week.tags.map(t => `<span class="update-tag">${t}</span>`).join("")}</div>` : ""}
            </div>
        </div>
    `).join("");
}

function renderUpdates(filterTag) {
    const filtered = filterTag
        ? updates.filter(w => (w.tags || []).includes(filterTag))
        : updates;

    const html = buildTimelineHTML(filtered);

    // Render into desktop sidebar
    const container = document.getElementById("updatesTimeline");
    if (container) container.innerHTML = html;

    // Render into mobile inline archive
    const mobileContainer = document.getElementById("mobileUpdatesTimeline");
    if (mobileContainer) mobileContainer.innerHTML = html;

    // Sync both filter selects to the current value
    const selMobile = document.getElementById("mobileArchiveTagFilter");
    if (selMobile && filterTag !== undefined) selMobile.value = filterTag || "";
    const sel = document.getElementById("archiveTagFilter");
    if (sel && filterTag !== undefined) sel.value = filterTag || "";
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
