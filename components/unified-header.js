/**
 * DreamSeed Unified Header & Navigation System
 * Automatically discovers pages and tracks production readiness
 * Updates on every commit with new pages
 */

class DreamSeedNavigation {
    constructor() {
        this.currentPath = window.location.pathname;
        this.siteAnalysis = null;
        this.navigationConfig = null;
        this.loadSiteData();
    }

    async loadSiteData() {
        try {
            // Load site analysis data
            const analysisResponse = await fetch('/site-analysis.json');
            if (analysisResponse.ok) {
                this.siteAnalysis = await analysisResponse.json();
            }

            // Load navigation config
            const navResponse = await fetch('/navigation-config.json');
            if (navResponse.ok) {
                this.navigationConfig = await navResponse.json();
            }

            this.render();
        } catch (error) {
            console.warn('Navigation data not available, using fallback');
            this.renderFallback();
        }
    }

    render() {
        const header = this.createHeader();
        const nav = this.createNavigation();
        
        // Insert at top of body
        document.body.insertBefore(header, document.body.firstChild);
        
        // Add styles
        this.addStyles();
        
        // Add search functionality
        this.initializeSearch();
    }

    createHeader() {
        const header = document.createElement('header');
        header.className = 'dreamseed-header';
        header.innerHTML = `
            <div class="header-container">
                <div class="header-brand">
                    <a href="/" class="brand-link">
                        <span class="brand-icon">🌱</span>
                        <span class="brand-text">DreamSeed</span>
                    </a>
                    <span class="system-status">${this.getSystemStatus()}</span>
                </div>
                
                <nav class="header-nav">
                    ${this.createPrimaryNav()}
                </nav>
                
                <div class="header-actions">
                    ${this.createSearchBox()}
                    ${this.createProductionFilter()}
                    <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">☰</button>
                </div>
            </div>
            
            <div class="secondary-nav">
                ${this.createSecondaryNav()}
            </div>
            
            <div class="breadcrumbs">
                ${this.createBreadcrumbs()}
            </div>
        `;
        
        return header;
    }

    createPrimaryNav() {
        if (!this.navigationConfig?.primary) {
            return this.createFallbackNav();
        }

        let navItems = '';
        Object.entries(this.navigationConfig.primary).forEach(([category, pages]) => {
            if (pages.length === 0) return;
            
            const bestPage = pages[0]; // Highest scoring page in category
            const hasMultiple = pages.length > 1;
            
            navItems += `
                <div class="nav-item ${hasMultiple ? 'has-dropdown' : ''}">
                    <a href="${bestPage.relativePath}" class="nav-link">
                        ${this.getCategoryIcon(category)} ${category}
                        ${hasMultiple ? ' ▼' : ''}
                    </a>
                    ${hasMultiple ? this.createDropdown(pages) : ''}
                </div>
            `;
        });

        return navItems;
    }

    createDropdown(pages) {
        const items = pages.map(page => `
            <a href="${page.relativePath}" class="dropdown-item">
                <span class="page-title">${page.title}</span>
                <span class="page-score">${this.getScoreIcon(page.productionScore)}</span>
            </a>
        `).join('');

        return `<div class="dropdown-menu">${items}</div>`;
    }

    createSecondaryNav() {
        if (!this.siteAnalysis?.categories) return '';

        let sections = '';
        Object.entries(this.siteAnalysis.categories).forEach(([category, pages]) => {
            const productionReady = pages.filter(p => p.productionScore >= 7).length;
            const total = pages.length;
            
            sections += `
                <div class="nav-section">
                    <h4 class="section-title">
                        ${this.getCategoryIcon(category)} ${category}
                        <span class="section-stats">${productionReady}/${total}</span>
                    </h4>
                    <div class="section-pages">
                        ${pages.slice(0, 5).map(page => `
                            <a href="${page.relativePath}" 
                               class="page-link ${this.currentPath === page.relativePath ? 'active' : ''}"
                               title="${page.description}">
                                ${page.title} ${this.getScoreIcon(page.productionScore)}
                            </a>
                        `).join('')}
                        ${pages.length > 5 ? `<span class="more-pages">+${pages.length - 5} more</span>` : ''}
                    </div>
                </div>
            `;
        });

        return sections;
    }

