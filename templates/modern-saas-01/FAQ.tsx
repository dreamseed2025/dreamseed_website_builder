import { SiteData } from '../../lib/loadSite'

interface FAQProps {
  faq: SiteData['profile_json']['content']['faq']
  theme: SiteData['profile_json']['design']['theme']
}

export default function FAQ({ faq, theme }: FAQProps) {
  if (!faq || faq.length === 0) return null

  return (
    <section style={{ padding: '4rem 1rem', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '3rem', 
          color: theme.primary_color,
          textAlign: 'center'
        }}>
          Frequently Asked Questions
        </h2>
        
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faq.map((item, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: theme.primary_color
              }}>
                {item.q}
              </h3>
              
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}