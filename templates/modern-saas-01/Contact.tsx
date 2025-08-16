import { SiteData } from '../../lib/loadSite'

interface ContactProps {
  contact: SiteData['profile_json']['content']['contact']
  theme: SiteData['profile_json']['design']['theme']
}

export default function Contact({ contact, theme }: ContactProps) {
  if (!contact) return null

  return (
    <section style={{ padding: '4rem 1rem', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '3rem', 
          color: theme.primary_color,
          textAlign: 'center'
        }}>
          Get In Touch
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              color: theme.primary_color,
              marginBottom: '1rem'
            }}>
              Email
            </h3>
            <p style={{ color: '#6b7280' }}>
              {contact.email}
            </p>
          </div>

          {contact.phone && (
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                color: theme.primary_color,
                marginBottom: '1rem'
              }}>
                Phone
              </h3>
              <p style={{ color: '#6b7280' }}>
                {contact.phone}
              </p>
            </div>
          )}

          {contact.address && (
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                color: theme.primary_color,
                marginBottom: '1rem'
              }}>
                Address
              </h3>
              <p style={{ color: '#6b7280' }}>
                {contact.address}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}