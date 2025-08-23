#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import SmartPromptGenerator from './smart-prompt-generator.js';

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q'
);

class PreCallPromptUpdater {
  constructor() {
    this.promptGenerator = new SmartPromptGenerator();
    this.lastUpdateTimes = new Map(); // Track when each customer was last updated
    this.updateInterval = 5 * 60 * 1000; // 5 minutes minimum between updates
  }

  async startPeriodicUpdates() {
    console.log('🚀 Starting pre-call prompt updater service...');
    console.log('⏰ Will update prompts for active customers every 2 minutes');
    
    // Update immediately on start
    await this.updateAllActiveCustomers();
    
    // Then update every 2 minutes
    setInterval(async () => {
      try {
        await this.updateAllActiveCustomers();
      } catch (error) {
        console.error('❌ Periodic update error:', error);
      }
    }, 2 * 60 * 1000); // 2 minutes
  }

  async updateAllActiveCustomers() {
    try {
      console.log('\n🔄 Checking for customers needing prompt updates...');
      
      // Get all customers who have data but aren't complete
      const { data: customers, error } = await supabase
        .from('users')
        .select('customer_phone, customer_name, business_name, call_1_completed, call_2_completed, call_3_completed, call_4_completed, updated_at')
        .not('customer_phone', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Database query error:', error);
        return;
      }

      if (!customers || customers.length === 0) {
        console.log('📭 No customers found');
        return;
      }

      console.log(`👥 Found ${customers.length} customers to check`);

      let updatedCount = 0;
      for (const customer of customers) {
        try {
          const shouldUpdate = this.shouldUpdateCustomer(customer);
          
          if (shouldUpdate) {
            console.log(`🎯 Updating prompts for ${customer.customer_name || customer.customer_phone}...`);
            
            const result = await this.promptGenerator.generateAndUpdatePrompt(customer.customer_phone);
            
            if (result.success) {
              console.log(`✅ Updated ${customer.customer_name || customer.customer_phone} (Stage ${result.stage})`);
              this.lastUpdateTimes.set(customer.customer_phone, Date.now());
              updatedCount++;
            } else {
              console.log(`❌ Failed to update ${customer.customer_phone}: ${result.error}`);
            }
          } else {
            console.log(`⏭️ Skipping ${customer.customer_name || customer.customer_phone} (recently updated)`);
          }
        } catch (error) {
          console.error(`❌ Error updating ${customer.customer_phone}:`, error);
        }
      }

      if (updatedCount > 0) {
        console.log(`🎉 Successfully updated ${updatedCount} customer prompts`);
      } else {
        console.log('ℹ️ No customers needed prompt updates');
      }

    } catch (error) {
      console.error('❌ Update all customers error:', error);
    }
  }

  shouldUpdateCustomer(customer) {
    const now = Date.now();
    const lastUpdate = this.lastUpdateTimes.get(customer.customer_phone);
    
    // If never updated, definitely update
    if (!lastUpdate) {
      return true;
    }
    
    // If updated recently, skip
    if (now - lastUpdate < this.updateInterval) {
      return false;
    }
    
    // If customer has been active recently (updated in last hour), update
    const customerLastActivity = new Date(customer.updated_at).getTime();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    if (customerLastActivity > oneHourAgo) {
      return true;
    }
    
    // If customer has incomplete calls, update
    if (!customer.call_4_completed) {
      return true;
    }
    
    return false;
  }

