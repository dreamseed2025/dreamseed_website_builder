# DreamSeed Database Setup Guide

## 🎯 Quick Status Check

Run this first to see if your database is ready:

```bash
node check-database-status.js
```

If all checks pass ✅, your database is ready! If not, follow the setup steps below.

## 🚀 Automated Setup (Recommended)

### Prerequisites
1. Supabase project created
2. Environment variables configured:

```bash
# Add to .env file
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Run Complete Setup
```bash
# Install dependencies if needed
npm install @supabase/supabase-js dotenv

# Run automated setup
node setup-complete-database.js

# Verify everything worked
node verify-database-setup.js
```

## 📋 Manual Setup (If Automated Fails)

Execute these SQL files **in order** in your Supabase SQL Editor:

### 1. Core Tables
```sql
-- Execute: sql/01_create_users_table.sql
-- Creates main users table with business formation tracking
```

```sql
-- Execute: sql/02_create_dream_dna_table.sql  
-- Creates dream_dna table for project/vision data
```

### 2. Authentication Integration
```sql
-- Execute: sql/03_add_auth_integration.sql
-- Connects users table to Supabase auth system
```

```sql
-- Execute: sql/04_connect_existing_users_to_auth.sql
-- Additional auth integration (if needed)
```

### 3. Security & Policies
```sql
-- Execute: sql/05_fix_rls_policies.sql
-- Sets up Row Level Security policies
```

```sql
-- Execute: sql/07_simple_trigger_function.sql
-- Creates user registration triggers
```

### 4. Payment System
```sql
-- Execute: sql/08_add_payment_status.sql
-- Adds payment tracking columns and functions
```

```sql
-- Execute: sql/09_update_trigger_for_payment.sql
-- Updates triggers for payment handling
```

### 5. VAPI Assistant System
```sql
-- Execute: sql/10_add_individual_assistants.sql
-- Adds individual assistant tracking and functions
```

## 🔍 What Gets Created

### Tables
- **`users`** - Main business user profiles with call tracking
- **`dream_dna`** - Project/vision data linked to users
- **`auth.users`** - Supabase authentication (built-in)

### Key Columns Added
- **Users Table:**
  - `id` (PRIMARY) - Main business identifier
  - `auth_user_id` - Links to Supabase auth
  - `payment_status`, `subscription_type` - Payment tracking
  - `individual_assistant_id`, `assistant_type` - VAPI integration
  - `call_1_completed` through `call_4_completed` - Progress tracking

- **Dream DNA Table:**
  - `id` (PRIMARY) - Project identifier  
  - `user_id` - Links to users table
  - `vision_statement`, `core_purpose` - Project context

### Functions Created
- `handle_new_user()` - Auto-creates profile on signup
- `update_payment_status()` - Manages payment updates
- `check_payment_status()` - Queries payment info
- `get_assistant_type()` - Determines assistant eligibility
- `assign_assistant_type()` - Assigns appropriate assistant
- `save_individual_assistant()` - Saves VAPI assistant IDs

## 🎤 VAPI Integration Features

Once setup is complete, the database supports:

### User ID Structure
- **`users.id`** - Primary business identifier
- **`users.auth_user_id`** - Authentication only
- **`dream_dna.id`** - Current project identifier

### Assistant Assignment
- **Basic/Trial users** → Shared assistant with context
- **Premium/Enterprise users** → Individual assistant with memory
- **Admin users** → Admin assistant with insights

### Session Variables
Every VAPI call includes:
```javascript
{
  user_id: "users.id",
  dream_id: "dream_dna.id", 
  auth_user_id: "users.auth_user_id",
  user_name: "Customer Name",
  business_name: "Their Business",
  subscription_type: "premium",
  payment_status: "paid",
  current_call_stage: 2
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Permission Errors**
   - Make sure you're using `SUPABASE_SERVICE_ROLE_KEY`, not the anon key
   - Check that RLS policies allow your operations

2. **Function Creation Fails**
   - Functions require service role permissions
   - Some functions depend on previous ones being created first

3. **Column Already Exists**
   - This is normal if you've run scripts before
   - The setup scripts handle existing objects gracefully

### Getting Help

1. **Check logs**: Supabase SQL Editor shows detailed error messages
2. **Run verification**: `node verify-database-setup.js` shows exactly what's missing
3. **Manual inspection**: Use Supabase dashboard to browse tables and columns

## ✅ Success Criteria

Your database is ready when:

- ✅ All tables exist (`users`, `dream_dna`)
- ✅ All payment columns present
- ✅ All assistant columns present  
- ✅ Auth integration working
- ✅ Database functions operational
- ✅ RLS policies configured

Run `node check-database-status.js` to verify!