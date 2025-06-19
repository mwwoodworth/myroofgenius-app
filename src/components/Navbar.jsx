import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-[#202940] text-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">MyRoofGenius</Link>
        <nav className="space-x-4 hidden md:block">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/services" className="hover:text-white">Services</Link>
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
