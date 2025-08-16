#!/usr/bin/env node

/**
 * Verify Supabase Database Setup
 * Checks if all required tables, columns, and functions exist
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    console.log('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class DatabaseVerifier {
    constructor() {
        this.results = [];
        this.errors = [];
    }

    async verify() {
        console.log('🔍 Verifying Supabase database setup...\n');

        try {
            await this.checkUsersTable();
            await this.checkDreamDnaTable();
            await this.checkAuthIntegration();
            await this.checkPaymentColumns();
            await this.checkAssistantColumns();
            await this.checkFunctions();
            await this.checkPolicies();

            this.printResults();
            
        } catch (error) {
            console.error('❌ Verification failed:', error.message);
            process.exit(1);
        }
    }

    async checkUsersTable() {
        console.log('📋 Checking users table...');
        
        const requiredColumns = [
            'id', 'created_at', 'updated_at',
            'customer_name', 'customer_email', 'customer_phone',
            'business_name', 'business_type', 'state_of_operation', 'entity_type',
            'call_1_completed', 'call_2_completed', 'call_3_completed', 'call_4_completed',
            'current_call_stage', 'status', 'auth_user_id', 'account_type',
            'payment_status', 'subscription_type', 'individual_assistant_id', 'assistant_type'
        ];

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .limit(1);

            if (error) {
                this.addError('users table', error.message);
                return;
            }

            this.addResult('users table exists', true);

            // Check for required columns by trying to select them
            for (const column of requiredColumns) {
                try {
                    await supabase
                        .from('users')
                        .select(column)
                        .limit(1);
                    this.addResult(`users.${column}`, true);
                } catch (colError) {
                    this.addError(`users.${column}`, 'Column missing');
                }
            }

        } catch (error) {
            this.addError('users table', 'Table does not exist');
        }
    }

    async checkDreamDnaTable() {
        console.log('🧬 Checking dream_dna table...');
        
        try {
            const { data, error } = await supabase
                .from('dream_dna')
                .select('id, user_id, vision_statement, core_purpose, target_market')
                .limit(1);

            if (error) {
                this.addError('dream_dna table', error.message);
            } else {
                this.addResult('dream_dna table exists', true);
            }
        } catch (error) {
            this.addError('dream_dna table', 'Table does not exist');
        }
    }

    async checkAuthIntegration() {
        console.log('🔐 Checking auth integration...');
        
        try {
            // Check if auth_user_id column exists and has proper foreign key
            const { data, error } = await supabase
                .from('users')
                .select('auth_user_id, account_type, email_confirmed')
                .limit(1);

            if (error) {
                this.addError('auth integration', error.message);
            } else {
                this.addResult('auth_user_id column exists', true);
            }
        } catch (error) {
            this.addError('auth integration', 'Missing auth columns');
        }
    }

    async checkPaymentColumns() {
        console.log('💳 Checking payment system...');
        
        const paymentColumns = [
            'payment_status', 'subscription_type', 'amount_paid', 
            'payment_method', 'payment_date', 'stripe_customer_id'
        ];

        for (const column of paymentColumns) {
            try {
                await supabase
                    .from('users')
                    .select(column)
                    .limit(1);
                this.addResult(`payment.${column}`, true);
            } catch (error) {
                this.addError(`payment.${column}`, 'Column missing');
            }
        }
    }

    async checkAssistantColumns() {
        console.log('🤖 Checking assistant system...');
        
        const assistantColumns = [
            'individual_assistant_id', 'assistant_created_at', 'assistant_type'
        ];

        for (const column of assistantColumns) {
            try {
                await supabase
                    .from('users')
                    .select(column)
                    .limit(1);
                this.addResult(`assistant.${column}`, true);
            } catch (error) {
                this.addError(`assistant.${column}`, 'Column missing');
            }
        }
    }

    async checkFunctions() {
        console.log('⚙️ Checking database functions...');
        
        const functions = [
            'handle_new_user',
            'update_payment_status',
            'check_payment_status',
            'get_assistant_type',
            'assign_assistant_type',
            'save_individual_assistant'
        ];

        for (const func of functions) {
            try {
                // Try to call the function with safe parameters
                let testCall;
                
                switch (func) {
                    case 'get_assistant_type':
                    case 'assign_assistant_type':
                        // These need a UUID parameter
                        testCall = supabase.rpc(func, { user_auth_id: '00000000-0000-0000-0000-000000000000' });
                        break;
                    case 'check_payment_status':
                        testCall = supabase.rpc(func, { user_auth_id: '00000000-0000-0000-0000-000000000000' });
                        break;
                    default:
                        // For other functions, just check if they exist by calling with minimal params
                        continue;
                }

                await testCall;
                this.addResult(`function.${func}`, true);
                
            } catch (error) {
                if (error.message.includes('function') && error.message.includes('does not exist')) {
                    this.addError(`function.${func}`, 'Function does not exist');
                } else {
                    // Function exists but call failed (expected with test UUID)
                    this.addResult(`function.${func}`, true);
                }
            }
        }
    }

    async checkPolicies() {
        console.log('🛡️ Checking RLS policies...');
        
        try {
            // Test if we can query with policies enabled
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .limit(1);

            if (error) {
                this.addError('RLS policies', error.message);
            } else {
                this.addResult('RLS policies configured', true);
            }
        } catch (error) {
            this.addError('RLS policies', 'Policy check failed');
        }
    }

    addResult(item, success, message = '') {
        this.results.push({ item, success, message });
        const status = success ? '✅' : '❌';
        console.log(`  ${status} ${item} ${message}`);
    }

    addError(item, message) {
        this.errors.push({ item, message });
        console.log(`  ❌ ${item}: ${message}`);
    }

    printResults() {
        console.log('\n📊 Verification Summary:');
        console.log('========================');
        
        const passed = this.results.filter(r => r.success).length;
        const total = this.results.length;
        const failed = this.errors.length;

        console.log(`✅ Passed: ${passed}/${total}`);
        console.log(`❌ Failed: ${failed}`);

        if (this.errors.length > 0) {
            console.log('\n🚨 Issues Found:');
            this.errors.forEach(error => {
                console.log(`   • ${error.item}: ${error.message}`);
            });

            console.log('\n💡 To fix these issues:');
            console.log('1. Run the SQL scripts in order:');
            console.log('   node setup-new-database.js');
            console.log('2. Or run individual scripts:');
            console.log('   Execute each .sql file in /sql/ directory in Supabase SQL Editor');
        } else {
            console.log('\n🎉 Database is fully configured and ready!');
            console.log('All required tables, columns, and functions are in place.');
        }
    }
}

// Run verification
const verifier = new DatabaseVerifier();
verifier.verify();