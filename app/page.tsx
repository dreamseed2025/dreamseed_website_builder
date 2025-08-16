import Link from 'next/link'

export default function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">🌱 DreamSeed</h1>
        <p className="hero-subtitle">Launch Your Dream Business With One Click</p>
        <p className="version">Version 3.0.2 - Dashboard Navigation Added</p>
        
        <div className="action-buttons">
          <Link href="/dashboard" className="btn btn-primary">
            View Dashboard
          </Link>
          <a href="/simple-vapi-webhook" className="btn btn-secondary">
            VAPI Tools
          </a>
        </div>
      </div>
      
      <div className="features-section">
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📞</div>
            <h3>Voice AI Calls</h3>
            <p>Automated business formation consultation calls</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Dashboard</h3>
            <p>Track customer dreams and business formation progress</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Processing</h3>
            <p>Intelligent transcript analysis and data extraction</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Quick Launch</h3>
            <p>From idea to business entity in record time</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .home-container {
          min-height: 100vh;
          padding: 40px 20px;
        }
        
        .hero-section {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          padding: 60px 0;
        }
        
        .hero-title {
          font-size: 48px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 16px;
        }
        
        .hero-subtitle {
          font-size: 24px;
          color: #495057;
          margin-bottom: 8px;
          font-weight: 400;
        }
        
        .version {
          font-size: 16px;
          color: #6c757d;
          margin-bottom: 40px;
        }
        
        .action-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
          display: inline-block;
        }
        
        .btn-primary {
          background: #2563eb;
          color: white;
        }
        
        .btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }
        
        .btn-secondary {
          background: white;
          color: #2563eb;
          border: 2px solid #2563eb;
        }
        
        .btn-secondary:hover {
          background: #2563eb;
          color: white;
          transform: translateY(-1px);
        }
        
        .features-section {
          max-width: 1000px;
          margin: 80px auto 0;
        }
        
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }
        
        .feature-card {
          background: white;
          padding: 32px 24px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-4px);
        }
        
        .feature-icon {
          font-size: 40px;
          margin-bottom: 16px;
        }
        
        .feature-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .feature-card p {
          color: #6c757d;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}