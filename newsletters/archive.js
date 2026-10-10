// Renders the full newsletter archive on /newsletters/, with series and year filters.
// Data and helpers (updates, seriesOf, entryYear, displayDate, escapeText, icons) come from /updates.js.
(function () {
    "use strict";

    const list = document.getElementById("archiveList");
    const seriesButtons = document.getElementById("seriesFilter");
    const yearSelect = document.getElementById("yearFilter");
    const count = document.getElementById("archiveCount");
    if (!list || typeof updates === "undefined") return;

    let currentSeries = "all";
    let currentYear = "";

    const driveUrl = id => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view?usp=sharing`;

    // Series buttons, with a count each, in the order the SERIES list defines
    function buildSeriesButtons() {
        const counts = {};
        updates.forEach(u => { const k = seriesOf(u).key; counts[k] = (counts[k] || 0) + 1; });
        const buttons = [`<button type="button" class="filter-btn active" data-series="all" aria-pressed="true">All series <span class="archive-pill">${updates.length}</span></button>`];
        SERIES.forEach(s => {
            if (!counts[s.key]) return;
            buttons.push(`<button type="button" class="filter-btn" data-series="${s.key}" aria-pressed="false">${escapeText(s.name)} <span class="archive-pill">${counts[s.key]}</span></button>`);
        });
        seriesButtons.innerHTML = buttons.join("");
        seriesButtons.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-series]");
            if (!btn) return;
            seriesButtons.querySelectorAll("[data-series]").forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-pressed", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-pressed", "true");
            currentSeries = btn.dataset.series;
            render();
        });
    }

    function buildYearSelect() {
        const years = [...new Set(updates.map(entryYear).filter(Boolean))].sort((a, b) => b - a);
        yearSelect.innerHTML = `<option value="">All years</option>` + years.map(y => `<option value="${y}">${y}</option>`).join("");
        yearSelect.addEventListener("change", () => { currentYear = yearSelect.value; render(); });
    }

    function render() {
        const filtered = updates.filter(u =>
            (currentSeries === "all" || seriesOf(u).key === currentSeries) &&
            (currentYear === "" || String(entryYear(u)) === currentYear)
        );
        count.textContent = `${filtered.length} ${filtered.length === 1 ? "issue" : "issues"}`;

        if (filtered.length === 0) {
            list.innerHTML = `<p class="empty-update">No issues match those filters.</p>`;
            return;
        }

        // Group by month so a long list has landmarks
        const groups = [];
        filtered.forEach(u => {
            const d = displayDate(u.date);
            const month = d.split(" ").slice(1).join(" ");
            let g = groups[groups.length - 1];
            if (!g || g.month !== month) { g = { month, entries: [] }; groups.push(g); }
            g.entries.push(u);
        });

        list.innerHTML = groups.map(g => `
            <section class="archive-month">
                <h2 class="archive-month-title">${escapeText(g.month)}</h2>
                ${g.entries.map(u => {
                    const series = seriesOf(u);
                    // With one PDF, the title is the link: a second button with the same words added nothing
                    const single = u.links.length === 1;
                    const extras = u.htmlPath || u.links.some(l => l.audioId || l.htmlPath);
                    return `
                    <article class="archive-issue archive-series-${series.key}">
                        <div class="archive-issue-meta">
                            <span class="archive-issue-series">${escapeText(series.name)}</span>
                            <time class="archive-issue-date">${escapeText(displayDate(u.date))}</time>
                        </div>
                        ${single ? `
                        <h3 class="archive-issue-title"><a href="${driveUrl(u.links[0].driveId)}" target="_blank" rel="noopener" class="archive-issue-link">${escapeText(u.label)}<span class="archive-issue-format">PDF</span></a></h3>` : `
                        <h3 class="archive-issue-title">${escapeText(u.label)}</h3>`}
                        ${(!single || extras) ? `
                        <div class="archive-issue-links">
                            ${u.links.map(l => `
                                ${single ? "" : `<a href="${driveUrl(l.driveId)}" target="_blank" rel="noopener" class="sidebar-link">${docIcon}${escapeText(displayTitle(l.title))}</a>`}
                                ${l.audioId ? `<a href="${driveUrl(l.audioId)}" target="_blank" rel="noopener" class="sidebar-link sidebar-link-audio">${audioIcon}Audio summary</a>` : ""}
                                ${l.htmlPath ? `<a href="${escapeText(l.htmlPath)}" class="sidebar-link sidebar-link-html">Read on site<span class="visually-hidden">: ${escapeText(displayTitle(l.title))}</span> →</a>` : ""}
                            `).join("")}
                            ${u.htmlPath ? `<a href="${escapeText(u.htmlPath)}" class="sidebar-link sidebar-link-html">Read on site →</a>` : ""}
                        </div>` : ""}
                        ${(u.tags && u.tags.length) ? `<div class="update-tags">${u.tags.map(t => `<span class="update-tag">${escapeText(t)}</span>`).join("")}</div>` : ""}
                    </article>`;
                }).join("")}
            </section>
        `).join("");
    }

    buildSeriesButtons();
    buildYearSelect();
    render();
}());
