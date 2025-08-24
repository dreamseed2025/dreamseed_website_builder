# 🌱 Dream DNA Tables Setup Guide

## 📋 Manual Setup Required

Since the automated SQL execution isn't working, you need to manually run the SQL in your Supabase dashboard.

## 🚀 Steps to Set Up Tables

### 1. **Open Supabase Dashboard**
- Go to: https://supabase.com/dashboard
- Select your project: `dreamseed-platform`

### 2. **Navigate to SQL Editor**
- Click on "SQL Editor" in the left sidebar
- Click "New Query"

### 3. **Copy and Paste the SQL**
Copy the entire contents of `create-dream-dna-truth-table.sql` and paste it into the SQL editor.

### 4. **Execute the SQL**
- Click the "Run" button (or press Ctrl+Enter)
- Wait for all statements to complete

### 5. **Verify Tables Created**
You should see these tables in your database:
- ✅ `dream_dna_truth`
- ✅ `dream_dna_probability_truth` 
- ✅ `dream_dna_type`

## 🔍 Quick Verification

After running the SQL, you can verify the tables exist by:

1. **Go to Table Editor** in Supabase dashboard
2. **Look for the new tables** in the list
3. **Check the structure** matches our specification

## 🎯 What the Tables Do

### `dream_dna_truth`
- **Source of truth** for all dream data
- Stores business name, type, state, etc.
- Links to user accounts

### `dream_dna_probability_truth`
- **AI probability analysis** from voice transcripts
- Confidence scores for each field
- Syncs with truth table when validated

### `dream_dna_type`
- **Business formation requirements**
- LLC, C-Corp formation details
- State-specific requirements

## 🧪 Test After Setup

Once tables are created, test the dream creation form:

1. **Visit**: `http://localhost:3000/dream-dna-setup`
2. **Fill out**: Business name, type, state
3. **Submit**: Should create a record in `dream_dna_truth`

## 📞 Need Help?

If you encounter any issues:
1. Check the SQL syntax in Supabase
2. Verify your user has admin permissions
3. Check the Supabase logs for errors

---

**Once you've run the SQL, the dream creation form will work perfectly!** 🌱✨
