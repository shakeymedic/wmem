// DOM Elements
const toolsGrid = document.getElementById('toolsGrid');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const tagFilter = document.getElementById('tagFilter'); // New Dropdown
const noResults = document.getElementById('noResults');
const clearSearchBtn = document.getElementById('clearSearchBtn'); // New Button

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
const body = document.body;

// State
let currentCategory = 'all';
let currentTag = '';
let searchTerm = '';
let currentToolUrl = '';
let iframeTimeout = null;

// Initialize Fuse.js for Fuzzy Search
const fuseOptions = {
    keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
        { name: 'category', weight: 0.1 }
    ],
    threshold: 0.4, // Sensitivity (0.0 = perfect match, 1.0 = match anything)
    ignoreLocation: true
};
let fuse; // Initialized in DOMContentLoaded

// Dark Mode Logic
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });
}

// Populate Tag Filter Dropdown
function populateTagFilter() {
    const allTags = new Set();
    tools.forEach(tool => {
        tool.tags.forEach(tag => allTags.add(tag.toLowerCase()));
    });
    
    // Sort alphabetically
    const sortedTags = Array.from(allTags).sort();
    
    // Clear existing options except first
    tagFilter.innerHTML = '<option value="">Filter by Tag (Any)</option>';
    
    // Add common high-level tags first for convenience
    const priorityTags = ['paediatrics', 'trauma', 'cardiac', 'resuscitation', 'sedation'];
    
    // Add priority tags group
    const priorityGroup = document.createElement('optgroup');
    priorityGroup.label = "Common Filters";
    priorityTags.forEach(tag => {
        if (sortedTags.includes(tag)) {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
            priorityGroup.appendChild(option);
        }
    });
    tagFilter.appendChild(priorityGroup);

    // Add all tags group
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
function openModal(toolName, toolUrl) {
    // Mobile Check - Open in new tab if mobile
    if (window.innerWidth < 768) {
        window.open(toolUrl, '_blank', 'noopener,noreferrer');
        return;
    }

    currentToolUrl = toolUrl;
    modalToolName.textContent = toolName;
    toolModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
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
    document.body.style.overflow = '';
    
    if (iframeTimeout) clearTimeout(iframeTimeout);
    
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

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
    if (e.key === 'Escape') {
        if (toolModal.classList.contains('active')) {
            closeModal();
        } else if (document.activeElement === searchInput) {
            searchInput.blur();
        }
    }
});

document.querySelector('.tool-modal-container').addEventListener('click', (e) => {
    e.stopPropagation();
});

// Icon SVGs (No changes here, keeping standard list)
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

function createToolCard(tool) {
    const icon = icons[tool.icon] || icons.procedure;
    const featuredClass = tool.featured ? 'featured' : '';
    const betaBadge = tool.beta ? '<span class="beta-badge">BETA</span>' : '';
    
    return `
        <div class="tool-card ${featuredClass}" data-category="${tool.category}" data-tags="${tool.tags.join(' ')}" data-tool-id="${tool.id}">
            ${betaBadge}
            <div class="tool-screenshot">
                <img src="${tool.screenshot}" alt="${tool.name} screenshot" onerror="this.parentElement.classList.add('no-screenshot')">
                <div class="tool-screenshot-overlay" aria-hidden="true">
                    <div class="tool-icon-small">
                        ${icon}
                    </div>
                </div>
            </div>
            <div class="tool-card-content">
                <h3 class="tool-name">${tool.name}</h3>
                <p class="tool-description">${tool.description}</p>
                <span class="tool-category">${tool.category}</span>
                <a href="#" class="tool-link" data-url="${tool.url}" data-name="${tool.name}">
                    Launch Tool
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </a>
            </div>
        </div>
    `;
}

function renderTools() {
    // Only show "Sectioned" view if showing 'all', no search text, and no tag filter
    const isDefaultView = currentCategory === 'all' && searchTerm === '' && currentTag === '';

    toolsGrid.innerHTML = '';
    noResults.style.display = 'none';

    if (isDefaultView) {
        // SECTIONED VIEW
        toolsGrid.style.display = 'block'; 
        toolsGrid.classList.remove('tools-grid-layout');

        // New Category List
        const categories = [
            'Live Tools',
            'Simulation',
            'Education & Advisory'
        ];

        categories.forEach(category => {
            const categoryTools = tools.filter(t => t.category === category);
            
            if (categoryTools.length > 0) {
                const sectionHeader = document.createElement('h3');
                sectionHeader.className = 'category-section-title';
                sectionHeader.textContent = category;
                
                // Add specific color classes if needed (optional)
                if(category === 'Live Tools') sectionHeader.style.color = '#dc2626'; // Red
                if(category === 'Simulation') sectionHeader.style.color = '#7c3aed'; // Purple
                if(category === 'Education & Advisory') sectionHeader.style.color = '#2563a8'; // Blue

                toolsGrid.appendChild(sectionHeader);

                const sectionGrid = document.createElement('div');
                sectionGrid.className = 'tools-grid-layout';
                sectionGrid.innerHTML = categoryTools.map(tool => createToolCard(tool)).join('');
                toolsGrid.appendChild(sectionGrid);
            }
        });
        
    } else {
        // FILTERED/SEARCHED VIEW
        toolsGrid.style.display = 'grid'; 
        toolsGrid.classList.add('tools-grid-layout');

        // 1. First filtered by Category & Tag
        let filteredTools = tools.filter(tool => {
            const matchesCategory = currentCategory === 'all' || tool.category === currentCategory;
            const matchesTag = currentTag === '' || tool.tags.some(t => t.toLowerCase() === currentTag);
            return matchesCategory && matchesTag;
        });

        // 2. Then filtered by Search (using Fuse.js)
        if (searchTerm !== '') {
            const fuseResults = fuse.search(searchTerm);
            // Fuse returns [{item, refIndex, score}, ...]. Map back to tools.
            // But we must intersect with previously filtered tools
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
        attachToolClickHandlers();
        const cards = document.querySelectorAll('.tool-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
        });
    }, 50);
}

function attachToolClickHandlers() {
    const toolLinks = document.querySelectorAll('.tool-link');
    toolLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const url = link.getAttribute('data-url');
            const name = link.getAttribute('data-name');
            openModal(name, url);
        });
    });
    
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.tool-link')) return;
            const link = card.querySelector('.tool-link');
            const url = link.getAttribute('data-url');
            const name = link.getAttribute('data-name');
            openModal(name, url);
        });
    });
}

// Event Listeners

// Filter Buttons
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentCategory = button.getAttribute('data-category');
        renderTools();
    });
});

// Tag Filter
tagFilter.addEventListener('change', (e) => {
    currentTag = e.target.value.toLowerCase();
    renderTools();
});

// Search Input
searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim();
    renderTools();
});

// Clear Search Button
clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    // Reset filters too? Usually clear search means clear text.
    // Let's keep filters as is, just clear text.
    renderTools();
    searchInput.focus();
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Init Fuse
    fuse = new Fuse(tools, fuseOptions);
    
    // Init Tags
    populateTagFilter();
    
    // Initial Render
    renderTools();
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}
