import { SiteData } from '../../lib/loadSite'

interface AboutProps {
  about: SiteData['profile_json']['content']['about']
  theme: SiteData['profile_json']['design']['theme']
}

export default function About({ about, theme }: AboutProps) {
  if (!about) return null

  return (
    <section style={{ padding: '4rem 1rem', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '2rem', 
          color: theme.primary_color,
          textAlign: 'center'
        }}>
          {about.title}
        </h2>
        
        <p style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          maxWidth: '800px',
          margin: '0 auto 3rem auto',
          textAlign: 'center'
        }}>
          {about.description}
        </p>

        {about.team_members && about.team_members.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {about.team_members.map((member, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}>
                {member.image && (
                  <img 
                    src={member.image} 
                    alt={member.name}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      margin: '0 auto 1rem auto',
                      display: 'block'
                    }}
                  />
                )}
                <h3 style={{ color: theme.primary_color, marginBottom: '0.5rem' }}>
                  {member.name}
                </h3>
                <p style={{ color: theme.accent_color, fontWeight: 'bold', marginBottom: '1rem' }}>
                  {member.role}
                </p>
                <p style={{ color: '#6b7280' }}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}