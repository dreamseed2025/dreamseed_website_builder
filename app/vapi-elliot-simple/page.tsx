export default function VAPIElliotSimple() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            color: '#495057'
          }}>
            🎤 VAPI Elliot Widget
          </h1>
          <p style={{ fontSize: '16px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Ready for VAPI widget embed code
          </p>
        </div>

        {/* Widget Container */}
        <div style={{
          height: '400px',
          border: '2px dashed #e9ecef',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa',
          marginBottom: '30px'
        }}>
          <div style={{ textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎤</div>
            <p><strong>VAPI Widget Embed Code</strong></p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Please provide the embed code from your VAPI dashboard
            </p>
            <p style={{ fontSize: '12px', marginTop: '8px', color: '#adb5bd' }}>
              Assistant ID: 87416134-cfc7-47de-ad97-4951d3905ea9
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
            🎯 Next Steps
          </h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
            <li>Copy the VAPI widget embed code from your dashboard</li>
            <li>Share it with me</li>
            <li>I'll integrate it to hear real Elliot voice</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
