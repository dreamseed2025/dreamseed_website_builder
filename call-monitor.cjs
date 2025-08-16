#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase client
const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'sb_secret_GsVwx89kbQsB6LukLj7qdA_MUcB6-ZU'
);

class CallMonitor {
  constructor() {
    this.lastCallCount = 0;
    this.lastSupabaseCount = 0;
    this.monitoringActive = true;
    this.callsDataFile = path.join(__dirname, 'simple-vapi-webhook', 'calls-data.json');
  }

  formatTime() {
    return new Date().toLocaleTimeString();
  }

  log(step, status, details = '') {
    const timestamp = this.formatTime();
    const statusIcon = status === 'success' ? '✅' : status === 'in_progress' ? '🔄' : status === 'error' ? '❌' : '📍';
    console.log(`${timestamp} ${statusIcon} ${step}${details ? ': ' + details : ''}`);
  }

  async checkSupabaseRecords() {
    try {
      const { data, error } = await supabase
        .from('business_formations')
        .select('id, customer_name, business_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        this.log('Supabase Check', 'error', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      this.log('Supabase Check', 'error', error.message);
      return [];
    }
  }

  async checkLocalCalls() {
    try {
      if (!fs.existsSync(this.callsDataFile)) {
        return [];
      }

      const data = JSON.parse(fs.readFileSync(this.callsDataFile, 'utf8'));
      return data.calls || [];
    } catch (error) {
      this.log('Local Calls Check', 'error', error.message);
      return [];
    }
  }

  async monitorStep() {
    console.clear();
    console.log('🔍 VAPI CALL MONITOR - REAL-TIME TRACKING');
    console.log('=' .repeat(60));
    console.log(`📊 Monitoring started at ${this.formatTime()}`);
    console.log('🎯 Watching for: MCP functions, Webhooks, Supabase saves');
    console.log('-'.repeat(60));

    try {
      // Check Supabase records
      const supabaseRecords = await this.checkSupabaseRecords();
      const currentSupabaseCount = supabaseRecords.length;

      // Check local calls
      const localCalls = await this.checkLocalCalls();
      const currentCallCount = localCalls.length;

      // Display current status
      console.log('\n📈 CURRENT STATUS:');
      console.log(`   • Total Supabase Records: ${currentSupabaseCount}`);
      console.log(`   • Total Local Calls: ${currentCallCount}`);

      // Detect new activity
      if (currentSupabaseCount > this.lastSupabaseCount) {
        const newRecords = currentSupabaseCount - this.lastSupabaseCount;
        this.log('NEW SUPABASE SAVE', 'success', `${newRecords} new record(s) detected!`);
        
        // Show latest records
        console.log('\n📋 LATEST SUPABASE RECORDS:');
        supabaseRecords.slice(0, newRecords).forEach((record, i) => {
          console.log(`   ${i + 1}. ${record.customer_name || 'N/A'} - ${record.business_name || 'N/A'}`);
          console.log(`      ID: ${record.id} | Created: ${record.created_at}`);
        });
      }

      if (currentCallCount > this.lastCallCount) {
        const newCalls = currentCallCount - this.lastCallCount;
        this.log('NEW WEBHOOK CALL', 'success', `${newCalls} new call(s) processed!`);
        
        // Show latest calls
        console.log('\n📞 LATEST WEBHOOK CALLS:');
        localCalls.slice(-newCalls).forEach((call, i) => {
          console.log(`   ${i + 1}. ${call.customer?.name || 'N/A'} - ${call.businessName || 'N/A'}`);
          console.log(`      ID: ${call.id} | Stage: ${call.callNumber} | Time: ${call.timestamp}`);
        });
      }

      // Update counters
      this.lastSupabaseCount = currentSupabaseCount;
      this.lastCallCount = currentCallCount;

      // Show monitoring status
      console.log('\n🔄 MONITORING STATUS:');
      console.log(`   • Webhook Server: ${this.checkWebhookServer() ? '🟢 RUNNING' : '🔴 STOPPED'}`);
      console.log(`   • ngrok Tunnel: ${await this.checkNgrokStatus() ? '🟢 ACTIVE' : '🔴 INACTIVE'}`);
      console.log(`   • Last Check: ${this.formatTime()}`);

      console.log('\n💡 Waiting for new calls... (Press Ctrl+C to stop)');

    } catch (error) {
      this.log('Monitor Error', 'error', error.message);
    }
  }

  checkWebhookServer() {
    try {
      const { execSync } = require('child_process');
      const result = execSync('ps aux | grep "node server.js" | grep -v grep', { encoding: 'utf8' });
      return result.trim().length > 0;
    } catch {
      return false;
    }
  }

  async checkNgrokStatus() {
    try {
      const { execSync } = require('child_process');
      const result = execSync('curl -s http://localhost:4040/api/tunnels', { encoding: 'utf8' });
      const data = JSON.parse(result);
      return data.tunnels && data.tunnels.length > 0;
    } catch {
      return false;
    }
  }

  async start() {
    this.log('Call Monitor', 'in_progress', 'Starting real-time monitoring...');
    
    // Initial check
    await this.monitorStep();
    
    // Monitor every 2 seconds
    setInterval(async () => {
      if (this.monitoringActive) {
        await this.monitorStep();
      }
    }, 2000);
  }

  stop() {
    this.monitoringActive = false;
    this.log('Call Monitor', 'success', 'Monitoring stopped');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping monitor...');
  process.exit(0);
});

// Start monitoring
const monitor = new CallMonitor();
monitor.start();