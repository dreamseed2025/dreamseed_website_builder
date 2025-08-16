export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#141416',
      color: 'white',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ color: '#9ca3af' }}>
        Debug: Next.js not-found.tsx is working
      </p>
      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '2rem' }}>
        Version: 1.3.9 | Root Directory: dreamseed_website_builder
      </p>
    </div>
  )
}