import { SiteData } from '../../lib/loadSite'
import Hero from './Hero'
import About from './About'
import Services from './Services'
import Pricing from './Pricing'
import Testimonials from './Testimonials'
import FAQ from './FAQ'
import Contact from './Contact'

interface TemplateProps {
  site: SiteData
}

export default function ModernSaaS01Template({ site }: TemplateProps) {
  const { profile_json } = site
  const { content, design } = profile_json
  
  return (
    <div>
      <Hero hero={content.hero} theme={design.theme} />
      <About about={content.about} theme={design.theme} />
      <Services services={content.services} theme={design.theme} />
      <Pricing pricing={content.pricing} theme={design.theme} />
      <Testimonials testimonials={content.testimonials} theme={design.theme} />
      <FAQ faq={content.faq} theme={design.theme} />
      <Contact contact={content.contact} theme={design.theme} />
    </div>
  )
}