import ModernSaaS01 from './modern-saas-01/Template'
import { SiteData } from '../lib/loadSite'

export interface TemplateProps {
  site: SiteData
}

export function getTemplateComponent(templateId: string) {
  switch (templateId) {
    case 'modern-saas-01':
      return ModernSaaS01
    default:
      return ModernSaaS01
  }
}
