#!/usr/bin/env node

/**
 * Quick Database Status Check
 * Simple check to see if the Supabase database is properly configured
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase credentials');
    console.log('Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function quickCheck() {
    console.log('🔍 Quick Database Status Check');
    console.log('==============================\n');

    const checks = [
        { name: 'Users Table', test: () => supabase.from('users').select('id').limit(1) },
        { name: 'Dream DNA Table', test: () => supabase.from('dream_dna').select('id').limit(1) },
        { name: 'Payment Columns', test: () => supabase.from('users').select('payment_status, subscription_type').limit(1) },
        { name: 'Assistant Columns', test: () => supabase.from('users').select('individual_assistant_id, assistant_type').limit(1) },
        { name: 'Auth Integration', test: () => supabase.from('users').select('auth_user_id, account_type').limit(1) }
    ];

    let passed = 0;
    let total = checks.length;

    for (const check of checks) {
        try {
            await check.test();
            console.log(`✅ ${check.name}`);
            passed++;
        } catch (error) {
            console.log(`❌ ${check.name}: ${error.message}`);
        }
    }

    console.log(`\n📊 Status: ${passed}/${total} checks passed`);

    if (passed === total) {
        console.log('🎉 Database is fully configured!');
        console.log('Ready for DreamSeed voice integration.');
    } else {
        console.log(`⚠️ Database setup incomplete (${total - passed} issues)`);
        console.log('\n💡 To fix:');
        console.log('1. Run: node setup-complete-database.js');
        console.log('2. Or manually execute SQL files in /sql/ directory');
        console.log('3. Then run: node verify-database-setup.js for detailed check');
    }

    return passed === total;
}

quickCheck().catch(error => {
    console.error('❌ Check failed:', error.message);
    process.exit(1);
});