'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [recentCalls, setRecentCalls] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  // Load customer progress data
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoadingCustomers(true)
        
        // Get customers with their progress
        const { data: customersData, error: customersError } = await supabase
          .from('users')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(10)
        
        if (customersError) throw customersError
        setCustomers(customersData || [])
        
        // Get recent call transcripts
        const { data: transcriptsData, error: transcriptsError } = await supabase
          .from('call_transcripts')
          .select(`
            *,
            users(customer_name, customer_phone, business_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (transcriptsError) throw transcriptsError
        setRecentCalls(transcriptsData || [])
        
      } catch (error) {
        console.error('Error loading customer data:', error)
      } finally {
        setLoadingCustomers(false)
      }
    }

    if (user) {
      loadCustomerData()
      
      // Set up real-time subscription for customer updates
      const subscription = supabase
        .channel('customer-progress')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users' },
          () => loadCustomerData()
        )
        .on(
          'postgres_changes', 
          { event: '*', schema: 'public', table: 'call_transcripts' },
          () => loadCustomerData()
        )
        .subscribe()

      return () => subscription.unsubscribe()
    }
  }, [user, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }
  const toolCategories = [
    {
      title: "🚀 Business Tools",
      description: "Essential tools for building your business",
      tools: [
        { name: "Domain Checker", url: "/domain-checker", description: "Check domain availability with multiple methods and get pricing info" },

        { name: "VAPI Dashboard", url: "/vapi-dashboard", description: "Interactive voice assistant interface with transcript and controls" }
      ]
    },
    {
      title: "🎯 VAPI Core Tools",
      description: "Main VAPI integration and call management",
      tools: [
        { name: "Main VAPI Webhook", url: "/simple-vapi-webhook", description: "Core webhook handler and server" },
        { name: "VAPI System Home", url: "/simple-vapi-webhook/system-home.html", description: "Central system dashboard" },
        { name: "Server Status", url: "/simple-vapi-webhook/server.js", description: "Main server file" },
        { name: "Dynamic VAPI Integration", url: "/simple-vapi-webhook/dynamic-vapi-integration.js", description: "Dynamic call handling" },
        { name: "Intelligent Call System", url: "/simple-vapi-webhook/intelligent-call-system.js", description: "AI-powered call routing" }
      ]
    },
    {
      title: "📊 Dashboards & Monitoring",
      description: "Real-time monitoring and analytics interfaces",
      tools: [
        { name: "Admin Dashboard", url: "/simple-vapi-webhook/admin-dashboard.html", description: "Administrative interface" },
        { name: "Customer Dashboard", url: "/simple-vapi-webhook/customer-dashboard.html", description: "Customer view interface" },
        { name: "Call Dashboard", url: "/simple-vapi-webhook/call-dashboard.html", description: "Call tracking and management" },
        { name: "Web Call Dashboard", url: "/simple-vapi-webhook/web-call-dashboard.html", description: "Web-based call interface" },
        { name: "Stage Monitor", url: "/simple-vapi-webhook/stage-monitor.html", description: "Call stage monitoring" },
        { name: "Info Tracker", url: "/simple-vapi-webhook/info-tracker.html", description: "Information tracking dashboard" },
        { name: "Webhook Monitor", url: "/simple-vapi-webhook/webhook-monitor.js", description: "Real-time webhook monitoring" }
      ]
    },
    {
      title: "📞 Call Management",
      description: "Voice call handling and processing tools",
      tools: [
        { name: "Inbound Call Handler", url: "/simple-vapi-webhook/inbound-call-handler.js", description: "Handle incoming calls" },
        { name: "Inbound Call Tester", url: "/simple-vapi-webhook/inbound-call-tester.html", description: "Test inbound call system" },
        { name: "Background Call Processor", url: "/simple-vapi-webhook/background-call-processor.js", description: "Process calls in background" },
        { name: "Retroactive Processor", url: "/simple-vapi-webhook/retroactive-processor.js", description: "Process historical calls" },
        { name: "Web Call Button", url: "/simple-vapi-webhook/web-call-button.html", description: "Web-based call button" },
        { name: "Web Call Debug", url: "/simple-vapi-webhook/web-call-debug.html", description: "Debug web calls" },
        { name: "Web Call Proxy", url: "/simple-vapi-webhook/web-call-proxy.html", description: "Call proxy interface" }
      ]
    },
    {
      title: "🤖 AI & Data Processing",
      description: "AI transcript analysis and data extraction",
      tools: [
        { name: "AI Transcript Analyzer", url: "/simple-vapi-webhook/ai-transcript-analyzer.js", description: "AI-powered transcript analysis" },
        { name: "Dream DNA Extractor", url: "/simple-vapi-webhook/dream-dna-extractor.js", description: "Extract business DNA from calls" },
        { name: "Truth Table Extractor", url: "/simple-vapi-webhook/truth-table-extractor.js", description: "Extract structured data" },
        { name: "Enhanced Processor", url: "/simple-vapi-webhook/enhanced-processor.js", description: "Advanced data processing" },
        { name: "Simple Flow Demo", url: "/simple-vapi-webhook/simple-flow-demo.js", description: "Demo flow processing" }
      ]
    },
    {
      title: "🧪 Testing & QA",
      description: "Testing tools and quality assurance",
      tools: [
        { name: "Test Interface", url: "/simple-vapi-webhook/test-interface.html", description: "Main testing interface" },
        { name: "Dashboard Test", url: "/simple-vapi-webhook/dashboard-test.html", description: "Dashboard testing tool" },
        { name: "End-to-End Test", url: "/simple-vapi-webhook/end-to-end-test.js", description: "Complete system testing" },
        { name: "Test Complete System", url: "/simple-vapi-webhook/test-complete-system.js", description: "Full system test suite" },
        { name: "Test Direct Call", url: "/simple-vapi-webhook/test-direct-call.js", description: "Direct call testing" },
        { name: "Test Dynamic VAPI", url: "/simple-vapi-webhook/test-dynamic-vapi.js", description: "Dynamic VAPI testing" },
        { name: "Automated End-to-End Test", url: "/simple-vapi-webhook/automated-end-to-end-test.js", description: "Automated testing suite" },
        { name: "Comprehensive Test Suite", url: "/simple-vapi-webhook/comprehensive-test-suite.sh", description: "Complete test runner" }
      ]
    },
    {
      title: "📚 Documentation & Setup",
      description: "Setup guides and documentation",
      tools: [
        { name: "VAPI Setup Guide", url: "/simple-vapi-webhook/VAPI_SETUP_GUIDE.md", description: "Complete setup instructions" },
        { name: "Quick Setup", url: "/simple-vapi-webhook/VAPI_QUICK_SETUP.md", description: "Quick start guide" },
        { name: "Troubleshooting Guide", url: "/simple-vapi-webhook/VAPI_TROUBLESHOOTING.md", description: "Common issues and solutions" },
        { name: "Integration Complete", url: "/simple-vapi-webhook/INTEGRATION_COMPLETE.md", description: "Integration completion guide" },
        { name: "Dynamic VAPI Status", url: "/simple-vapi-webhook/DYNAMIC_VAPI_STATUS.md", description: "System status documentation" },
        { name: "Complete Testing Guide", url: "/simple-vapi-webhook/COMPLETE_TESTING_GUIDE.md", description: "Comprehensive testing guide" },
        { name: "Table of Contents", url: "/simple-vapi-webhook/TABLE_OF_CONTENTS.md", description: "Full documentation index" },
        { name: "VAPI Fix Guide", url: "/simple-vapi-webhook/vapi-fix-guide.html", description: "Common fixes and solutions" }
      ]
    },
    {
      title: "⚙️ Configuration & Forms",
      description: "Configuration files and customer forms",
      tools: [
        { name: "Customer Onboarding Form", url: "/simple-vapi-webhook/customer-onboarding-form.html", description: "Customer intake form" },
        { name: "Call Prompts (JSON)", url: "/simple-vapi-webhook/call1-prompt.json", description: "Call 1 prompt configuration" },
        { name: "Improved Call Prompts", url: "/simple-vapi-webhook/improved-call1-prompt.json", description: "Enhanced call prompts" },
        { name: "Test Request JSON", url: "/simple-vapi-webhook/test-request.json", description: "Sample test requests" },
        { name: "Calls Data", url: "/simple-vapi-webhook/calls-data.json", description: "Call data storage" },
        { name: "Start Server Script", url: "/simple-vapi-webhook/start-server.sh", description: "Server startup script" }
      ]
    },
    {
      title: "🎛️ VAPI Agent Configs",
      description: "VAPI agent configuration and prompts",
      tools: [
        { name: "Agent Setup Guide", url: "/simple-vapi-webhook/vapi-agent-configs/VAPI_SETUP_GUIDE.md", description: "Agent configuration guide" },
        { name: "Call 1 Agent Prompt", url: "/simple-vapi-webhook/vapi-agent-configs/call-1-agent-prompt.md", description: "First call agent configuration" },
        { name: "Call 2 Agent Prompt", url: "/simple-vapi-webhook/vapi-agent-configs/call-2-agent-prompt.md", description: "Second call agent configuration" },
        { name: "Call 3 Agent Prompt", url: "/simple-vapi-webhook/vapi-agent-configs/call-3-agent-prompt.md", description: "Third call agent configuration" },
        { name: "Call 4 Agent Prompt", url: "/simple-vapi-webhook/vapi-agent-configs/call-4-agent-prompt.md", description: "Fourth call agent configuration" }
      ]
    }
  ]

  return (
    <div className="container">
      <div className="header">
        <div className="header-top">
          <div>
            <h1>🛠️ Welcome back, {user?.email?.split('@')[0] || 'User'}!</h1>
            <p>Your personalized DreamSeed business dashboard</p>
          </div>
          <button onClick={handleSignOut} className="sign-out-btn">
            Sign Out
          </button>
        </div>
        <div className="stats">
          <span className="stat">
            📁 {toolCategories.length} Categories
          </span>
          <span className="stat">
            🔧 {toolCategories.reduce((total, cat) => total + cat.tools.length, 0)} Tools
          </span>
          <span className="stat">
            🚀 Full VAPI Integration
          </span>
        </div>
      </div>

      {/* Live Customer Progress Section */}
      <div className="customer-progress-section">
        <h2 className="section-title">📞 Live Customer Progress</h2>
        
        {loadingCustomers ? (
          <div className="loading-state">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading customer data...</p>
          </div>
        ) : (
          <div className="progress-grid">
            {/* Customer Progress Cards */}
            <div className="progress-column">
              <h3>🚀 Active Customers</h3>
              {customers.length === 0 ? (
                <div className="empty-state">No customers yet</div>
              ) : (
                customers.map((customer, index) => (
                  <div key={index} className="customer-card">
                    <div className="customer-header">
                      <span className="customer-name">{customer.customer_name || 'Unknown'}</span>
                      <span className="customer-phone">{customer.customer_phone}</span>
                    </div>
                    <div className="business-info">
                      <div className="business-name">{customer.business_name || 'Business TBD'}</div>
                      <div className="business-details">
                        {customer.entity_type && <span className="entity-type">{customer.entity_type}</span>}
                        {customer.state_of_operation && <span className="state">{customer.state_of_operation}</span>}
                      </div>
                    </div>
                    <div className="call-progress">
                      <span className={`call-badge ${customer.call_1_completed ? 'completed' : 'pending'}`}>
                        Call 1 {customer.call_1_completed ? '✅' : '⏳'}
                      </span>
                      <span className={`call-badge ${customer.call_2_completed ? 'completed' : 'pending'}`}>
                        Call 2 {customer.call_2_completed ? '✅' : '⏳'}
                      </span>
                      <span className={`call-badge ${customer.call_3_completed ? 'completed' : 'pending'}`}>
                        Call 3 {customer.call_3_completed ? '✅' : '⏳'}
                      </span>
                      <span className={`call-badge ${customer.call_4_completed ? 'completed' : 'pending'}`}>
                        Call 4 {customer.call_4_completed ? '✅' : '⏳'}
                      </span>
                    </div>
                    <div className="customer-meta">
                      <span className="urgency">Urgency: {customer.urgency_level || 'Unknown'}</span>
                      <span className="last-update">
                        Updated: {customer.updated_at ? new Date(customer.updated_at).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent Calls */}
            <div className="progress-column">
              <h3>📋 Recent Call Transcripts</h3>
              {recentCalls.length === 0 ? (
                <div className="empty-state">No recent calls</div>
              ) : (
                recentCalls.map((call, index) => (
                  <div key={index} className="call-card">
                    <div className="call-header">
                      <span className="call-stage">Call {call.call_stage}</span>
                      <span className="call-date">
                        {new Date(call.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="call-customer">
                      {call.users?.customer_name || 'Unknown'} - {call.users?.customer_phone}
                    </div>
                    <div className="call-summary">
                      {call.semantic_summary || 'Processing summary...'}
                    </div>
                    <div className="call-meta">
                      <span className="transcript-length">
                        {call.full_transcript?.length || 0} chars
                      </span>
                      <span className="vector-status">
                        {call.full_transcript_vector ? '🧠 Vectorized' : '⏳ Processing'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="tools-grid">
        {toolCategories.map((category, index) => (
          <div key={index} className="category-section">
            <h2 className="category-title">{category.title}</h2>
            <p className="category-description">{category.description}</p>
            <div className="tools-list">
              {category.tools.map((tool, toolIndex) => (
                <a key={toolIndex} href={tool.url} className="tool-card" target="_blank" rel="noopener noreferrer">
                  <div className="tool-name">{tool.name}</div>
                  <div className="tool-description">{tool.description}</div>
                  <div className="tool-url">{tool.url}</div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .header {
          background: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        
        .header h1 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 32px;
        }
        
        .header p {
          margin: 0;
          color: #666;
          font-size: 18px;
        }
        
        .sign-out-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }
        
        .sign-out-btn:hover {
          background: #dc2626;
        }
        
        .stats {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        
        .stat {
          background: #f8f9fa;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 500;
          color: #495057;
        }
        
        .tools-grid {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .category-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .category-title {
          margin: 0 0 8px 0;
          color: #2563eb;
          font-size: 24px;
          font-weight: 600;
        }
        
        .category-description {
          margin: 0 0 20px 0;
          color: #666;
          font-size: 16px;
        }
        
        .tools-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }
        
        .tool-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
          display: block;
        }
        
        .tool-card:hover {
          background: #e9ecef;
          border-color: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        }
        
        .tool-name {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
          font-size: 16px;
        }
        
        .tool-description {
          color: #666;
          font-size: 14px;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        
        .tool-url {
          color: #2563eb;
          font-size: 12px;
          font-family: monospace;
          background: rgba(37, 99, 235, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        /* Customer Progress Styles */
        .customer-progress-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .section-title {
          margin: 0 0 20px 0;
          color: #2563eb;
          font-size: 28px;
          font-weight: 600;
        }
        
        .loading-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        
        .progress-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        
        .progress-column h3 {
          margin: 0 0 16px 0;
          color: #1a1a1a;
          font-size: 20px;
          font-weight: 600;
        }
        
        .empty-state {
          padding: 20px;
          text-align: center;
          color: #666;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #e9ecef;
        }
        
        /* Customer Cards */
        .customer-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }
        
        .customer-card:hover {
          background: #e9ecef;
          border-color: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        }
        
        .customer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .customer-name {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 16px;
        }
        
        .customer-phone {
          font-size: 12px;
          color: #666;
          font-family: monospace;
          background: rgba(37, 99, 235, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .business-info {
          margin-bottom: 12px;
        }
        
        .business-name {
          font-weight: 500;
          color: #2563eb;
          margin-bottom: 4px;
        }
        
        .business-details {
          display: flex;
          gap: 8px;
        }
        
        .entity-type, .state {
          font-size: 12px;
          background: #e0f2fe;
          color: #0369a1;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .call-progress {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        
        .call-badge {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 500;
        }
        
        .call-badge.completed {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        
        .call-badge.pending {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }
        
        .customer-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }
        
        /* Call Cards */
        .call-card {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }
        
        .call-card:hover {
          background: #e2e8f0;
          border-color: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
        }
        
        .call-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .call-stage {
          font-weight: 600;
          color: #059669;
          background: #ecfdf5;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 12px;
        }
        
        .call-date {
          font-size: 11px;
          color: #666;
        }
        
        .call-customer {
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .call-summary {
          color: #374151;
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .call-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #666;
        }
        
        .transcript-length {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .vector-status {
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .progress-grid {
            grid-template-columns: 1fr;
          }
          
          .tools-list {
            grid-template-columns: 1fr;
          }
          
          .stats {
            flex-direction: column;
          }
          
          .header h1 {
            font-size: 24px;
          }
          
          .customer-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .call-progress {
            gap: 4px;
          }
        }
      `}</style>
    </div>
  )
}