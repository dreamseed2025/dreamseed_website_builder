import siteData from '../dreamseed_profile.json'

export interface SiteData {
  slug: string
  company_name: string
  template_id: string
  domain: string
  status: string
  profile_json: {
    design: {
      template: string
      theme: {
        primary_color: string
        secondary_color: string
        accent_color: string
        font_primary: string
        font_secondary: string
      }
      layout: {
        header_style: string
        footer_style: string
        sidebar: boolean
      }
    }
    content: {
      hero: {
        headline: string
        subheadline: string
        cta_text: string
        cta_url: string
        media?: {
          background_image?: string
        }
      }
      about: {
        title: string
        description: string
        team_members: Array<{
          name: string
          role: string
          bio: string
          image: string
        }>
      }
      services: Array<{
        id: string
        name: string
        description: string
        features: string[]
        icon: string
        image: string
      }>
      pricing: Array<{
        name: string
        price: number
        currency: string
        description: string
      }>
      testimonials: Array<{
        id: string
        name: string
        company: string
        role: string
        quote: string
        rating: number
        image: string
        featured: boolean
      }>
      faq: Array<{
        q: string
        a: string
      }>
      contact: {
        email: string
        phone: string
        address: string
        social_media: Record<string, string>
        business_hours: Record<string, string>
      }
      seo: {
        title: string
        description: string
        og_image: string
        keywords: string[]
      }
    }
    integrations: {
      forms: {
        contact_form_endpoint: string
        newsletter_endpoint: string
      }
    }
    page_seo: {
      home: {
        title: string
        description: string
        og_image: string
      }
    }
  }
  images: Array<{
    label: string
    url: string
  }>
}

export function loadSite(): SiteData {
  return siteData as SiteData
}
