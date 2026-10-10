// DOM Elements
const newToolsGrid = document.getElementById('newToolsGrid');
const newToolsWrapper = document.getElementById('newToolsWrapper');
const toolsGrid = document.getElementById('toolsGrid');
const searchInput = document.getElementById('searchInput');
// Only the category buttons: the newsletter box reuses the .filter-btn style for its own buttons
const filterButtons = document.querySelectorAll('.filter-buttons .filter-btn');
const tagFilter = document.getElementById('tagFilter');
const noResults = document.getElementById('noResults');
const clearSearchBtn = document.getElementById('clearSearchBtn');

// Modal Elements
const toolModal = document.getElementById('toolModal');
const modalToolName = document.getElementById('modalToolName');
const toolIframe = document.getElementById('toolIframe');
const modalLoader = document.getElementById('modalLoader');
const modalError = document.getElementById('modalError'); 
const forceOpenBtn = document.getElementById('forceOpenBtn'); 
const closeModalBtn = document.getElementById('closeModal');
const openInNewTabBtn = document.getElementById('openInNewTab');
const modalBackdrop = document.querySelector('.tool-modal-backdrop');

// Theme Elements

// State
let currentCategory = 'all';
let currentTag = '';
let searchTerm = '';
let currentToolUrl = '';
let iframeTimeout = null;
let lastFocusedBeforeModal = null;

// Text from tools.js and updates.js goes into innerHTML, so escape it
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Initialize Fuse.js for Fuzzy Search
const fuseOptions = {
    keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
        { name: 'category', weight: 0.1 }
    ],
    threshold: 0.2,
    ignoreLocation: true
};
let fuse = null;

// Sections of the default tool list, in display order
const CATEGORIES = [
    { name: 'Bedside Aids', className: 'category-bedside', summary: 'Documentation, checklists and decision aids for use during patient care' },
    { name: 'Paediatrics', className: 'category-paediatrics', summary: 'Assessment tools, guidelines and quick references for children and young people' },
    { name: 'UHB Tools', className: 'category-uhb', summary: 'For University Hospitals Birmingham sites (BHH, GHH, QEHB, Solihull)' },
    { name: 'Simulation', className: 'category-simulation', summary: 'Simulators and games for training' },
    { name: 'Education & Advisory', className: 'category-education', summary: 'Guides, infographics and reference material' },
    { name: 'Journal Club', className: 'category-journal', summary: 'Summaries of key papers and trials' }
];

// Which sections a visitor has opened is remembered in their browser.
// First visit: only Bedside Aids is open, so the clinical tools are one scroll away.
const OPEN_SECTIONS_KEY = 'openToolSections';
const DEFAULT_OPEN_SECTIONS = ['Bedside Aids'];

function loadOpenSections() {
    try {
        const saved = JSON.parse(localStorage.getItem(OPEN_SECTIONS_KEY));
        return Array.isArray(saved) ? saved : DEFAULT_OPEN_SECTIONS;
    } catch (e) {
        return DEFAULT_OPEN_SECTIONS;
    }
}

function saveOpenSections(sections) {
    try {
        localStorage.setItem(OPEN_SECTIONS_KEY, JSON.stringify(sections.filter(s => s.open).map(s => s.dataset.category)));
    } catch (e) { /* storage blocked */ }
}

