import { SiteData } from '../../lib/loadSite'

interface TestimonialsProps {
  testimonials: SiteData['profile_json']['content']['testimonials']
  theme: SiteData['profile_json']['design']['theme']
}

export default function Testimonials({ testimonials, theme }: TestimonialsProps) {
  if (!testimonials || testimonials.length === 0) return null

  return (
    <section style={{ padding: '4rem 1rem', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '3rem', 
          color: theme.primary_color,
          textAlign: 'center'
        }}>
          What Our Clients Say
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <p style={{
                fontSize: '1.1rem',
                marginBottom: '1.5rem',
                fontStyle: 'italic',
                color: '#374151'
              }}>
                "{testimonial.quote}"
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {testimonial.image && (
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: '1rem'
                    }}
                  />
                )}
                <div>
                  <h4 style={{ 
                    color: theme.primary_color,
                    marginBottom: '0.25rem'
                  }}>
                    {testimonial.name}
                  </h4>
                  <p style={{ 
                    color: '#6b7280',
                    fontSize: '0.9rem'
                  }}>
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}