const puppeteer = require('puppeteer');

async function debugLogin() {
  console.log('🔍 Starting debug login session...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable detailed console logging
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`[BROWSER ${type.toUpperCase()}]:`, text);
    });
    
    page.on('pageerror', error => {
      console.error('[PAGE ERROR]:', error.message);
    });
    
    page.on('requestfailed', request => {
      console.error('[REQUEST FAILED]:', request.url(), request.failure()?.errorText);
    });
    
    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      if (status >= 400 || url.includes('api/')) {
        console.log(`[RESPONSE] ${status} ${url}`);
      }
    });
    
    console.log('📱 Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    console.log('🔗 Clicking "Create Account & Get Started" button...');
    await page.waitForSelector('.cta-button', { timeout: 10000 });
    await page.click('.cta-button');
    
    console.log('⏳ Waiting for login page to load...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    console.log('🎯 On login page. Waiting for Supabase Auth UI...');
    
    // Wait for auth form elements with extended timeout
    try {
      await page.waitForSelector('.supabase-auth-ui_ui', { timeout: 15000 });
      console.log('✅ Supabase Auth UI loaded');
      
      // Check for email field
      const emailField = await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      console.log('✅ Email field found');
      
      // Generate test credentials
      const testEmail = `debug-test-${Date.now()}@dreamseed.com`;
      const testPassword = 'DebugTest123!';
      
      console.log('📧 Test credentials:', testEmail);
      
      // Fill in the form
      console.log('⌨️  Filling in email...');
      await emailField.type(testEmail, { delay: 100 });
      
      console.log('⌨️  Looking for password field...');
      const passwordField = await page.waitForSelector('input[type="password"]', { timeout: 5000 });
      await passwordField.type(testPassword, { delay: 100 });
      
      console.log('📸 Taking screenshot before auth attempt...');
      await page.screenshot({ path: 'debug-before-auth.png' });
      
      // Look for sign up button
      console.log('🔍 Looking for auth buttons...');
      
      const buttons = await page.evaluate(() => {
        const allButtons = Array.from(document.querySelectorAll('button'));
        return allButtons.map(btn => ({
          text: btn.textContent?.trim(),
          type: btn.type,
          className: btn.className,
          disabled: btn.disabled
        }));
      });
      
      console.log('📊 Available buttons:', JSON.stringify(buttons, null, 2));
      
      // Try to find and click sign up button
      let authButton = null;
      try {
        authButton = await page.$('button[type="submit"]');
        if (!authButton) {
          authButton = await page.$('button:not([disabled])');
        }
      } catch (e) {
        console.log('⚠️  Could not find auth button:', e.message);
      }
      
      if (authButton) {
        console.log('🚀 Attempting to submit auth form...');
        
        // Start monitoring for auth state changes
        const authStatePromise = page.evaluate(() => {
          return new Promise((resolve) => {
            // Monitor for potential redirects or state changes
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;
            
            history.pushState = function(...args) {
              console.log('🔄 pushState called:', args);
              resolve({ type: 'pushState', args });
              return originalPushState.apply(this, args);
            };
            
            history.replaceState = function(...args) {
              console.log('🔄 replaceState called:', args);
              resolve({ type: 'replaceState', args });
              return originalReplaceState.apply(this, args);
            };
            
            // Also monitor for URL changes
            let currentUrl = window.location.href;
            const urlChecker = setInterval(() => {
              if (window.location.href !== currentUrl) {
                console.log('🔄 URL changed:', window.location.href);
                clearInterval(urlChecker);
                resolve({ type: 'urlChange', url: window.location.href });
              }
            }, 500);
            
            // Timeout after 30 seconds
            setTimeout(() => {
              clearInterval(urlChecker);
              resolve({ type: 'timeout' });
            }, 30000);
          });
        });
        
        // Click the auth button
        await authButton.click();
        console.log('✅ Auth button clicked, waiting for response...');
        
        // Wait for either auth state change or timeout
        const authResult = await authStatePromise;
        console.log('📊 Auth result:', authResult);
        
        // Take screenshot after auth attempt
        await page.screenshot({ path: 'debug-after-auth.png' });
        
        // Check current URL and page state
        const currentUrl = page.url();
        console.log('🎯 Current URL after auth:', currentUrl);
        
        if (currentUrl.includes('/customer-portal')) {
          console.log('✅ Successfully redirected to customer portal!');
        } else if (currentUrl.includes('/login')) {
          console.log('⚠️  Still on login page - checking for errors...');
          
          const errorCheck = await page.evaluate(() => {
            const errorElements = document.querySelectorAll('[role="alert"], .error, .supabase-auth-ui_ui .text-red-600');
            const errors = Array.from(errorElements).map(el => el.textContent?.trim());
            return {
              hasErrors: errors.length > 0,
              errors,
              loadingElements: document.querySelectorAll('.loading, [data-loading="true"]').length,
              pageText: document.body.innerText.substring(0, 500)
            };
          });
          
          console.log('❌ Error analysis:', JSON.stringify(errorCheck, null, 2));
        }
        
      } else {
        console.log('❌ No auth button found');
      }
      
    } catch (authError) {
      console.error('❌ Auth flow error:', authError.message);
      await page.screenshot({ path: 'debug-auth-error.png' });
    }
    
    console.log('\n🔍 Debug session complete. Browser left open for manual inspection...');
    console.log('📸 Screenshots saved: debug-before-auth.png, debug-after-auth.png');
    
    // Keep browser open for manual inspection
    // await browser.close();
    
  } catch (error) {
    console.error('❌ Debug session failed:', error.message);
    console.error(error.stack);
  }
}

debugLogin().catch(console.error);