// Words people type that the tool text spells differently
const SYNONYMS = {
    paeds: ['paediatric', 'paediatrics', 'children', 'child'],
    paediatric: ['paeds', 'children', 'child'],
    kids: ['paediatric', 'children'],
    ventilator: ['ventilation', 'niv', 'hamilton', 'ventilated'],
    ventilation: ['ventilator', 'niv', 'hamilton'],
    niv: ['ventilator', 'ventilation', 'hamilton', 'cpap', 'bipap'],
    hamilton: ['ventilator', 'niv'],
    pe: ['pulmonary embolism', 'embolism'],
    mi: ['myocardial infarction', 'stemi', 'omi'],
    stemi: ['omi', 'myocardial infarction', 'ecg'],
    arrest: ['cardiac arrest', 'resuscitation', 'als'],
    resus: ['resuscitation', 'cardiac arrest', 'als'],
    sepsis: ['septic', 'lactate'],
    airway: ['intubation', 'rsi', 'laryngoscopy'],
    intubation: ['rsi', 'airway'],
    fluids: ['fluid', 'iv fluids', 'sid'],
    toxicology: ['overdose', 'poisoning', 'tox'],
    overdose: ['toxicology', 'poisoning'],
    pneumothorax: ['chest drain', 'thoracostomy'],
    fracture: ['fractures', 'orthopaedic', 'orthopaedics'],
    ortho: ['orthopaedic', 'orthopaedics', 'fracture'],
    mental: ['mental health', 'psychiatric', 'self-harm'],
    psych: ['mental health', 'psychiatric'],
    stroke: ['neurology', 'tia'],
    ultrasound: ['pocus', 'echo'],
    pocus: ['ultrasound', 'echo'],
    bloods: ['blood gas', 'abg', 'vbg'],
    gas: ['blood gas', 'abg', 'vbg'],
    seizure: ['fit', 'epilepsy', 'convulsion'],
    fit: ['seizure', 'epilepsy'],
    tbi: ['head injury', 'brain injury'],
    'head injury': ['tbi', 'brain injury'],
    uhb: ['bhh', 'ghh', 'qehb', 'solihull', 'heartlands', 'good hope']
};

const WORD_SPLIT = /[^a-z0-9/]+/;

function toolWords(tool) {
    return [tool.name, tool.description, tool.category, ...tool.tags]
        .join(' ')
        .toLowerCase()
        .split(WORD_SPLIT)
        .filter(Boolean);
}

// Ranked search: exact name, then a whole-word match, then a word starting with the term,
// then synonyms, then fuzzy matching (only for terms of four or more letters, because short
// terms such as "rsi" or "PE" fuzzy-match the middle of unrelated words).
function searchTools(term) {
    const q = term.toLowerCase().trim();
    if (!q) return [];
    const qWords = q.split(WORD_SPLIT).filter(Boolean);
    const synonyms = (SYNONYMS[q] || []).map(s => s.toLowerCase());
    const scored = new Map();

    function score(tool, points) {
        const current = scored.get(tool.id);
        if (current === undefined || points < current) scored.set(tool.id, points);
    }

    tools.forEach(tool => {
        const name = tool.name.toLowerCase();
        const text = toolWords(tool);
        const haystack = text.join(' ');
        const tags = tool.tags.map(t => t.toLowerCase());

        if (name === q || tags.includes(q)) { score(tool, 0); return; }
        if (name.split(WORD_SPLIT).includes(q)) { score(tool, 1); return; }
        if (qWords.length > 1 && haystack.includes(q)) { score(tool, 2); return; }
        if (qWords.every(w => text.includes(w))) { score(tool, 3); return; }
        if (q.length >= 3 && text.some(w => w.startsWith(q))) { score(tool, 4); return; }
        // A synonym in the name or tags outranks one buried in the description
        if (synonyms.some(s => name.includes(s) || tags.some(t => t.includes(s)))) { score(tool, 5); return; }
        if (synonyms.some(s => haystack.includes(s))) { score(tool, 6); return; }
    });

    if (q.length >= 4) {
        const fuzzy = fuse ? fuse.search(q) : [];
        fuzzy.forEach((r, i) => score(r.item, 10 + i));
    }

    return [...scored.entries()]
        .sort((a, b) => a[1] - b[1])
        .map(([id]) => ({ item: tools.find(t => t.id === id) }));
}

// Dark mode: theme-init.js applies the saved setting and wires the button

