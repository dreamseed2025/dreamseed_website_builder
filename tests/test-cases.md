# 🧪 DreamSeed Test Cases

## Test Case Organization

### **Critical User Flows (P0)**
These must work perfectly for users to complete their journey.

### **Secondary Flows (P1)** 
Important but not blocking core functionality.

### **Edge Cases (P2)**
Error handling and boundary conditions.

---

## **P0: CRITICAL USER FLOWS**

### **TC-001: New User Complete Journey**
**Objective:** New visitor completes full onboarding to customer portal

**Steps:**
1. Visit home page (/)
2. Click "Get Started Now"
3. Complete business assessment (4 steps)
4. Login with Google/email
5. Land in customer portal
6. See personalized content

**Expected Results:**
- Each step loads successfully
- Assessment data persists through login
- Customer portal shows user's info
- No broken links or 404s

**Current Status:** ❌ FAILING - Users getting redirected to old HTML pages

---

### **TC-002: Admin Login Flow**
**Objective:** Admin can access admin dashboard

**Steps:**
1. Go to /admin-login
2. Login with admin email (morgan@dreamseed.ai)
3. Verify redirect to /admin-dashboard
4. Confirm admin tools are visible

**Expected Results:**
- Admin-only access granted
- Full admin dashboard with customer data
- Regular users blocked from admin area

**Current Status:** ⏳ NEEDS TESTING

---

### **TC-003: Role-Based Routing**
**Objective:** Users get correct dashboard based on role

**Test Data:**
- Admin: morgan@dreamseed.ai
- Customer: test@customer.com

**Steps:**
1. Login as admin → Should go to /admin-dashboard
2. Login as customer → Should go to /customer-portal
3. Try accessing wrong dashboard → Should be blocked

**Expected Results:**
- Proper role detection
- Correct dashboard routing
- Access control working

**Current Status:** ⏳ NEEDS TESTING

---

### **TC-004: Assessment Data Persistence**
**Objective:** Assessment data follows user through login

**Steps:**
1. Complete business assessment
2. Login with new account
3. Verify assessment data appears in customer portal

**Expected Results:**
- Data saved to localStorage and/or database
- Shows in customer portal after login
- Used for personalization

**Current Status:** ❌ FAILING - Data not showing in portal

---

## **P1: SECONDARY FLOWS**

### **TC-005: Navigation Links**
**Objective:** All navigation works correctly

**Steps:**
1. Test all header navigation links
2. Verify footer links
3. Check breadcrumbs and back buttons

**Expected Results:**
- No 404 errors
- Consistent navigation experience
- Mobile navigation works

**Current Status:** ❌ FAILING - Portal link needs testing

---

### **TC-006: Form Validation**
**Objective:** Assessment form validates correctly

**Steps:**
1. Try submitting empty forms
2. Enter invalid email/phone formats
3. Test step navigation with missing fields

**Expected Results:**
- Clear error messages
- Prevents progression with invalid data
- Good UX for corrections

**Current Status:** ⏳ NEEDS TESTING

---

### **TC-007: Authentication States**
**Objective:** Proper handling of auth states

**Steps:**
1. Visit protected pages while logged out
2. Test session expiration
3. Test login redirect back to intended page

**Expected Results:**
- Redirects to login when needed
- Returns to intended page after login
- Handles expired sessions gracefully

**Current Status:** ⏳ NEEDS TESTING

---

## **P2: EDGE CASES**

### **TC-008: Error Handling**
**Objective:** Graceful error handling

**Steps:**
1. Simulate network failures
2. Test with invalid form data
3. Try accessing non-existent routes

**Expected Results:**
- User-friendly error messages
- Fallback UI for failures
- No white screen crashes

**Current Status:** ⏳ NEEDS TESTING

---

### **TC-009: Browser Compatibility**
**Objective:** Works across browsers

**Steps:**
1. Test on Chrome, Firefox, Safari, Edge
2. Test mobile browsers
3. Test with JavaScript disabled

**Expected Results:**
- Consistent behavior across browsers
- Mobile responsive design
- Graceful degradation

**Current Status:** ⏳ NEEDS TESTING

---

### **TC-010: Performance**
**Objective:** Acceptable load times

**Steps:**
1. Measure page load times
2. Test with slow connections
3. Check bundle sizes

**Expected Results:**
- Pages load under 3 seconds
- Good performance on mobile
- Optimized assets

**Current Status:** ⏳ NEEDS TESTING

---

## **TEST DATA NEEDED**

### **User Accounts**
- Admin: morgan@dreamseed.ai
- Customer 1: test@customer.com  
- Customer 2: demo@business.com

### **Assessment Data Sets**
- Complete assessment (all fields filled)
- Partial assessment (some fields missing)
- Edge case data (very long inputs, special characters)

### **Business Scenarios**
- Service business
- Product business  
- SaaS startup
- Restaurant

---

## **AUTOMATED TEST PRIORITIES**

### **High Priority**
1. TC-001: New User Complete Journey
2. TC-003: Role-Based Routing
3. TC-004: Assessment Data Persistence

### **Medium Priority**
4. TC-002: Admin Login Flow
5. TC-005: Navigation Links
6. TC-007: Authentication States

### **Low Priority**
7. TC-006: Form Validation
8. TC-008: Error Handling
9. TC-009: Browser Compatibility
10. TC-010: Performance

---

## **CURRENT ISSUES TO FIX**

### **🔥 Critical Issues**
1. **Users redirected to old HTML pages instead of new Next.js routes**
2. **Assessment data not appearing in customer portal**
3. **Navigation "Portal" link behavior unclear**

### **🟡 Important Issues**  
4. Role-based routing needs verification
5. Admin dashboard access needs testing
6. Form validation needs implementation

### **🟢 Nice to Have**
7. Error boundaries for better UX
8. Loading states for better feedback  
9. Mobile optimization testing