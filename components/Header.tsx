'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-3 transition-colors duration-300 " +
        (scrolled
          ? "bg-[#001A33]/90 backdrop-blur-md shadow-lg"
          : "bg-white/10 backdrop-blur-md")
      }
    >
      <Link href="/" className="text-xl font-bold tracking-tight">
        MyRoofGenius
      </Link>
      <nav className="hidden md:flex space-x-8">
        <Link href="/tools" className="hover:text-primary transition">Tools</Link>
        <Link href="/pricing" className="hover:text-primary transition">Pricing</Link>
        <Link href="/about" className="hover:text-primary transition">About</Link>
        <Link href="/docs" className="hover:text-primary transition">Docs</Link>
      </nav>
      <div className="flex items-center space-x-4">
        <SearchBar />
      </div>
    </header>
  );
}