  async updateSpecificCustomer(phone) {
    console.log(`🎯 Manual update for ${phone}...`);
    
    try {
      const result = await this.promptGenerator.generateAndUpdatePrompt(phone);
      
      if (result.success) {
        console.log(`✅ Updated ${phone} (Stage ${result.stage})`);
        console.log(`📊 Completion: ${result.analysis?.checklist?.completionPercentage || 0}%`);
        console.log(`👤 Customer: ${result.analysis?.customer?.customer_name || 'Unknown'}`);
        console.log(`🏢 Business: ${result.analysis?.customer?.business_name || 'Unknown'}`);
        
        this.lastUpdateTimes.set(phone, Date.now());
        
        return {
          success: true,
          stage: result.stage,
          completion: result.analysis?.checklist?.completionPercentage || 0,
          customer: result.analysis?.customer?.customer_name,
          business: result.analysis?.customer?.business_name
        };
      } else {
        console.log(`❌ Failed to update ${phone}: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error(`❌ Manual update error for ${phone}:`, error);
      return { success: false, error: error.message };
    }
  }

  async preWarmCustomer(phone) {
    console.log(`🔥 Pre-warming prompts for ${phone} (call expected)...`);
    
    // Update immediately
    const result = await this.updateSpecificCustomer(phone);
    
    if (result.success) {
      console.log(`🎯 ${phone} is ready for intelligent call!`);
      console.log(`⏰ VAPI now has 30+ seconds to apply the updated prompt`);
      
      return result;
    } else {
      console.log(`❌ Pre-warm failed for ${phone}`);
      return result;
    }
  }

  // Method to get customer readiness status
  async getCustomerReadiness(phone) {
    try {
      const analysis = await this.promptGenerator.analyzeCustomerData(phone);
      
      return {
        phone: phone,
        stage: analysis.stage || 1,
        completion: analysis.checklist?.completionPercentage || 0,
        completedItems: analysis.checklist?.completedItems || 0,
        totalItems: analysis.checklist?.totalItems || 108,
        isNew: analysis.isNew || false,
        isComplete: analysis.isComplete || false,
        customer: analysis.customer?.customer_name || 'Unknown',
        business: analysis.customer?.business_name || 'Unknown',
        readiness: analysis.checklist?.readiness || {}
      };
    } catch (error) {
      console.error(`❌ Readiness check failed for ${phone}:`, error);
      return { phone, error: error.message };
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const updater = new PreCallPromptUpdater();
  const command = process.argv[2];
  const phone = process.argv[3];

  switch (command) {
    case 'start':
      console.log('🚀 Starting Pre-Call Prompt Updater Service');
      updater.startPeriodicUpdates();
      break;
      
    case 'update':
      if (!phone) {
        console.log('❌ Usage: node pre-call-prompt-updater.js update +1234567890');
        process.exit(1);
      }
      updater.updateSpecificCustomer(phone).then(() => process.exit(0));
      break;
      
    case 'prewarm':
      if (!phone) {
        console.log('❌ Usage: node pre-call-prompt-updater.js prewarm +1234567890');
        process.exit(1);
      }
      updater.preWarmCustomer(phone).then(() => process.exit(0));
      break;
      
    case 'status':
      if (!phone) {
        console.log('❌ Usage: node pre-call-prompt-updater.js status +1234567890');
        process.exit(1);
      }
      updater.getCustomerReadiness(phone).then(status => {
        console.log('📊 CUSTOMER READINESS STATUS:');
        console.log(`   Phone: ${status.phone}`);
        console.log(`   Customer: ${status.customer}`);
        console.log(`   Business: ${status.business}`);
        console.log(`   Stage: ${status.stage}`);
        console.log(`   Completion: ${status.completion}% (${status.completedItems}/${status.totalItems})`);
        console.log(`   Status: ${status.isNew ? 'New Customer' : status.isComplete ? 'Complete' : 'In Progress'}`);
        
        if (status.readiness) {
          console.log('   Launch Readiness:');
          Object.entries(status.readiness).forEach(([key, ready]) => {
            const service = key.replace('ready_for_', '').replace(/_/g, ' ');
            console.log(`     ${service}: ${ready ? '✅ Ready' : '❌ Not Ready'}`);
          });
        }
        
        process.exit(0);
      });
      break;
      
    case 'updateall':
      updater.updateAllActiveCustomers().then(() => process.exit(0));
      break;
      
    default:
      console.log('📖 USAGE:');
      console.log('  node pre-call-prompt-updater.js start                    # Start periodic service');
      console.log('  node pre-call-prompt-updater.js update +1234567890       # Update specific customer');
      console.log('  node pre-call-prompt-updater.js prewarm +1234567890      # Pre-warm before call');
      console.log('  node pre-call-prompt-updater.js status +1234567890       # Check customer status');
      console.log('  node pre-call-prompt-updater.js updateall                # Update all customers');
      process.exit(1);
  }
}

export default PreCallPromptUpdater;