// Tag filter lists only tags shared by several tools: with 230 tags the full list was too long to use,
// and search already matches every tag
const TAG_FILTER_MIN_TOOLS = 3;
function populateTagFilter() {
    const tagCounts = {};
    const tagLabels = {};
    tools.forEach(tool => {
        tool.tags.forEach(tag => {
            const lowerTag = tag.toLowerCase();
            tagCounts[lowerTag] = (tagCounts[lowerTag] || 0) + 1;
            // Keep the written form ("DVLA", "acid-base") rather than forcing a case
            if (!tagLabels[lowerTag] || tag !== lowerTag) tagLabels[lowerTag] = tag;
        });
    });

    tagFilter.innerHTML = '<option value="">Filter by topic (any)</option>';
    Object.keys(tagCounts)
        .filter(tag => tagCounts[tag] >= TAG_FILTER_MIN_TOOLS)
        .sort((a, b) => a.localeCompare(b))
        .forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            const label = tagLabels[tag];
            option.textContent = `${label.charAt(0).toUpperCase() + label.slice(1)} (${tagCounts[tag]})`;
            tagFilter.appendChild(option);
        });
}

// Modal Functions
function openModal(toolName, toolUrl, opener) {
    lastFocusedBeforeModal = opener || document.activeElement;
    currentToolUrl = toolUrl;
    modalToolName.textContent = toolName;
    toolIframe.title = toolName;
    toolModal.classList.add('active');
    toolModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeModalBtn.focus();
    
    modalLoader.classList.remove('hidden');
    modalError.style.display = 'none';
    
    if (iframeTimeout) clearTimeout(iframeTimeout);
    iframeTimeout = setTimeout(() => {
        if (!modalLoader.classList.contains('hidden')) {
            modalLoader.classList.add('hidden');
            modalError.style.display = 'flex';
        }
    }, 5000);

    toolIframe.src = toolUrl;
    
    toolIframe.onload = function() {
        if (iframeTimeout) clearTimeout(iframeTimeout);
        if (modalError.style.display === 'none') {
            setTimeout(() => {
                modalLoader.classList.add('hidden');
            }, 300);
        }
    };
}

function closeModal() {
    toolModal.classList.remove('active');
    toolModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (iframeTimeout) clearTimeout(iframeTimeout);
    if (lastFocusedBeforeModal && document.contains(lastFocusedBeforeModal)) {
        lastFocusedBeforeModal.focus();
    }
    
    setTimeout(() => {
        toolIframe.src = '';
        modalLoader.classList.remove('hidden');
        modalError.style.display = 'none';
    }, 300);
}

// Modal Event Listeners
closeModalBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

openInNewTabBtn.addEventListener('click', () => {
    window.open(currentToolUrl, '_blank', 'noopener,noreferrer');
});

if (forceOpenBtn) {
    forceOpenBtn.addEventListener('click', () => {
        window.open(currentToolUrl, '_blank', 'noopener,noreferrer');
        closeModal();
    });
}

document.addEventListener('keydown', (e) => {
    const typing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName);
    if (e.key === '/' && !typing && !toolModal.classList.contains('active')) {
        e.preventDefault();
        searchInput.focus();
    }
    // Keep keyboard focus inside the open tool viewer
    if (e.key === 'Tab' && toolModal.classList.contains('active')) {
        const focusable = [openInNewTabBtn, closeModalBtn, toolIframe];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        } else if (!toolModal.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
        }
    }
    if (e.key === 'Escape') {
        if (toolModal.classList.contains('active')) {
            closeModal();
        } else if (document.activeElement === searchInput) {
            searchInput.blur();
        }
    }
});

// Focus that leaves the tool's own page (e.g. tabbing out of the iframe) comes back to the viewer
document.addEventListener('focusin', (e) => {
    if (toolModal.classList.contains('active') && !toolModal.contains(e.target)) {
        openInNewTabBtn.focus();
    }
});

