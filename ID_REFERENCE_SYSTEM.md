# DreamSeed ID Reference System

## 🎯 **Standardized ID Usage Across All Systems**

### **Primary Identifiers**

| ID Type | Table Column | Description | Usage |
|---------|--------------|-------------|-------|
| **User ID** | `users.id` | Primary business user identifier | Main user reference for all business logic |
| **Auth ID** | `users.auth_user_id` | Supabase authentication identifier | Authentication/session management only |
| **Dream ID** | `dream_dna.id` | Individual project/business dream identifier | Project-specific data and tracking |
| **Assistant ID** | `users.individual_assistant_id` | VAPI assistant identifier | Voice assistant assignment |

### **Relationship Map**

```
auth.users (Supabase Auth)
    ↓ (auth_user_id)
users (Business Users)
    ↓ (user_id)
dream_dna (Projects/Dreams)
    ↓ (references)
VAPI Calls & Transcripts
```

### **System-by-System ID Usage**

#### **1. Database Queries**
```sql
-- ✅ CORRECT: Use users.id for business logic
SELECT * FROM users WHERE id = $user_id;
SELECT * FROM dream_dna WHERE user_id = $user_id;

-- ✅ CORRECT: Use auth_user_id only for auth
SELECT * FROM users WHERE auth_user_id = auth.uid();

-- ✅ CORRECT: Use dream_dna.id for project-specific data  
SELECT * FROM dream_dna WHERE id = $dream_id;
```

#### **2. VAPI Integration**
```javascript
// ✅ CORRECT: Pass both IDs to VAPI
const sessionVariables = {
  user_id: userContext.userId,        // users.id
  dream_id: userContext.dreamId,      // dream_dna.id  
  auth_user_id: userContext.authUserId // users.auth_user_id
};

// ✅ CORRECT: VAPI assistant metadata
const assistantMetadata = {
  userId: userContext.userId,         // Primary user ID
  dreamId: userContext.dreamId,       // Current project ID
  userEmail: userContext.email        // For human reference
};
```

#### **3. Frontend Context**
```javascript
// ✅ CORRECT: Standard userContext object
const userContext = {
  // Primary identifiers
  userId: user.id,                    // users.id (PRIMARY)
  authUserId: user.auth_user_id,      // auth link
  dreamId: selectedDream?.id,         // dream_dna.id (if applicable)
  
  // Assistant assignment
  assignedAssistantId: user.individual_assistant_id,
  
  // Human-readable identifiers
  email: user.customer_email,
  name: user.customer_name
};
```

#### **4. API Endpoints**
```javascript
// ✅ CORRECT: Consistent parameter naming
app.post('/api/users/:user_id/dreams/:dream_id/call', ...)
app.get('/api/users/:user_id/profile', ...)
app.put('/api/dreams/:dream_id/update', ...)

// ✅ CORRECT: Request body structure
{
  "user_id": "uuid",      // users.id
  "dream_id": "uuid",     // dream_dna.id (optional)
  "auth_user_id": "uuid"  // users.auth_user_id (auth only)
}
```

### **Migration Required**

#### **Current Issues Found:**
1. **voice-call-enhanced.html** - Mixed `userId`/`dreamId` vs `user_id`/`dream_id`
2. **VAPI Assistant Manager** - Uses email lookup instead of IDs
3. **Session variables** - Inconsistent naming
4. **Database functions** - Mix of `user_auth_id` and `user_id`

#### **Standardization Rules:**

| Context | User Reference | Dream Reference | Auth Reference |
|---------|---------------|-----------------|----------------|
| **Database** | `user_id` | `dream_id` | `auth_user_id` |
| **JavaScript** | `userId` | `dreamId` | `authUserId` |
| **API URLs** | `user_id` | `dream_id` | `auth_user_id` |
| **VAPI** | `user_id` | `dream_id` | `auth_user_id` |

### **Implementation Priority**

#### **Phase 1: Core Systems**
1. ✅ Update voice interface to use consistent ID structure
2. ✅ Standardize VAPI session variables
3. ✅ Fix assistant manager ID references
4. ✅ Update database function parameters

#### **Phase 2: Data Flow**
1. ✅ Ensure all VAPI calls include both user_id and dream_id
2. ✅ Update transcript analysis to reference correct IDs
3. ✅ Fix call progress tracking with proper IDs
4. ✅ Standardize API responses

#### **Phase 3: Validation**
1. ✅ Test complete user journey with ID tracking
2. ✅ Verify VAPI assistant gets correct context
3. ✅ Validate database consistency
4. ✅ Check frontend state management

### **Critical Rules**

#### **🔴 Never Use These:**
- Raw email addresses as primary identifiers
- Mixed camelCase/snake_case in same system
- `auth_user_id` for business logic (auth only!)

#### **🟢 Always Use These:**
- `users.id` as primary user identifier for business logic
- `dream_dna.id` as primary project identifier
- `users.auth_user_id` only for authentication/authorization
- Consistent naming within each system layer

#### **🟡 Context-Dependent:**
- Frontend: camelCase (`userId`, `dreamId`)
- Database: snake_case (`user_id`, `dream_id`)  
- APIs: snake_case in URLs, camelCase in JSON
- VAPI: snake_case for session variables

### **Example: Complete User Flow**

```javascript
// 1. User logs in (auth system)
const authUser = await supabase.auth.getUser();
const authUserId = authUser.user.id;

// 2. Load business profile (business system)  
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('auth_user_id', authUserId)
  .single();
const userId = user.id; // PRIMARY IDENTIFIER

// 3. Load current project (project system)
const { data: dream } = await supabase
  .from('dream_dna')
  .select('*')
  .eq('user_id', userId)
  .order('updated_at', { ascending: false })
  .limit(1)
  .single();
const dreamId = dream?.id; // PROJECT IDENTIFIER

// 4. Start VAPI call (voice system)
await vapi.start(assistantId, {
  assistantOverrides: {
    variableValues: {
      user_id: userId,        // PRIMARY: business user
      dream_id: dreamId,      // PROJECT: current business
      auth_user_id: authUserId, // AUTH: session reference
      user_name: user.customer_name,
      business_name: dream?.vision_statement
    }
  }
});

// 5. Save call results (all systems)
await supabase.from('call_transcripts').insert({
  user_id: userId,          // Link to business user
  dream_id: dreamId,        // Link to project
  transcript: transcript,
  call_stage: user.current_call_stage
});
```

This ensures every system knows exactly which user and which project/dream the data belongs to.