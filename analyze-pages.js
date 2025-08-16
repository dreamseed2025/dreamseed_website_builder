#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { dirname, basename, relative } from 'path';

async function analyzePages() {
  console.log('🔍 Analyzing all HTML pages for navigation system...\n');
  
  try {
    // Find all HTML files
    const htmlFiles = await glob('**/*.html', { 
      ignore: ['node_modules/**', '**/node_modules/**', '.git/**'] 
    });
    
    console.log(`Found ${htmlFiles.length} HTML pages`);
    
    const pageAnalysis = [];
    
    for (const file of htmlFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        const analysis = analyzeHtmlPage(file, content);
        pageAnalysis.push(analysis);
        
        console.log(`📄 ${analysis.path}`);
        console.log(`   Title: ${analysis.title}`);
        console.log(`   Category: ${analysis.category}`);
        console.log(`   Status: ${analysis.productionStatus}`);
        console.log(`   Score: ${analysis.productionScore}/10`);
        console.log(`   Issues: ${analysis.issues.join(', ') || 'None'}`);
        console.log('');
        
      } catch (error) {
        console.log(`❌ Failed to analyze ${file}: ${error.message}`);
      }
    }
    
    // Generate site map data
    const siteMap = {
      generatedAt: new Date().toISOString(),
      totalPages: pageAnalysis.length,
      categories: groupByCategory(pageAnalysis),
      pages: pageAnalysis.sort((a, b) => b.productionScore - a.productionScore)
    };
    
    // Save analysis to JSON file
    writeFileSync('site-analysis.json', JSON.stringify(siteMap, null, 2));
    console.log('💾 Site analysis saved to site-analysis.json');
    
    // Generate navigation config
    const navConfig = generateNavigationConfig(siteMap);
    writeFileSync('navigation-config.json', JSON.stringify(navConfig, null, 2));
    console.log('🧭 Navigation config saved to navigation-config.json');
    
    return siteMap;
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

function analyzeHtmlPage(filePath, content) {
  const title = extractTitle(content);
  const description = extractDescription(content);
  const category = categorizeByPath(filePath);
  const hasNavigation = content.includes('<nav') || content.includes('navbar');
  const hasHeader = content.includes('<header') || content.includes('<h1');
  const hasFooter = content.includes('<footer');
  const hasMetaTags = content.includes('<meta name="description"');
  const hasViewport = content.includes('viewport');
  const hasCSS = content.includes('<style') || content.includes('.css');
  const hasJS = content.includes('<script') || content.includes('.js');
  const isResponsive = content.includes('responsive') || content.includes('mobile') || hasViewport;
  const hasSupabase = content.includes('supabase');
  const hasVAPI = content.includes('vapi') || content.includes('VAPI');
  const hasAuth = content.includes('auth') || content.includes('login');
  
  // Calculate production readiness score
  let score = 0;
  const issues = [];
  
  // Basic structure (3 points)
  if (hasHeader) score += 1; else issues.push('Missing header');
  if (hasCSS) score += 1; else issues.push('No styling');
  if (hasViewport) score += 1; else issues.push('Not mobile-friendly');
  
  // Navigation (2 points)
  if (hasNavigation) score += 2; else issues.push('Missing navigation');
  
  // Content quality (2 points)
  if (title && title !== 'Untitled') score += 1; else issues.push('Poor title');
  if (hasMetaTags) score += 1; else issues.push('Missing meta tags');
  
  // Functionality (3 points)
  if (hasJS) score += 1; else issues.push('No interactivity');
  if (isResponsive) score += 1; else issues.push('Not responsive');
  if (hasFooter) score += 1; else issues.push('Missing footer');
  
  const status = score >= 8 ? '🟢 Production Ready' : 
                 score >= 6 ? '🟡 Needs Minor Fixes' : 
                 score >= 4 ? '🟠 Needs Major Work' : '🔴 Not Ready';
  
  return {
    path: filePath,
    relativePath: filePath,
    title: title || basename(filePath, '.html'),
    description: description || '',
    category,
    productionScore: score,
    productionStatus: status,
    issues,
    features: {
      hasNavigation,
      hasHeader,
      hasFooter,
      hasMetaTags,
      hasViewport,
      hasCSS,
      hasJS,
      isResponsive,
      hasSupabase,
      hasVAPI,
      hasAuth
    },
    lastModified: new Date().toISOString()
  };
}

function extractTitle(content) {
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();
  
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) return h1Match[1].trim();
  
  return null;
}

function extractDescription(content) {
  const metaMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (metaMatch) return metaMatch[1].trim();
  
  const pMatch = content.match(/<p[^>]*>([^<]{20,100})/i);
  if (pMatch) return pMatch[1].trim() + '...';
  
  return '';
}

function categorizeByPath(filePath) {
  if (filePath.includes('/auth/')) return 'Authentication';
  if (filePath.includes('dashboard')) return 'Dashboards';
  if (filePath.includes('voice') || filePath.includes('vapi') || filePath.includes('call')) return 'Voice/VAPI';
  if (filePath.includes('admin')) return 'Admin';
  if (filePath.includes('customer')) return 'Customer';
  if (filePath.includes('test') || filePath.includes('debug')) return 'Testing/Debug';
  if (filePath.includes('public/')) return 'Public Pages';
  if (filePath === 'index.html' || filePath.includes('home')) return 'Home';
  return 'Other';
}

function groupByCategory(pages) {
  const categories = {};
  pages.forEach(page => {
    if (!categories[page.category]) {
      categories[page.category] = [];
    }
    categories[page.category].push(page);
  });
  
  // Sort pages within each category by score
  Object.keys(categories).forEach(category => {
    categories[category].sort((a, b) => b.productionScore - a.productionScore);
  });
  
  return categories;
}

function generateNavigationConfig(siteMap) {
  const mainNav = [];
  
  // Primary navigation items
  const primaryPages = siteMap.pages.filter(p => 
    p.category === 'Home' || 
    (p.category === 'Voice/VAPI' && p.productionScore >= 6) ||
    (p.category === 'Dashboards' && p.productionScore >= 6) ||
    (p.category === 'Authentication' && p.productionScore >= 6)
  );
  
  // Group navigation by category
  const navCategories = {
    'Home': primaryPages.filter(p => p.category === 'Home'),
    'Voice Interface': primaryPages.filter(p => p.category === 'Voice/VAPI'),
    'Dashboards': primaryPages.filter(p => p.category === 'Dashboards'),
    'Authentication': primaryPages.filter(p => p.category === 'Authentication'),
  };
  
  // Remove empty categories
  Object.keys(navCategories).forEach(key => {
    if (navCategories[key].length === 0) {
      delete navCategories[key];
    }
  });
  
  return {
    primary: navCategories,
    secondary: siteMap.categories,
    breadcrumbs: true,
    search: true,
    productionFilter: true
  };
}

analyzePages().catch(console.error);