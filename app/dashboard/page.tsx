'use client'

import { useState, useEffect } from 'react'

interface Dream {
  id: string
  dream_name: string
  customer_name: string
  customer_email: string
  entity_type: string
  state_of_operation: string
  completion_percentage: number
  created_at: string
  stage: number
}

export default function Dashboard() {
  const [dreams, setDreams] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDreams()
  }, [])

  async function loadDreams() {
    try {
      const response = await fetch('/api/all')
      if (!response.ok) {
        throw new Error('Failed to fetch dreams')
      }
      const data = await response.json()
      setDreams(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dreams')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>🌱 DreamSeed - Dashboard</h1>
          <p>Loading dreams...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <h1>🌱 DreamSeed - Dashboard</h1>
          <p className="error">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🌱 DreamSeed - Dashboard</h1>
        <p>Complete view of customer dreams from voice AI to launched business</p>
        <div className="stats">
          <span className="stat">
            📊 Total Dreams: {dreams.length}
          </span>
          <span className="stat">
            ✅ Active: {dreams.filter(d => d.completion_percentage < 100).length}
          </span>
          <span className="stat">
            🎉 Completed: {dreams.filter(d => d.completion_percentage === 100).length}
          </span>
        </div>
      </div>

      <div className="dreams-grid">
        {dreams.length === 0 ? (
          <div className="empty-state">
            <h3>No dreams yet</h3>
            <p>Customer dreams will appear here as they complete VAPI calls</p>
          </div>
        ) : (
          dreams.map((dream) => (
            <div key={dream.id} className="dream-card">
              <div className="dream-name">
                {dream.dream_name || 'Untitled Dream'}
              </div>
              <div className="customer-name">
                👤 {dream.customer_name || 'Unknown Customer'}
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${dream.completion_percentage || 0}%` }}
                />
              </div>
              <div className="progress-text">
                {dream.completion_percentage || 0}% Complete
              </div>
              
              <div className="details">
                📧 {dream.customer_email || 'No email'}<br/>
                🏢 {dream.entity_type || 'LLC'} in {dream.state_of_operation || 'Unknown'}<br/>
                📅 Started: {new Date(dream.created_at).toLocaleDateString()}<br/>
                🎯 Stage: {dream.stage || 1}/4
              </div>
              
              <div className="next-action">
                {dream.completion_percentage === 100 
                  ? '🎉 Dream completed!' 
                  : `⏳ Next: Call ${(dream.stage || 1) + 1}`
                }
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .header {
          background: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .header h1 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 28px;
        }
        
        .header p {
          margin: 0 0 20px 0;
          color: #666;
          font-size: 16px;
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
        
        .dreams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
        }
        
        .dream-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .dream-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        
        .dream-name {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .customer-name {
          color: #666;
          margin-bottom: 16px;
          font-size: 14px;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          margin: 12px 0 8px 0;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745, #20c997);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          text-align: center;
          font-size: 12px;
          font-weight: 500;
          color: #495057;
          margin-bottom: 16px;
        }
        
        .details {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
          margin-bottom: 16px;
        }
        
        .next-action {
          background: #e8f5e8;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #155724;
          text-align: center;
        }
        
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
        
        .empty-state h3 {
          margin: 0 0 8px 0;
          color: #495057;
        }
        
        .error {
          color: #dc3545;
          background: #f8d7da;
          padding: 12px;
          border-radius: 8px;
          margin-top: 16px;
        }
      `}</style>
    </div>
  )
}