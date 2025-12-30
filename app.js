// DOM Elements
const toolsGrid = document.getElementById('toolsGrid');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const noResults = document.getElementById('noResults');

// Modal Elements
const toolModal = document.getElementById('toolModal');
const modalToolName = document.getElementById('modalToolName');
const toolIframe = document.getElementById('toolIframe');
const modalLoader = document.getElementById('modalLoader');
const modalError = document.getElementById('modalError'); // New error container
const forceOpenBtn = document.getElementById('forceOpenBtn'); // New button
const closeModalBtn = document.getElementById('closeModal');
const openInNewTabBtn = document.getElementById('openInNewTab');
const modalBackdrop = document.querySelector('.tool-modal-backdrop');

// Theme Elements
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// State
let currentFilter = 'all';
let searchTerm = '';
let currentToolUrl = '';
let iframeTimeout = null; // Store timeout ID

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

// Modal Functions
function openModal(toolName, toolUrl) {
    currentToolUrl = toolUrl;
    modalToolName.textContent = toolName;
    toolModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Reset state
    modalLoader.classList.remove('hidden');
    modalError.style.display = 'none';
    
    // Set 5-second timeout for iframe loading
    if (iframeTimeout) clearTimeout(iframeTimeout);
    iframeTimeout = setTimeout(() => {
        // If still loading after 5 seconds, show option to open directly
        if (!modalLoader.classList.contains('hidden')) {
            modalLoader.classList.add('hidden');
            modalError.style.display = 'flex';
        }
    }, 5000);

    // Load iframe
    toolIframe.src = toolUrl;
    
    // Hide loader when iframe loads
    toolIframe.onload = function() {
        if (iframeTimeout) clearTimeout(iframeTimeout);
        // Only hide if we haven't already shown the error
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
    
    // Clear iframe after animation
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
    // Search shortcut '/'
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Escape to clear search or close modal
    if (e.key === 'Escape') {
        if (toolModal.classList.contains('active')) {
            closeModal();
        } else if (document.activeElement === searchInput) {
            searchInput.blur();
        }
    }
});

// Prevent modal close when clicking inside modal content
document.querySelector('.tool-modal-container').addEventListener('click', (e) => {
    e.stopPropagation();
});

// Icon SVGs for different tool types
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

// Create tool card HTML
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

// Render tools to the grid
function renderTools() {
    // Logic for "Sectioned" view vs "Grid" view
    // Only show sections if we are on 'All Tools' and NOT searching
    const isDefaultView = currentFilter === 'all' && searchTerm === '';

    toolsGrid.innerHTML = '';
    noResults.style.display = 'none';

    if (isDefaultView) {
        // SECTIONED VIEW: Render distinct sections with titles
        toolsGrid.style.display = 'block'; // Disable the main grid to allow stacking sections
        toolsGrid.classList.remove('tools-grid-layout');

        // Updated categories list matching tools.js
        const categories = [
            'Resus & Trauma',
            'Paediatrics',
            'Clinical Support',
            'Simulation',
            'Education & Advisory'
        ];

        categories.forEach(category => {
            const categoryTools = tools.filter(t => t.category === category);
            
            if (categoryTools.length > 0) {
                // 1. Create Section Title
                const sectionHeader = document.createElement('h3');
                sectionHeader.className = 'category-section-title';
                sectionHeader.textContent = category;
                toolsGrid.appendChild(sectionHeader);

                // 2. Create Grid Container for this section
                const sectionGrid = document.createElement('div');
                sectionGrid.className = 'tools-grid-layout'; // Use the grid styling
                sectionGrid.innerHTML = categoryTools.map(tool => createToolCard(tool)).join('');
                toolsGrid.appendChild(sectionGrid);
            }
        });
        
    } else {
        // FILTERED/SEARCHED VIEW: Render one mixed grid
        toolsGrid.style.display = 'grid'; // Enable main grid
        toolsGrid.classList.add('tools-grid-layout');

        const filteredTools = tools.filter(tool => {
            const matchesCategory = currentFilter === 'all' || tool.category === currentFilter;
            const matchesSearch = searchTerm === '' || 
                tool.name.toLowerCase().includes(searchTerm) ||
                tool.description.toLowerCase().includes(searchTerm) ||
                tool.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                tool.category.toLowerCase().includes(searchTerm);
            
            return matchesCategory && matchesSearch;
        });

        if (filteredTools.length === 0) {
            toolsGrid.style.display = 'none';
            noResults.style.display = 'block';
        } else {
            toolsGrid.innerHTML = filteredTools.map(tool => createToolCard(tool)).join('');
        }
    }

    // Add click handlers to tool cards and links
    setTimeout(() => {
        attachToolClickHandlers();
        
        // Stagger animation
        const cards = document.querySelectorAll('.tool-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
        });
    }, 50);
}

// Attach click handlers to tool cards and links
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
    
    // Also allow clicking the card itself to open
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking the link itself
            if (e.target.closest('.tool-link')) return;
            
            const link = card.querySelector('.tool-link');
            const url = link.getAttribute('data-url');
            const name = link.getAttribute('data-name');
            openModal(name, url);
        });
    });
}

// Handle filter button clicks
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Update current filter
        currentFilter = button.getAttribute('data-category');
        
        // Re-render tools
        renderTools();
    });
});

// Handle search input
searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase().trim();
    renderTools();
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Update active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderTools();
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}