    createBreadcrumbs() {
        const parts = this.currentPath.split('/').filter(p => p);
        if (parts.length === 0) return '<span class="breadcrumb-item">🏠 Home</span>';

        let breadcrumbs = '<a href="/" class="breadcrumb-item">🏠 Home</a>';
        let currentPath = '';
        
        parts.forEach((part, index) => {
            currentPath += '/' + part;
            const isLast = index === parts.length - 1;
            const displayName = part.replace('.html', '').replace(/-/g, ' ');
            
            if (isLast) {
                breadcrumbs += ` <span class="breadcrumb-separator">›</span> <span class="breadcrumb-item active">${displayName}</span>`;
            } else {
                breadcrumbs += ` <span class="breadcrumb-separator">›</span> <a href="${currentPath}" class="breadcrumb-item">${displayName}</a>`;
            }
        });

        return breadcrumbs;
    }

    createSearchBox() {
        return `
            <div class="search-box">
                <input type="text" 
                       id="page-search" 
                       placeholder="Search pages..."
                       onkeyup="searchPages(this.value)">
                <div id="search-results" class="search-results"></div>
            </div>
        `;
    }

    createProductionFilter() {
        return `
            <select id="production-filter" onchange="filterByProduction(this.value)" class="production-filter">
                <option value="all">All Pages</option>
                <option value="ready">Production Ready (8+)</option>
                <option value="good">Good Quality (6+)</option>
                <option value="needs-work">Needs Work (4+)</option>
                <option value="broken">Issues (<4)</option>
            </select>
        `;
    }

    createFallbackNav() {
        return `
            <div class="nav-item"><a href="/" class="nav-link">🏠 Home</a></div>
            <div class="nav-item"><a href="/voice-call-enhanced.html" class="nav-link">🎤 Voice Interface</a></div>
            <div class="nav-item"><a href="/dashboard.html" class="nav-link">📊 Dashboard</a></div>
            <div class="nav-item"><a href="/auth/login.html" class="nav-link">🔐 Login</a></div>
        `;
    }

    getSystemStatus() {
        if (!this.siteAnalysis) return '';
        
        const total = this.siteAnalysis.totalPages;
        const ready = this.siteAnalysis.pages.filter(p => p.productionScore >= 8).length;
        const percentage = Math.round((ready / total) * 100);
        
        const statusClass = percentage >= 80 ? 'status-excellent' :
                           percentage >= 60 ? 'status-good' :
                           percentage >= 40 ? 'status-fair' : 'status-poor';
        
        return `<span class="system-status ${statusClass}">${ready}/${total} Ready (${percentage}%)</span>`;
    }

    getCategoryIcon(category) {
        const icons = {
            'Home': '🏠',
            'Voice/VAPI': '🎤',
            'Dashboards': '📊',
            'Authentication': '🔐',
            'Customer': '👤',
            'Admin': '👑',
            'Testing/Debug': '🔧',
            'Public Pages': '🌐',
            'Other': '📄'
        };
        return icons[category] || '📄';
    }

    getScoreIcon(score) {
        if (score >= 8) return '🟢';
        if (score >= 6) return '🟡';
        if (score >= 4) return '🟠';
        return '🔴';
    }

    addStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .dreamseed-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                position: sticky;
                top: 0;
                z-index: 1000;
            }
            
            .header-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1rem 2rem;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .header-brand {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .brand-link {
                color: white;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1.5rem;
                font-weight: bold;
            }
            
            .brand-icon {
                font-size: 2rem;
            }
            
            .system-status {
                font-size: 0.8rem;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                background: rgba(255,255,255,0.2);
            }
            
            .status-excellent { background: rgba(34, 197, 94, 0.3) !important; }
            .status-good { background: rgba(251, 191, 36, 0.3) !important; }
            .status-fair { background: rgba(249, 115, 22, 0.3) !important; }
            .status-poor { background: rgba(239, 68, 68, 0.3) !important; }
            
            .header-nav {
                display: flex;
                gap: 2rem;
                align-items: center;
            }
            
            .nav-item {
                position: relative;
            }
            
            .nav-link {
                color: white;
                text-decoration: none;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                transition: background 0.3s;
            }
            
            .nav-link:hover {
                background: rgba(255,255,255,0.2);
            }
            
            .dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                background: white;
                color: #333;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                padding: 0.5rem 0;
                min-width: 250px;
                display: none;
                z-index: 1001;
            }
            
            .nav-item:hover .dropdown-menu {
                display: block;
            }
            
            .dropdown-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem 1rem;
                color: #333;
                text-decoration: none;
                transition: background 0.2s;
            }
            
            .dropdown-item:hover {
                background: #f3f4f6;
            }
            
            .header-actions {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .search-box {
                position: relative;
            }
            
            .search-box input {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 20px;
                width: 200px;
                background: rgba(255,255,255,0.2);
                color: white;
                placeholder-color: rgba(255,255,255,0.7);
            }
            
            .search-box input::placeholder {
                color: rgba(255,255,255,0.7);
            }
            
            .search-results {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                color: #333;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                max-height: 300px;
                overflow-y: auto;
                display: none;
                z-index: 1002;
            }
            
            .production-filter {
                padding: 0.5rem;
                border: none;
                border-radius: 8px;
                background: rgba(255,255,255,0.2);
                color: white;
            }
            
            .secondary-nav {
                background: rgba(255,255,255,0.1);
                padding: 1rem 2rem;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 2rem;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .nav-section {
                background: rgba(255,255,255,0.1);
                padding: 1rem;
                border-radius: 8px;
            }
            
            .section-title {
                margin: 0 0 0.5rem 0;
                font-size: 0.9rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .section-stats {
                font-size: 0.7rem;
                background: rgba(255,255,255,0.2);
                padding: 0.2rem 0.4rem;
                border-radius: 10px;
            }
            
            .section-pages {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }
            
            .page-link {
                color: rgba(255,255,255,0.9);
                text-decoration: none;
                font-size: 0.8rem;
                padding: 0.25rem 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: color 0.2s;
            }
            
            .page-link:hover, .page-link.active {
                color: white;
                font-weight: bold;
            }
            
            .breadcrumbs {
                background: rgba(255,255,255,0.1);
                padding: 0.5rem 2rem;
                font-size: 0.8rem;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .breadcrumb-item {
                color: rgba(255,255,255,0.9);
                text-decoration: none;
            }
            
            .breadcrumb-item:hover {
                color: white;
            }
            
            .breadcrumb-item.active {
                color: white;
                font-weight: bold;
            }
            
            .breadcrumb-separator {
                margin: 0 0.5rem;
                color: rgba(255,255,255,0.5);
            }
            
            .mobile-menu-toggle {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                display: none;
            }
            
            @media (max-width: 768px) {
                .header-nav {
                    display: none;
                }
                
                .mobile-menu-toggle {
                    display: block;
                }
                
                .search-box input {
                    width: 150px;
                }
                
                .secondary-nav {
                    grid-template-columns: 1fr;
                }
            }
            
            .more-pages {
                font-size: 0.7rem;
                color: rgba(255,255,255,0.6);
                font-style: italic;
            }
        `;
        
        document.head.appendChild(styles);
    }

    initializeSearch() {
        // Search functionality will be added here
        window.searchPages = (query) => {
            if (!this.siteAnalysis || !query.trim()) {
                document.getElementById('search-results').style.display = 'none';
                return;
            }
            
            const results = this.siteAnalysis.pages.filter(page => 
                page.title.toLowerCase().includes(query.toLowerCase()) ||
                page.description.toLowerCase().includes(query.toLowerCase()) ||
                page.category.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 10);
            
            const resultsHtml = results.map(page => `
                <a href="${page.relativePath}" class="dropdown-item">
                    <div>
                        <div class="page-title">${page.title}</div>
                        <div style="font-size: 0.7rem; color: #666;">${page.category}</div>
                    </div>
                    <span class="page-score">${this.getScoreIcon(page.productionScore)}</span>
                </a>
            `).join('');
            
            const searchResults = document.getElementById('search-results');
            searchResults.innerHTML = resultsHtml;
            searchResults.style.display = results.length > 0 ? 'block' : 'none';
        };
        
        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                document.getElementById('search-results').style.display = 'none';
            }
        });
    }
}

// Global functions
window.toggleMobileMenu = () => {
    const nav = document.querySelector('.header-nav');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
};

window.filterByProduction = (level) => {
    // This will be implemented for the sitemap page
    console.log('Filter by production level:', level);
};

// Initialize navigation when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new DreamSeedNavigation());
} else {
    new DreamSeedNavigation();
}