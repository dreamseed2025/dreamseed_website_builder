import { SiteData } from '../../lib/loadSite'

interface PricingProps {
  pricing: SiteData['profile_json']['content']['pricing']
  theme: SiteData['profile_json']['design']['theme']
}

export default function Pricing({ pricing, theme }: PricingProps) {
  if (!pricing || pricing.length === 0) return null

  return (
    <section style={{ padding: '4rem 1rem', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '3rem', 
          color: theme.primary_color,
          textAlign: 'center'
        }}>
          Choose Your Launch Plan
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {pricing.map((plan, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}
            >
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: theme.primary_color
              }}>
                {plan.name}
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: 'bold', color: theme.primary_color }}>
                  ${plan.price}
                </span>
              </div>
              
              <p style={{
                marginBottom: '2rem',
                color: '#6b7280'
              }}>
                {plan.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}