document.querySelector('.tool-modal-container').addEventListener('click', (e) => {
    e.stopPropagation();
});

// Icon SVGs
const icons = {
    cardiac: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path><path d="M3.5 12h17"></path></svg>`,
    trauma: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>`,
    monitor: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    defib: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
    procedure: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    airway: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
    guidelines: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    assessment: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
};

// Bump when screenshots are replaced, so browsers fetch the new files instead of a stale or failed cached copy
const SCREENSHOT_VERSION = '2026-10-10b';

// "Reviewed Oct 2026" line for tools with a lastReviewed date ("2026-10-07"); flagged once the two-yearly review is overdue
const REVIEW_STALE_DAYS = 730;
function reviewedLabel(tool) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tool.lastReviewed || '');
    if (!m) return '';
    const when = Date.UTC(+m[1], +m[2] - 1, +m[3]);
    const label = `${MONTHS_SHORT[+m[2] - 1]} ${m[1]}`;
    const stale = (Date.now() - when) / 86400000 > REVIEW_STALE_DAYS;
    const by = tool.reviewedBy ? ` by ${escapeHtml(tool.reviewedBy)}` : '';
    return `<span class="tool-reviewed${stale ? ' tool-reviewed-stale' : ''}" title="Content last reviewed${by}">${stale ? 'Review due: last checked ' : 'Reviewed '}${label}</span>`;
}
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ARROW_ICON = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
// Tools that can't open in the on-page viewer say so with the usual "external" arrow
const NEW_TAB_ICON = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';

function createToolCard(tool, isSmall = false) {
    const icon = icons[tool.icon] || icons.procedure;
    const featuredClass = tool.featured ? 'featured' : '';
    const betaBadge = tool.beta ? '<span class="beta-badge">BETA</span>' : '';
    const smallClass = isSmall ? 'small-card' : '';
    const name = escapeHtml(tool.name);
    const newTab = tool.openInNewTab ? 'true' : 'false';
    const reviewed = reviewedLabel(tool);

    return `
        <div class="tool-card ${featuredClass} ${smallClass}" data-category="${escapeHtml(tool.category)}" data-tags="${escapeHtml(tool.tags.join(' '))}" data-tool-id="${escapeHtml(tool.id)}">
            ${betaBadge}
            <div class="tool-screenshot">
                <img src="${escapeHtml(tool.screenshot)}?v=${SCREENSHOT_VERSION}" alt="" loading="lazy">
                <div class="tool-screenshot-overlay" aria-hidden="true">
                    <div class="tool-icon-small">
                        ${icon}
                    </div>
                </div>
            </div>
            <div class="tool-card-content">
                <h3 class="tool-name">${name}</h3>
                <p class="tool-description">${escapeHtml(tool.description)}</p>
                <span class="tool-category">${escapeHtml(tool.category)}</span>
                ${reviewed}
                <a href="${escapeHtml(tool.url)}" target="_blank" rel="noopener" class="tool-link" data-url="${escapeHtml(tool.url)}" data-name="${name}" data-new-tab="${newTab}" aria-label="Launch Tool: ${name}${tool.openInNewTab ? ' (opens in a new tab)' : ''}">
                    Launch Tool
                    ${tool.openInNewTab ? NEW_TAB_ICON : ARROW_ICON}
                </a>
            </div>
        </div>
    `;
}

function renderNewTools() {
    const newTools = tools.filter(t => t.isNew);
    if (newTools.length > 0 && newToolsWrapper) {
        newToolsWrapper.style.display = 'block';
        newToolsGrid.innerHTML = newTools.map(tool => createToolCard(tool, true)).join('');
    } else if (newToolsWrapper) {
        newToolsWrapper.style.display = 'none';
    }
}

// "Search 77 tools" stays right as tools are added
if (searchInput) searchInput.placeholder = `Search ${tools.length} tools, e.g. RSI`;

