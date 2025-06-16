import React from 'react';
import { Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center space-x-2">
          <Menu className="text-[#2366d1]" />
          <span className="font-extrabold text-xl text-[#202940]">MyRoofGenius</span>
        </a>
        <nav className="hidden md:flex space-x-6 font-medium text-[#202940]">
          <a href="/" className="hover:text-[#2366d1]">Home</a>
          <a href="/marketplace" className="hover:text-[#2366d1]">Marketplace</a>
          <a href="/blog" className="hover:text-[#2366d1]">Blog</a>
          <a href="/about" className="hover:text-[#2366d1]">About</a>
        </nav>
        <a href="/account" className="hidden md:inline-block bg-[#2366d1] hover:bg-[#1e59b8] text-white py-2 px-4 rounded-lg transition">
          Dashboard
        </a>
      </div>
    </header>
  );
};

export default Header;
