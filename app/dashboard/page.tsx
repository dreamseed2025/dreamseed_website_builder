'use client'

export default function Dashboard() {
  const toolCategories = [
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
        <h1>🛠️ DreamSeed Tools Dashboard</h1>
        <p>Complete directory of all VAPI tools, dashboards, and utilities</p>
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
        
        .header h1 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 32px;
        }
        
        .header p {
          margin: 0 0 20px 0;
          color: #666;
          font-size: 18px;
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
        
        @media (max-width: 768px) {
          .tools-list {
            grid-template-columns: 1fr;
          }
          
          .stats {
            flex-direction: column;
          }
          
          .header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  )
}