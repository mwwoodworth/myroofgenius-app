import React from 'react';
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import siteConfig from '#data/config';

const Footer = () => {
  return (
    <footer className="bg-[#202940] text-gray-200 py-12">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-2">{siteConfig.seo.title}</h3>
          <p className="text-sm">{siteConfig.seo.description}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            {siteConfig.footer.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="#"><Facebook /></a>
            <a href="#"><Twitter /></a>
            <a href="#"><Linkedin /></a>
          </div>
        </div>
      </div>
      <p className="text-center text-xs mt-8">{siteConfig.footer.copyright}</p>
    </footer>
  );
};

export default Footer;
