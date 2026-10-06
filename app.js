// DOM Elements
const newToolsGrid = document.getElementById('newToolsGrid');
const newToolsWrapper = document.getElementById('newToolsWrapper');
const toolsGrid = document.getElementById('toolsGrid');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
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
const darkModeToggle = document.getElementById('darkModeToggle');
const rootEl = document.documentElement;

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
    threshold: 0.3,
    ignoreLocation: true
};
let fuse = null;

// Plain substring search, used if Fuse.js fails to load so the tool list still works
function simpleSearch(term) {
    const q = term.toLowerCase();
    return tools
        .filter(t => [t.name, t.description, t.category, ...t.tags].some(v => v.toLowerCase().includes(q)))
        .map(item => ({ item }));
}

// Dark Mode Logic (theme-init.js has already applied the saved or device setting)
if (darkModeToggle) {
    darkModeToggle.setAttribute('aria-pressed', String(rootEl.classList.contains('dark-mode')));
    darkModeToggle.addEventListener('click', () => {
        const isDark = rootEl.classList.toggle('dark-mode');
        darkModeToggle.setAttribute('aria-pressed', String(isDark));
        try {
            localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        } catch (e) { /* storage blocked */ }
    });
}

// Populate Tag Filter Dropdown dynamically based on frequency
function populateTagFilter() {
    const tagCounts = {};
    tools.forEach(tool => {
        tool.tags.forEach(tag => {
            const lowerTag = tag.toLowerCase();
            tagCounts[lowerTag] = (tagCounts[lowerTag] || 0) + 1;
        });
    });
    
    const sortedByFrequency = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a] || a.localeCompare(b));
    const sortedTags = Object.keys(tagCounts).sort();
    
    tagFilter.innerHTML = '<option value="">Filter by Tag (Any)</option>';
    
    const priorityTags = sortedByFrequency.slice(0, 5);
    
    const priorityGroup = document.createElement('optgroup');
    priorityGroup.label = "Common Filters";
    priorityTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
        priorityGroup.appendChild(option);
    });
    tagFilter.appendChild(priorityGroup);

    const allGroup = document.createElement('optgroup');
    allGroup.label = "All Tags";
    sortedTags.forEach(tag => {
        if (!priorityTags.includes(tag)) {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
            allGroup.appendChild(option);
        }
    });
    tagFilter.appendChild(allGroup);
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

function createToolCard(tool, isSmall = false) {
    const icon = icons[tool.icon] || icons.procedure;
    const featuredClass = tool.featured ? 'featured' : '';
    const betaBadge = tool.beta ? '<span class="beta-badge">BETA</span>' : '';
    const smallClass = isSmall ? 'small-card' : '';
    const name = escapeHtml(tool.name);
    const newTab = tool.openInNewTab ? 'true' : 'false';

    return `
        <div class="tool-card ${featuredClass} ${smallClass}" data-category="${escapeHtml(tool.category)}" data-tags="${escapeHtml(tool.tags.join(' '))}" data-tool-id="${escapeHtml(tool.id)}">
            ${betaBadge}
            <div class="tool-screenshot">
                <img src="${escapeHtml(tool.screenshot)}" alt="" loading="lazy">
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
                <a href="${escapeHtml(tool.url)}" target="_blank" rel="noopener" class="tool-link" data-url="${escapeHtml(tool.url)}" data-name="${name}" data-new-tab="${newTab}" aria-label="Launch ${name}">
                    Launch Tool
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
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

function renderTools() {
    const isDefaultView = currentCategory === 'all' && searchTerm === '' && currentTag === '';

    toolsGrid.innerHTML = '';
    noResults.style.display = 'none';

    if (isDefaultView) {
        if (newToolsWrapper) newToolsWrapper.style.display = 'block';
        toolsGrid.style.display = 'block'; 
        toolsGrid.classList.remove('tools-grid-layout');

        const categories = [
            'Bedside Aids',
            'Simulation',
            'Education & Advisory'
        ];

        categories.forEach(category => {
            const categoryTools = tools.filter(t => t.category === category);
            
            if (categoryTools.length > 0) {
                const sectionHeader = document.createElement('h3');
                sectionHeader.className = 'category-section-title';
                sectionHeader.textContent = category;
                
                if(category === 'Bedside Aids') sectionHeader.style.color = '#dc2626';
                if(category === 'Simulation') sectionHeader.style.color = '#7c3aed';
                if(category === 'Education & Advisory') sectionHeader.style.color = '#2563a8';

                toolsGrid.appendChild(sectionHeader);

                const sectionGrid = document.createElement('div');
                sectionGrid.className = 'tools-grid-layout';
                sectionGrid.innerHTML = categoryTools.map(tool => createToolCard(tool)).join('');
                toolsGrid.appendChild(sectionGrid);
            }
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
            const fuseResults = fuse ? fuse.search(searchTerm) : simpleSearch(searchTerm);
            const searchHits = new Set(fuseResults.map(r => r.item.id));
            filteredTools = filteredTools.filter(tool => searchHits.has(tool.id));
        }

        if (filteredTools.length === 0) {
            toolsGrid.style.display = 'none';
            noResults.style.display = 'block';
        } else {
            toolsGrid.innerHTML = filteredTools.map(tool => createToolCard(tool)).join('');
        }
    }

    setTimeout(() => {
        const cards = document.querySelectorAll('.tool-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
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

// Show the icon fallback when a screenshot is missing
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG' && e.target.closest('.tool-screenshot')) {
        e.target.parentElement.classList.add('no-screenshot');
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

searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim();
    renderTools();
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
