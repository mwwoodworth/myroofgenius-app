import React from 'react'
import {
  HardHat,
  ShieldCheck,
  Building2,
  BrainCircuit,
} from 'lucide-react'

/**
 * Logo component used across the site.
 */
export const Logo: React.FC = () => (
  <span className="inline-flex items-center font-bold">
    <HardHat size={18} className="mr-1" />
    MyRoofGenius
  </span>
)

const currentYear = new Date().getFullYear()

/**
 * Global site configuration
 */
const siteConfig = {
  logo: Logo,
  seo: {
    title: 'MyRoofGenius',
    description:
      'Intelligent systems that protect every commercial roofing decision.',
    titleTemplate: '%s – MyRoofGenius',
    openGraph: {
      type: 'website',
      url: 'https://myroofgenius.com',
      title: 'MyRoofGenius',
      description:
        'Intelligent systems that protect every commercial roofing decision.',
    },
    twitter: {
      handle: '@myroofgenius',
      site: '@myroofgenius',
      cardType: 'summary_large_image',
    },
  },
  header: {
    links: [
      { id: 'home', label: 'Home' },
      { id: 'benefits', label: 'Benefits' },
      { id: 'features', label: 'Features' },
      { href: '/signup', label: 'Sign Up' },
    ],
  },
  footer: {
    copyright: `© ${currentYear} MyRoofGenius`,
    links: [
      { href: '/', label: 'Home' },
      { href: '/signup', label: 'Sign Up' },
      { href: '/login', label: 'Log in' },
    ],
  },
  signup: {
    title: 'Create your account',
    text:
      'Start protecting your roofing decisions with AI-powered tools.',
    features: [
      {
        title: 'Accurate estimates',
        icon: Building2,
        description: 'Get AI-generated cost predictions for every project.',
      },
      {
        title: 'Risk analysis',
        icon: ShieldCheck,
        description: 'Identify material and code issues before they occur.',
      },
      {
        title: 'Smart planning',
        icon: BrainCircuit,
        description: 'Leverage machine learning to optimize your workflow.',
      },
    ],
  },
  termsUrl: '/terms',
  privacyUrl: '/privacy',
}

export default siteConfig