const toolsHeading = document.getElementById('toolsHeading');
const toolsSubtitle = document.getElementById('toolsSubtitle');
const TOOLS_HEADING_DEFAULT = toolsHeading ? toolsHeading.textContent : '';
const TOOLS_SUBTITLE_DEFAULT = toolsSubtitle ? toolsSubtitle.textContent : '';

// While searching or filtering, the heading says what is shown and the latest-issue strip steps aside,
// so results sit straight under the filters
function updateToolsHeading(isDefaultView, count) {
    document.body.classList.toggle('tools-filtered', !isDefaultView);
    if (!toolsHeading || !toolsSubtitle) return;
    if (isDefaultView) {
        toolsHeading.textContent = TOOLS_HEADING_DEFAULT;
        toolsSubtitle.textContent = TOOLS_SUBTITLE_DEFAULT;
        return;
    }
    const noun = count === 1 ? 'tool' : 'tools';
    if (searchTerm !== '') {
        toolsHeading.textContent = 'Search results';
        toolsSubtitle.textContent = `${count} ${noun} matching “${searchTerm}”`;
    } else {
        toolsHeading.textContent = currentCategory === 'all' ? 'All tools' : currentCategory;
        toolsSubtitle.textContent = `${count} ${noun}${currentTag ? ` tagged “${currentTag}”` : ''}`;
    }
}

// Education & Advisory is long, so it is split under sub-headings (the group field in tools.js);
// a tool without a group goes under "Other"
const EDUCATION_GROUPS = [
    'Resus, cardiac & procedures',
    'Acid–base, metabolic & drugs',
    'Trauma, environment & other presentations',
    'Law, risk & evidence',
    'Training, AI & wellbeing'
];
function renderSectionBody(categoryName, categoryTools) {
    const grid = list => `<div class="tools-grid-layout">${list.map(tool => createToolCard(tool)).join('')}</div>`;
    if (categoryName !== 'Education & Advisory') return grid(categoryTools);
    const names = [...EDUCATION_GROUPS, 'Other'];
    return names.map(groupName => {
        const list = categoryTools.filter(t => (EDUCATION_GROUPS.includes(t.group) ? t.group : 'Other') === groupName);
        if (list.length === 0) return '';
        return `<h3 class="tool-group-title">${escapeHtml(groupName)} <span class="tool-group-count">${list.length}</span></h3>${grid(list)}`;
    }).join('');
}

