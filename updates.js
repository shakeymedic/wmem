// Evidence Rundown Newsletter Archive
// This file is the single source of truth for newsletter links on the website.
// The pipeline updates the `updates` array after each newsletter is sent.
// Schema: { date, label, tags?, htmlPath?, links: [{ title, driveId, audioId? }] }
//   date:    "2 Oct 2026" (day, short month, year)
//   label:   descriptive name, e.g. "EM Evidence Rundown — Issue 32" (shown in the Latest banner)
//   audioId: Drive ID of the audio summary for that issue (not a separate link)
// driveId: Google Drive file ID — must be set to "Anyone with the link can view"
// `node scripts/validate-updates.js` checks this file; Netlify runs it before every deploy.

const audioIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;flex-shrink:0;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;

const docIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;flex-shrink:0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

// ============================================================
// NEWSLETTER DATA — newest entries at TOP
// ============================================================
const updates = [
  {
    date: "9 Oct 2026",
    label: "Issue 33 \u2014 EM Evidence Rundown",
    links: [
      { title: "EM Evidence Rundown Issue 33", driveId: "1n8Fu5l5JtdFQHHzQLyI-znQ77mq-Mp0X" }
    ]
  },
  {
    date: "9 Oct 2026",
    label: "Major Trauma Evidence Rundown \u2014 Issue 7 (October 2026)",
    links: [
      { title: "Major Trauma Evidence Rundown October 2026.pdf", driveId: "16JecnQS-vJ1EB6AHVbgJkyMWYppJyn21" }
    ]
  },
  {
    date: "3 Oct 2026",
    label: "Major Trauma Evidence Rundown — Issue 7 (October 2026)",
    links: [
      { title: "Major Trauma Evidence Rundown — Issue 7 (October 2026)", driveId: "16JecnQS-vJ1EB6AHVbgJkyMWYppJyn21" }
    ]
  },
  {
    date: "2 Oct 2026",
    label: "Anaesthetics & ICU Evidence Rundown — Issue 9 (October 2026)",
    links: [
      { title: "Anaesthetics & ICU Evidence Rundown — October 2026", driveId: "1HmBc6BIS8Q_qT8esQ_jfl1PlP2Xq3-DZ" }
    ]
  },
  {
    date: "2 Oct 2026",
    label: "Issue 32 — EM Evidence Rundown",
    links: [
      { title: "EM Evidence Rundown — Issue 32", driveId: "1X4R0SASSIv9ofY-kvSzB3zsALpYLY5ge" }
    ]
  },
  {
    date: "2 Oct 2026",
    label: "PHEM Evidence Rundown — Issue 9 (October 2026)",
    links: [
      { title: "PHEM Evidence Rundown — October 2026", driveId: "1stPFnrMGxTVqskTOxGsH3EqNUKN24bVB" }
    ]
  },
  {
    date: "1 Oct 2026",
    label: "Q3 2026 — Anaesthetics State of the Science",
    tags: ["quarterly", "ebook"],
    links: [
      { title: "Anaesthetics & ICU Evidence — Q3 2026 State of the Science", driveId: "1Q6Y1QVhwcLamOCZRwuBS_Cgb_od1T5ZT" }
    ]
  },
  {
    date: "1 Oct 2026",
    label: "Q3 2026 — PHEM State of the Science",
    tags: ["quarterly", "ebook"],
    links: [
      { title: "PHEM Evidence — Q3 2026 State of the Science", driveId: "1yrYjm10aUVXD8LNzH13GMjfyCAHmgCt6" }
    ]
  },
  {
    date: "29 Sep 2026",
    label: "Q3 2026 — EM State of the Science (corrected edition, 2 Oct)",
    tags: ["quarterly", "ebook"],
    links: [
      { title: "EM Evidence — Q3 2026 State of the Science", driveId: "1EwJ0Oc56jBZ23IZBOR6SundbA0EbuFRY" }
    ]
  },
  {
    date: "25 Sep 2026",
    label: "Issue 31 — EM Evidence Rundown",
    links: [
      { title: "EM Evidence Rundown — Issue 31", driveId: "1dRbTDKVK0DVT6hXJxbylLlWfUD9VjK7e" }
    ]
  },
  {
    date: "18 Sep 2026",
    label: "Issue 30 — EM Evidence Rundown",
    links: [
      { title: "EM Evidence Rundown — Issue 30", driveId: "155pCr8AzTgi4cBL9XxyBqxd15DGN21sB" }
    ]
  },
  {
    date: "11 Sep 2026",
    label: "Issue 29 — EM Evidence Rundown",
    links: [
      { title: "EM Evidence Rundown — Issue 29", driveId: "1d9lTpf3_jfbTHz-en64EwDf0hxEx6MNb" }
    ]
  },
  {
    date: "4 Sep 2026",
    label: "EM Evidence Rundown — Issue 28 (4 September 2026)",
    links: [
      { title: "EM Evidence Rundown — Issue 28", driveId: "1KuPITWh2yY4WMy9VfSgmZitprP3SD-gq" }
    ]
  },
  {
    date: "3 Sep 2026",
    label: "Major Trauma Evidence Rundown — Issue 6 (September 2026)",
    links: [
      { title: "Major Trauma Evidence Rundown — Issue 6 (September 2026)", driveId: "1iCgaEgOrvyB8Qjyk3nu7w0OCMEW-fbN0" }
    ]
  },
  {
    date: "2 Sep 2026",
    label: "Anaesthetics & ICU Evidence Rundown — Issue 8 (September 2026)",
    links: [
      { title: "Anaesthetics & ICU Evidence Rundown — September 2026", driveId: "1qHBMqAwAvcCw_ASgx0fpIr8qtBJkd0ci" }
    ]
  },
  {
    date: "1 Sep 2026",
    label: "PHEM Evidence Rundown — Issue 8 (September 2026)",
    links: [
      { title: "PHEM Evidence Rundown — September 2026", driveId: "1U7jo6g8KecvA5rebMLPgELCl9cSCq_xh" }
    ]
  },
  {
    date: "28 Aug 2026",
    label: "EM Evidence Rundown — Issue 27 (28 Aug 2026)",
    links: [
      { title: "EM Evidence Rundown — Issue 27", driveId: "1lAIzQi-zjEWYcHTIh3Uv-fiJx2DOzv6-" }
    ]
  },
  {
    date: "21 Aug 2026",
    label: "EM Evidence Rundown — Issue 26 (21 Aug 2026)",
    links: [
      { title: "EM Evidence Rundown — Issue 26", driveId: "11K54Ab3l-Y3BX16TfBfaCZ6NuwVjyJho", audioId: "1a5RGqICEg_x8_EIGIw_9p-gDU10DpKKk" }
    ]
  },
  {
    date: "14 Aug 2026",
    label: "EM Evidence Rundown — Issue 25 (14 Aug 2026)",
    links: [
      { title: "EM Evidence Rundown — Issue 25", driveId: "147fZ7CMSuJ67k53Ph9K6rMJxk9s7TumZ" }
    ]
  },
  {
    date: "7 Aug 2026",
    label: "EM Evidence Rundown — Issue 24 (7 Aug 2026)",
    links: [
      { title: "EM Evidence Rundown — Issue 24", driveId: "1qXeXsZmnN2nWNLE42RkqWN1QyLf3cmkb" }
    ]
  },
  {
    date: "3 Aug 2026",
    label: "Major Trauma Evidence Rundown — August 2026 (Issue 2)",
    links: [
      { title: "Major Trauma Evidence Rundown — Issue 2 (August 2026)", driveId: "14YxbursTYgdawicSEhbXT1AZqWnh8Osa" }
    ]
  },
  {
    date: "2 Aug 2026",
    label: "Anaesthetics & ICU Evidence Rundown — August 2026 (Issue 7)",
    links: [
      { title: "Anaesthetics & ICU Evidence Rundown — August 2026", driveId: "11cOfjd1M0mcbCXbmqAEtV99oghrsO6yq" }
    ]
  },
  {
    date: "1 Aug 2026",
    label: "PHEM Evidence Rundown — August 2026 (Issue 7)",
    links: [
      { title: "PHEM Evidence Rundown — August 2026", driveId: "15wYLNWmWjylh57sfZut_p83geee5jJOS" }
    ]
  },
  {
    date: "31 Jul 2026",
    label: "EM Evidence Rundown — Issue 23 (31 Jul 2026)",
    links: [
      { title: "EM Evidence Rundown — Issue 23", driveId: "1hw8PIizNHMYEK92843VYMg4QQUL-P_W2" }
    ]
  },
  {
    date: "24 Jul 2026",
    label: "EM Evidence Rundown — Issue 22 (24 Jul 2026)",
    links: [
      { title: "EM Evidence Rundown — Issue 22", driveId: "1nNNEr6P1Ec0BBNBmb0pCPdT6QdsUULem" }
    ]
  },
  {
    date: "17 Jul 2026",
    label: "EM Evidence Rundown — Issue 21",
    links: [
      { title: "EM Evidence Rundown — Issue 21", driveId: "1gJHd74ifQhX7x4gdPb36xngicw16k3u0" }
    ]
  },
  {
    date: "10 Jul 2026",
    label: "EM Evidence Rundown — Issue 20",
    links: [
      { title: "EM Evidence Rundown — Issue 20", driveId: "1VXtCRUFOIBP2NV-vQSbMzVdg3kGO6OC0" }
    ]
  },
  {
    date: "2 Jul 2026",
    label: "Major Trauma Evidence Rundown — Issue 1 (July 2026)",
    links: [
      { title: "Major Trauma Evidence Rundown — Issue 1 (July 2026)", driveId: "18bg9jD3d-KiqsSpPOs1D8WlI9zxuptWl" }
    ]
  },
  {
    date: "2 Jul 2026",
    label: "Anaesthetics & ICU Evidence Rundown — July 2026",
    links: [
      { title: "Anaesthetics & ICU Evidence Rundown — July 2026", driveId: "1d8zsIeG7TC2IrvmrYlkqeLpe5WJfOGRR" }
    ]
  },
  {
    date: "2 Jul 2026",
    label: "PHEM Evidence Rundown — Issue 6 (July 2026)",
    links: [
      { title: "PHEM Evidence Rundown — Issue 6 (July 2026)", driveId: "1TCkY5vUHY1PzQ1tad-pC7Ar46r5HKEMX" }
    ]
  },
  {
    date: "2 Jul 2026",
    label: "EM Evidence Rundown — Issue 19",
    links: [
      { title: "EM Evidence Rundown — Issue 19", driveId: "1u6FYysE7G_U-lyJeUu7Jl3_isRz09VYp" }
    ]
  },
  {
    date: "30 Jun 2026",
    label: "Q2 2026 — Anaesthetics State of the Science",
    tags: ["quarterly", "ebook", "anaesthetics"],
    links: [
      { title: "Anaesthetics & ICU Evidence — Q2 2026 State of the Science", driveId: "1cvRSi0m_ilBzV9EtNol9ZgsTvobQZbyJ" }
    ]
  },
  {
    date: "29 Jun 2026",
    label: "Q2 2026 — PHEM State of the Science",
    tags: ["quarterly", "ebook", "phem"],
    links: [
      { title: "PHEM Evidence — Q2 2026 State of the Science", driveId: "1VGI3L6aBDmPcYKQ5GF7Q8Lp6raFzvkDM" }
    ]
  },
  {
    date: "29 Jun 2026",
    label: "Major Trauma Evidence Rundown — Issue 1 (earlier version, 29 June)",
    links: [
      { title: "Major Trauma Evidence Rundown — Issue 1 (earlier version, 29 June)", driveId: "1Fpm_6HfP2KuBWWXsyFihiGu81YUXyg84" }
    ]
  },
  {
    date: "28 Jun 2026",
    label: "Q2 2026 — EM State of the Science",
    tags: ["quarterly", "ebook"],
    links: [
      { title: "EM Evidence — Q2 2026 State of the Science", driveId: "1yaVJ-wsa9nQ_T9lKI5v5-R5t7yO2Yc-7" }
    ]
  },
  {
    date: "25 Jun 2026",
    label: "EM Evidence Rundown — Issue 18",
    links: [
      { title: "EM Evidence Rundown — Issue 18", driveId: "1fE0GAv7e5qf9ool7GPRVoJ9BK7FiitZ3", audioId: "19kqAgAZ0sTkakig11E8rkZJXqEpQikjT" }
    ]
  },
  {
    date: "18 Jun 2026",
    label: "EM Evidence Rundown — Issue 17",
    links: [
      { title: "EM Evidence Rundown — Issue 17", driveId: "1I4zzD50P818UxZCf8dh_8DxaKDK3ROCq", audioId: "1xBcZM9xPGPwFeOQcTQ9K_HhSKH_TP7cK" }
    ]
  },
  {
    date: "11 Jun 2026",
    label: "EM Evidence Rundown — Issue 16",
    tags: ["sepsis", "stroke", "paeds", "safety", "measles", "defibrillation"],
    links: [
      { title: "EM Evidence Rundown — Issue 16", driveId: "1rR5Y-54WWvjF7QKfDJXtij1xWZLsh8UB", audioId: "1Vv2BJI33cwI69RdKm_ZtBb3lzV_WXA9a" }
    ]
  },
  {
    date: "4 Jun 2026",
    label: "EM Evidence Rundown — Issue 15",
    links: [
      { title: "EM Evidence Rundown — Issue 15", driveId: "1LOdkrfpuixAc_t8KRw6eMYJCpeqbm_mc" }
    ]
  },
  {
    date: "2 Jun 2026",
    label: "Anaesthetics & ICU Evidence Rundown — June 2026",
    tags: ["anaesthetics", "icu", "airway", "safety", "resus", "obstetric", "periop"],
    links: [
      { title: "Anaesthetics & ICU Evidence Rundown — June 2026", driveId: "1EQ2zhyC7nOurdp8euaRnRlKGWKhGps6x" }
    ]
  },
  {
    date: "1 Jun 2026",
    label: "PHEM Evidence Rundown — June 2026",
    tags: ["trauma", "resus", "airway", "phem", "blood", "safety"],
    links: [
      { title: "PHEM Evidence Rundown — June 2026", driveId: "1rD57qAhQfUOehCJP_joaN5abYyA4C0ot" }
    ]
  },
  {
    date: "28 May 2026",
    label: "EM Evidence Rundown — Issue 14",
    tags: ["sepsis", "stroke", "paeds", "anaphylaxis", "resus", "safety"],
    links: [
      { title: "EM Evidence Rundown — Issue 14", driveId: "1AI11gBycComEHNf0DOiNHE2KuAQIXSTz", audioId: "1NtmGagPu8mfF1M1BL-QWBn7KQIlev7-q" }
    ]
  },
  {
    date: "21 May 2026",
    label: "EM Evidence Rundown — Issue 13",
    tags: ["trauma", "resus", "sepsis", "paeds", "airway", "cardiac"],
    links: [
      { title: "EM Evidence Rundown — Issue 13", driveId: "1CONdPGX0_fLnR5O6FS3hz0wfVfIyUbQt", audioId: "1jYIborqVfxbZhPvcGnyzadw3b--DBph0" }
    ]
  },
  {
    date: "14 May 2026",
    label: "EM Evidence Rundown — Issue 12",
    links: [
      { title: "EM Evidence Rundown — Issue 12", driveId: "1AnrZgedE4PRxl3Ebfj2oV02mVXiK5bEG", audioId: "1d4vOvcv9OpaOi08BO2epMR8HjLT1lyJd" }
    ]
  },
  {
    date: "7 May 2026",
    label: "EM Evidence Rundown — Issue 11",
    tags: ["resus", "stroke", "sepsis", "paeds", "airway", "cardiac"],
    links: [
      { title: "EM Evidence Rundown — Issue 11", driveId: "1W5u1q4MQ_6xuPqdCAEnUMW-4PqgppbbU", audioId: "1aBLNMe-dwaTsSnN7SurLuyGjLAnWIppg" }
    ]
  },
  {
    date: "30 Apr 2026",
    label: "EM Evidence Rundown — Issue 10 + Anaesthetics & ICU Evidence Rundown — May 2026 + PHEM Evidence Rundown — May 2026",
    tags: ["sepsis", "airway", "resus", "cardiac", "trauma", "paeds", "safety"],
    links: [
      { title: "EM Evidence Rundown — Issue 10", driveId: "1rH82sJmngV6qVosYVJ6CeTVWe0OYw0RF" },
      { title: "Anaesthetics & ICU Evidence Rundown — May 2026", driveId: "1IIfC6NbsyUpFKrh0Og4Kzcjv6co1WJFO" },
      { title: "PHEM Evidence Rundown — May 2026", driveId: "10L-KCrjHLdpePs0OgkoTxq698d4QpUDy" }
    ]
  },
  {
    date: "23 Apr 2026",
    label: "EM Evidence Rundown — Issue 9",
    tags: ["cardiac", "stroke", "sepsis", "resus", "paeds", "airway"],
    links: [
      { title: "EM Evidence Rundown — Issue 9", driveId: "13U0WNszudqXVOUiwyHzL6xG8sxxezkVR" }
    ]
  },
  {
    date: "16 Apr 2026",
    label: "EM Evidence Rundown — Issue 7 (Final)",
    tags: ["resus", "airway", "stroke", "sepsis", "paeds", "safety"],
    links: [
      { title: "EM Evidence Rundown — Issue 7 (Final)", driveId: "1JYbAuyVX_i4X--aSPew83yhhVho912cy" }
    ]
  },
  {
    date: "9 Apr 2026",
    label: "EM Evidence Rundown — Issue 5",
    tags: ["resus", "sepsis", "stroke", "paeds"],
    links: [
      { title: "EM Evidence Rundown — Issue 5", driveId: "1__9-VSlzUVur9-CbZqQpI1pCO5J9hEe-" }
    ]
  },
  {
    date: "3 Apr 2026",
    label: "April 2026",
    tags: ["airway", "sepsis", "trauma", "cardiac", "resus", "paeds"],
    links: [
      { title: "EM Evidence Rundown — Issue 4", driveId: "1kbjocLoOfZzU7g7hnbTdlGcu-MR4nkhN" },
      { title: "Anaesthetics & ICU Evidence Rundown — April 2026", driveId: "1bFP0T7J829m386cf6f2lK7RXFBXBZxVg" },
      { title: "PHEM Evidence Rundown — April 2026", driveId: "1OYpPE4mY2AEAimJsjQJBo6HCofc-ekz1" }
    ]
  },
  {
    date: "2 Apr 2026",
    label: "Early April 2026",
    tags: ["airway", "resus", "trauma"],
    links: [
      { title: "Anaesthetics & ICU Evidence Rundown", driveId: "1wLP_sv8rcpJo2rROiFm66CVevN04kbRM" },
      { title: "PHEM Evidence Rundown", driveId: "1eMPha3GrJk_RC31p-VGTXNFcsjCOvznV" }
    ]
  },
  {
    date: "16 Mar 2026",
    label: "Mid March 2026",
    tags: ["resus", "trauma", "airway"],
    links: [
      { title: "PHEM Q1 2026 Quarterly", driveId: "1eVlEqxECiDFy4F-aFT5XC4d9FaO5Pyrh" }
    ]
  },
  {
    date: "15 Mar 2026",
    label: "EM Evidence Rundown (v3) + Anaesthetics & ICU Evidence Rundown (v3)",
    tags: ["airway", "sepsis", "cardiac"],
    links: [
      { title: "EM Evidence Rundown (v3)", driveId: "1K5n8VvhZxb9N3EkkoZgOBvDck-7uaBQF" },
      { title: "Anaesthetics & ICU Evidence Rundown (v3)", driveId: "1e26KWCDHAm5PJ6XL9EEzG94_bykEAumy" }
    ]
  },
  {
    date: "14 Mar 2026",
    label: "EM Evidence Rundown + Anaesthetics & ICU Evidence Rundown",
    tags: ["airway", "sepsis"],
    links: [
      { title: "EM Evidence Rundown", driveId: "1AMQr_qyWtUqGC06oc6OlZh7xJZr0eYha" },
      { title: "Anaesthetics & ICU Evidence Rundown", driveId: "1t8Cb4oLLIomrR2Uk6sZ0jhiVsiuOpocu" }
    ]
  },
  {
    date: "5 Mar 2026",
    label: "EM Evidence Rundown",
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

// Show every date as "2 Oct 2026", whatever format the entry was written in
const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function displayDate(s) {
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (iso) return `${+iso[3]} ${SHORT_MONTHS[+iso[2] - 1]} ${iso[1]}`;
    const long = /^(\d{1,2}) ([A-Za-z]{3})[A-Za-z]* (\d{4})$/.exec(s);
    if (long) return `${long[1]} ${long[2][0].toUpperCase()}${long[2].slice(1, 3).toLowerCase()} ${long[3]}`;
    return s;
}

const displayTitle = t => t.replace(/\.pdf$/i, "");

function buildTimelineHTML(filtered) {
    if (filtered.length === 0) {
        return `<p class="empty-update">No updates available yet.</p>`;
    }
    return filtered.map(week => `
        <div class="update-week">
            <div class="update-date">${displayDate(week.date)}</div>
            <div class="update-links">
                ${week.links.map(link => `
                    <a href="https://drive.google.com/file/d/${link.driveId}/view?usp=sharing"
                       target="_blank" rel="noopener" class="sidebar-link">
                        ${docIcon}
                        ${displayTitle(link.title)}
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
