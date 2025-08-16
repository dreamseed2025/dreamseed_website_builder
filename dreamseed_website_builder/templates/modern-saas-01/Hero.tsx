import { SiteData } from '../../lib/loadSite'

interface HeroProps {
  hero: SiteData['profile_json']['content']['hero']
  theme: SiteData['profile_json']['design']['theme']
}

export default function Hero({ hero, theme }: HeroProps) {
  if (!hero) return null

  const backgroundImage = hero.media?.background_image || ''
  
  return (
    <section 
      className="section"
      style={{
        minHeight: '80vh',
        background: backgroundImage 
          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage})`
          : `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center'
      }}
    >
      <div className="container">
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          maxWidth: '900px',
          margin: '0 auto 1.5rem auto'
        }}>
          {hero.headline}
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem auto',
          opacity: 0.9
        }}>
          {hero.subheadline}
        </p>
        
        <a 
          href={hero.cta_url || '#'}
          className="btn-primary"
          style={{
            display: 'inline-block',
            backgroundColor: theme.accent_color,
            fontSize: '1.1rem',
            padding: '1rem 2rem',
            textDecoration: 'none'
          }}
        >
          {hero.cta_text}
        </a>
      </div>
    </section>
  )
}