function renderTools() {
    const isDefaultView = currentCategory === 'all' && searchTerm === '' && currentTag === '';

    toolsGrid.innerHTML = '';
    noResults.style.display = 'none';
    if (isDefaultView) updateToolsHeading(true);

    if (isDefaultView) {
        if (newToolsWrapper) newToolsWrapper.style.display = 'block';
        toolsGrid.style.display = 'block'; 
        toolsGrid.classList.remove('tools-grid-layout');

        const openSections = loadOpenSections();
        const sections = [];

        const controls = document.createElement('div');
        controls.className = 'category-controls';
        controls.innerHTML = `
            <button type="button" class="category-control-btn" data-action="expand">Expand all</button>
            <button type="button" class="category-control-btn" data-action="collapse">Collapse all</button>
        `;
        toolsGrid.appendChild(controls);

        CATEGORIES.forEach(({ name, className, summary }) => {
            // Featured tools first, otherwise the order in tools.js
            const categoryTools = tools.filter(t => t.category === name)
                .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
            if (categoryTools.length === 0) return;

            // Native <details>: keyboard and screen-reader support come for free
            const section = document.createElement('details');
            section.className = 'category-section';
            section.dataset.category = name;
            section.open = openSections.includes(name);

            const count = `${categoryTools.length} ${categoryTools.length === 1 ? 'tool' : 'tools'}`;
            section.innerHTML = `
                <summary class="category-section-title ${className}">
                    <span class="category-section-heading">
                        <span class="category-section-name">${escapeHtml(name)}</span>
                        <span class="category-section-summary">${escapeHtml(summary)}</span>
                    </span>
                    <span class="category-section-count">${count}</span>
                    <svg class="category-section-chevron" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                ${renderSectionBody(name, categoryTools)}
            `;
            section.addEventListener('toggle', () => saveOpenSections(sections));
            sections.push(section);
            toolsGrid.appendChild(section);
        });

        controls.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-control-btn');
            if (!btn) return;
            const open = btn.dataset.action === 'expand';
            sections.forEach(s => { s.open = open; });
            saveOpenSections(sections);
        });

    } else {
        if (newToolsWrapper) newToolsWrapper.style.display = 'none';
        toolsGrid.style.display = 'grid'; 
        toolsGrid.classList.add('tools-grid-layout');

        let filteredTools = tools.filter(tool => {
            const matchesCategory = currentCategory === 'all' || tool.category === currentCategory;
            const matchesTag = currentTag === '' || tool.tags.some(t => t.toLowerCase() === currentTag);
            return matchesCategory && matchesTag;
        });

        if (searchTerm !== '') {
            // Keep the search order so the best matches come first
            const results = searchTools(searchTerm);
            const rank = new Map(results.map((r, i) => [r.item.id, i]));
            filteredTools = filteredTools
                .filter(tool => rank.has(tool.id))
                .sort((a, b) => rank.get(a.id) - rank.get(b.id));
        }

        updateToolsHeading(false, filteredTools.length);

        if (filteredTools.length === 0) {
            toolsGrid.style.display = 'none';
            noResults.style.display = 'block';
        } else {
            toolsGrid.innerHTML = filteredTools.map(tool => createToolCard(tool)).join('');
        }
    }

    setTimeout(() => {
        // Stagger within each grid, capped so cards in a just-opened section don't lag
        document.querySelectorAll('.tools-grid-layout, .new-tools-grid').forEach(grid => {
            grid.querySelectorAll(':scope > .tool-card').forEach((card, index) => {
                card.style.animationDelay = `${Math.min(index, 8) * 0.05}s`;
            });
        });
    }, 50);
}

// Opens a tool in the in-page viewer on larger screens; on phones, for tools that
// can't be framed, or when the user asks for a new tab, the link's own target="_blank" applies
function handleToolActivation(link, e) {
    const wantsNewTab = e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1;
    if (wantsNewTab || link.dataset.newTab === 'true' || window.innerWidth < 768) return false;
    e.preventDefault();
    openModal(link.dataset.name, link.dataset.url, link);
    return true;
}

document.addEventListener('click', (e) => {
    const link = e.target.closest('.tool-card .tool-link[data-url]');
    if (link) {
        handleToolActivation(link, e);
        return;
    }
    // Clicking anywhere else on a card acts like its Launch Tool link
    const card = e.target.closest('.tool-card');
    if (card && !e.target.closest('a, button')) {
        const cardLink = card.querySelector('.tool-link[data-url]');
        if (cardLink && !handleToolActivation(cardLink, e)) {
            window.open(cardLink.dataset.url, '_blank', 'noopener');
        }
    }
});

// If a screenshot fails, retry once past any cache; show the icon fallback only if that fails too
document.addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName === 'IMG' && img.closest('.tool-screenshot')) {
        if (!img.dataset.retried) {
            img.dataset.retried = 'true';
            img.src = img.getAttribute('src').split('?')[0] + '?retry=' + Date.now();
            return;
        }
        img.parentElement.classList.add('no-screenshot');
    }
}, true);

// Event Listeners

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
        currentCategory = button.getAttribute('data-category');
        renderTools();
    });
});

tagFilter.addEventListener('change', (e) => {
    currentTag = e.target.value.toLowerCase();
    renderTools();
});

