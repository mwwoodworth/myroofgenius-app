import React from 'react';
import { HardHat } from 'lucide-react';

export const Logo: React.FC = () => (
  <span className="inline-flex items-center font-bold">
    <HardHat size={18} className="mr-1" />
    MyRoofGenius
  </span>
);

export const seo = {
  title: 'MyRoofGenius',
  description:
    'Intelligent systems that protect every commercial roofing decision.',
};

export const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export const signupText =
  'Start protecting your roofing decisions with AI-powered tools.';
