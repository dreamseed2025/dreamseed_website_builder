import { SiteData } from '../../lib/loadSite'

interface ServicesProps {
  services: SiteData['profile_json']['content']['services']
  theme: SiteData['profile_json']['design']['theme']
}

export default function Services({ services, theme }: ServicesProps) {
  if (!services || services.length === 0) return null

  return (
    <section className="section" style={{ backgroundColor: '#f9fafb' }}>
      <div className="container">
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '3rem',
          color: theme.primary_color
        }}>
          Our Services
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {services.map((service) => (
            <div 
              key={service.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}
            >
              {service.image && (
                <img 
                  src={service.image} 
                  alt={service.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '0.25rem',
                    marginBottom: '1.5rem'
                  }}
                />
              )}
              
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: theme.primary_color
              }}>
                {service.name}
              </h3>
              
              <p style={{
                color: '#6b7280',
                marginBottom: '1.5rem'
              }}>
                {service.description}
              </p>
              
              <ul style={{ textAlign: 'left', color: '#374151' }}>
                {service.features.map((feature, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
