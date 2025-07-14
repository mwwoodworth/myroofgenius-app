import { useEffect, useState } from 'react';
import Link from 'next/link';
import StarfieldBackground from './StarfieldBackground';

/**
 * Header component with scroll detection and desktop starfield background.
 */
const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      {/* Starfield only on medium+ screens */}
      <div className="hidden md:block absolute inset-0 -z-10 pointer-events-none">
        <StarfieldBackground />
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <Link href="/" className="text-xl font-bold text-primary-600">
          MyRoofGenius
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/#how-it-works" className="hover:text-primary-600">
            How it works
          </Link>
          <Link href="/pricing" className="hover:text-primary-600">
            Pricing
          </Link>
          <Link href="/contact" className="hover:text-primary-600">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