// On phones, lift the search box to the top of the screen so results show above the keyboard
searchInput.addEventListener('focus', () => {
    if (window.matchMedia('(max-width: 768px)').matches && searchInput.getBoundingClientRect().top > 80) {
        searchInput.scrollIntoView({ block: 'start' });
    }
});

searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim();
    renderTools();
    // Pre-fill the suggestion email with what was searched for
    const suggest = document.getElementById('suggestToolLink');
    if (suggest) {
        const subject = searchTerm ? `New Tool Suggestion: ${searchTerm}` : 'New Tool Suggestion';
        suggest.href = `mailto:emevidence999@gmail.com?subject=${encodeURIComponent(subject)}`;
    }
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    renderTools();
    searchInput.focus();
});

// Load Latest Newsletter
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// Accepts "2026-10-02", "2 Oct 2026" or "2 October 2026"; returns a timestamp or NaN
function parseEntryDate(s) {
    let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
    m = /^(\d{1,2}) ([A-Za-z]{3})[A-Za-z]* (\d{4})$/.exec(s || '');
    if (m) return Date.UTC(+m[3], MONTHS.indexOf(m[2].toLowerCase()), +m[1]);
    return NaN;
}

function isWeeklyEmRundown(link) {
    const t = link.title.toLowerCase();
    return t.includes('em evidence rundown') && !t.includes('anaesthetic') && !t.includes('phem');
}

function loadLatestNewsletter() {
    if (typeof updates === 'undefined' || updates.length === 0) return;

    // Newest weekly EM issue by date, so the order of updates.js doesn't matter
    let latest = null;
    let emLink = null;
    let latestTime = -Infinity;
    updates.forEach((entry, index) => {
        const found = entry.links.find(isWeeklyEmRundown);
        if (!found) return;
        const time = parseEntryDate(entry.date);
        // Undated entries rank by position (earlier in the file = newer)
        const rank = isNaN(time) ? -index : time;
        if (latest === null || rank > latestTime) {
            latest = entry;
            emLink = found;
            latestTime = rank;
        }
    });
    if (!emLink) return;

    const linkOut = document.getElementById('latestNewsletterLink');
    const dateText = document.getElementById('latestNewsletterDate');
    const titleText = document.getElementById('latestNewsletterTitle');
    const audioBtn = document.getElementById('latestNewsletterAudio');
    const previewBtn = document.getElementById('latestNewsletterPreviewBtn');
    const embed = document.getElementById('latestNewsletterEmbed');

    if (linkOut) linkOut.href = `https://drive.google.com/file/d/${encodeURIComponent(emLink.driveId)}/view?usp=sharing`;
    if (dateText) dateText.textContent = latest.date;
    if (titleText) titleText.textContent = latest.label;

    if (audioBtn) {
        if (emLink.audioId) {
            audioBtn.href = `https://drive.google.com/file/d/${encodeURIComponent(emLink.audioId)}/view?usp=sharing`;
            audioBtn.hidden = false;
        } else {
            audioBtn.hidden = true;
        }
    }

    // The Drive viewer is only loaded on request
    if (previewBtn && embed) {
        previewBtn.addEventListener('click', () => {
            const opening = embed.hidden;
            if (opening && !embed.querySelector('iframe')) {
                const frame = document.createElement('iframe');
                frame.src = `https://drive.google.com/file/d/${encodeURIComponent(emLink.driveId)}/preview`;
                frame.title = `${latest.label} (PDF preview)`;
                frame.loading = 'lazy';
                embed.appendChild(frame);
            }
            embed.hidden = !opening;
            previewBtn.setAttribute('aria-expanded', String(opening));
            previewBtn.textContent = opening ? 'Hide preview' : 'Preview here';
        });
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Fuse !== 'undefined') {
        fuse = new Fuse(tools, fuseOptions);
    }
    populateTagFilter();
    renderNewTools();
    renderTools();
    loadLatestNewsletter();

    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}
