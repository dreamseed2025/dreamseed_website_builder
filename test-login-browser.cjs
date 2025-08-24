const puppeteer = require('puppeteer');
const faker = require('@faker-js/faker');

async function testLoginFlow() {
  console.log('🔍 Starting browser-based login flow test...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for debugging
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // Enable console logging
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
    
    console.log('📱 Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'test-homepage.png' });
    console.log('✅ Homepage loaded successfully');
    
    console.log('🔗 Clicking login button...');
    
    // Wait for the CTA button and click it
    try {
      await page.waitForSelector('.cta-button', { timeout: 5000 });
      await page.click('.cta-button');
      console.log('✅ CTA button clicked');
    } catch (error) {
      console.error('❌ Could not find or click CTA button:', error.message);
      // Try alternative selector
      await page.click('a[href="/login"]');
    }
    
    // Wait for navigation to login page
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('📱 Navigated to login page');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'test-login-page.png' });
    
    // Wait for Supabase Auth UI to load
    await page.waitForTimeout(3000);
    
    console.log('🔍 Checking for auth form elements...');
    
    // Check for various auth elements that might be present
    const authElements = await page.evaluate(() => {
      const elements = {
        emailInput: !!document.querySelector('input[type="email"]'),
        passwordInput: !!document.querySelector('input[type="password"]'),
        signInButton: !!document.querySelector('button[type="submit"]'),
        googleButton: !!document.querySelector('button[data-provider="google"]') || !!document.querySelector('button[aria-label*="Google"]'),
        supabaseAuthUI: !!document.querySelector('.supabase-auth-ui_ui'),
        authContainer: !!document.querySelector('.dreamseed-auth-container'),
        anyForm: !!document.querySelector('form'),
        anyButton: document.querySelectorAll('button').length,
        anyInput: document.querySelectorAll('input').length
      };
      
      // Get all visible text content for debugging
      const visibleText = document.body.innerText;
      
      return { elements, visibleText: visibleText.substring(0, 500) };
    });
    
    console.log('📊 Auth form analysis:', JSON.stringify(authElements.elements, null, 2));
    console.log('📝 Visible text preview:', authElements.visibleText);
    
    // Try to find and interact with email/password fields
    if (authElements.elements.emailInput && authElements.elements.passwordInput) {
      console.log('✅ Email/Password fields found, attempting login...');
      
      // Generate test credentials
      const testEmail = 'test-login-' + Date.now() + '@dreamseed.com';
      const testPassword = 'TestPassword123!';
      
      console.log(`📧 Test email: ${testEmail}`);
      
      // Fill in the form
      await page.type('input[type="email"]', testEmail);
      await page.type('input[type="password"]', testPassword);
      
      await page.waitForTimeout(1000);
      
      // Try to click sign up button first (for new users)
      try {
        const signUpButton = await page.$('button:contains("Sign up")') || 
                           await page.$('button[data-testid="sign-up-button"]') ||
                           await page.$('.supabase-auth-ui_ui button:nth-child(2)');
        
        if (signUpButton) {
          console.log('🔄 Clicking Sign Up button...');
          await signUpButton.click();
        } else {
          // Fallback to submit button
          console.log('🔄 Clicking Submit button...');
          await page.click('button[type="submit"]');
        }
        
        await page.waitForTimeout(3000);
        
        // Check for any error messages or success indicators
        const authResult = await page.evaluate(() => {
          const errorMsg = document.querySelector('.supabase-auth-ui_ui .error, [role="alert"], .error-message');
          const successMsg = document.querySelector('.success-message, .confirmation-message');
          const currentUrl = window.location.href;
          const loadingElement = document.querySelector('.loading, [data-loading="true"]');
          
          return {
            hasError: !!errorMsg,
            errorText: errorMsg?.textContent,
            hasSuccess: !!successMsg,
            successText: successMsg?.textContent,
            currentUrl,
            isLoading: !!loadingElement,
            pageTitle: document.title
          };
        });
        
        console.log('📊 Auth result:', JSON.stringify(authResult, null, 2));
        
        // Take screenshot after auth attempt
        await page.screenshot({ path: 'test-after-auth.png' });
        
        // Wait for potential redirect
        await page.waitForTimeout(5000);
        
        const finalUrl = page.url();
        console.log('🎯 Final URL:', finalUrl);
        
        if (finalUrl.includes('/customer-portal')) {
          console.log('✅ Successfully redirected to customer portal!');
          
          // Take screenshot of customer portal
          await page.screenshot({ path: 'test-customer-portal.png' });
          
          // Check if portal loaded properly
          const portalCheck = await page.evaluate(() => {
            return {
              hasWelcomeMessage: !!document.querySelector('h1:contains("DreamSeed Portal")') || document.body.innerText.includes('DreamSeed Portal'),
              hasSignOutButton: !!document.querySelector('button:contains("Sign Out")'),
              hasUserContent: document.body.innerText.includes('Welcome back') || document.body.innerText.includes('Your Business'),
              bodyText: document.body.innerText.substring(0, 300)
            };
          });
          
          console.log('🏠 Customer portal check:', JSON.stringify(portalCheck, null, 2));
          
        } else if (finalUrl.includes('/login')) {
          console.log('⚠️  Still on login page - check for errors or incomplete flow');
        } else {
          console.log(`🔄 Redirected to: ${finalUrl}`);
        }
        
      } catch (authError) {
        console.error('❌ Auth interaction error:', authError.message);
        await page.screenshot({ path: 'test-auth-error.png' });
      }
      
    } else if (authElements.elements.googleButton) {
      console.log('🔍 Only Google auth button found');
      console.log('⚠️  No email/password fields detected - this might be the issue!');
      
    } else {
      console.log('❌ No auth form elements found');
      console.log('⚠️  Auth UI may not be loading properly');
    }
    
    // Final page analysis
    const finalAnalysis = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasAuthUI: !!document.querySelector('.supabase-auth-ui_ui'),
        hasEmailField: !!document.querySelector('input[type="email"]'),
        hasPasswordField: !!document.querySelector('input[type="password"]'),
        allInputs: Array.from(document.querySelectorAll('input')).map(input => ({
          type: input.type,
          placeholder: input.placeholder,
          id: input.id,
          className: input.className
        })),
        allButtons: Array.from(document.querySelectorAll('button')).map(button => ({
          text: button.textContent.trim(),
          type: button.type,
          className: button.className
        }))
      };
    });
    
    console.log('\n📊 Final Analysis:');
    console.log('URL:', finalAnalysis.url);
    console.log('Title:', finalAnalysis.title);
    console.log('Has Auth UI:', finalAnalysis.hasAuthUI);
    console.log('Has Email Field:', finalAnalysis.hasEmailField);
    console.log('Has Password Field:', finalAnalysis.hasPasswordField);
    console.log('All Inputs:', JSON.stringify(finalAnalysis.allInputs, null, 2));
    console.log('All Buttons:', JSON.stringify(finalAnalysis.allButtons, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser left open for manual inspection...');
    console.log('📸 Screenshots saved: test-homepage.png, test-login-page.png, test-after-auth.png, test-customer-portal.png');
    
    // Don't close browser automatically so you can inspect
    // await browser.close();
  }
}

// Run the test
testLoginFlow().catch(console.error);