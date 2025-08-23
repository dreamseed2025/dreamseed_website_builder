# 📋 Manual Test Checklist

Use this checklist to quickly verify critical functionality works.

## **🚀 Quick Smoke Test (5 minutes)**

**Test URL:** https://dreamseed-website-builder-2gc3e51zz-morgans-projects-fe2cd439.vercel.app

### **Critical Path Test**
- [ ] **Home Page Loads** - Visit home page, see "Launch Your Dream Business" 
- [ ] **Get Started Button** - Click "Get Started Now" button
- [ ] **Assessment Page** - Should go to `/business-assessment` not old HTML
- [ ] **Assessment Form** - Fill out at least Step 1, click "Next Step"  
- [ ] **Login Redirect** - Complete assessment, should redirect to `/login`
- [ ] **Customer Portal** - After login, should reach `/customer-portal`

**❌ CURRENT ISSUE:** Users get redirected to old HTML pages instead of new Next.js routes

---

## **🔍 Detailed Testing**

### **Navigation Test**
- [ ] Click "Home" in nav → Goes to `/`
- [ ] Click "Services" in nav → Scrolls to services section  
- [ ] Click "Domain Checker" in nav → Goes to `/domain-checker`
- [ ] Click "Portal" in nav → Goes to `/customer-portal` 
- [ ] Click "Contact" in nav → Scrolls to contact section

### **Authentication Test**  
- [ ] Visit `/customer-portal` while logged out → Redirects to login
- [ ] Visit `/admin-dashboard` while logged out → Redirects to login
- [ ] Visit `/admin-login` → Shows red-themed admin login
- [ ] Visit `/login` → Shows blue-themed customer login

### **Assessment Flow Test**
- [ ] **Step 1:** Business idea + type selection works
- [ ] **Step 2:** Name, email, phone input works
- [ ] **Step 3:** Timeline + experience selection works  
- [ ] **Step 4:** Goal selection works
- [ ] **Progress Bar:** Shows correct completion percentage
- [ ] **Validation:** Can't proceed with empty required fields
- [ ] **Final Redirect:** Goes to login after completion

### **Role-Based Access Test**
- [ ] Login with `morgan@dreamseed.ai` → Should go to admin dashboard
- [ ] Login with other email → Should go to customer portal
- [ ] Customer tries to access `/admin-dashboard` → Should be blocked
- [ ] Admin tries to access `/customer-portal` → Should go to admin instead

---

## **🐛 Known Issues**

### **Critical Issues**
1. **Old HTML Redirect Issue** 
   - **Problem:** Users completing assessment get redirected to old HTML pages
   - **Expected:** Should go to `/login` then `/customer-portal`
   - **Actual:** Goes to `voice-consultation.html` or similar

2. **Assessment Data Not Persisting**
   - **Problem:** Assessment data doesn't show in customer portal
   - **Expected:** Portal shows personalized info from assessment
   - **Actual:** Generic portal without assessment data

### **Medium Issues** 
3. **Navigation Confusion**
   - **Problem:** "Portal" link behavior unclear to users
   - **Expected:** Clear path to customer portal
   - **Actual:** May redirect to login first (correct) but unclear UX

---

## **📊 Test Results Template**

**Date:** _________
**Tester:** _________  
**Browser:** _________
**Test URL:** _________

### **Results Summary**
- ✅ Passed: ___/___
- ❌ Failed: ___/___  
- ⏳ Skipped: ___/___

### **Critical Issues Found**
1. _________________________________
2. _________________________________
3. _________________________________

### **Notes**
_________________________________
_________________________________

---

## **🚀 Running Automated Tests**

```bash
# Test against production
npm run test:flows

# Test against local development  
npm run test:local
```

**Test Results Location:** `tests/test-results.json`

---

## **🎯 Success Criteria**

### **Minimum Viable Testing (MVP)**
- Home → Assessment → Login → Customer Portal flow works
- No 404 errors in critical path
- Assessment data appears in portal

### **Production Ready**  
- All navigation links work
- Role-based access control working
- Form validation preventing bad data
- Mobile responsive on all pages
- Error handling for edge cases