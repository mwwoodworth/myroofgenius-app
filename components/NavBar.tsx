"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Shield, FilePlus } from "lucide-react";
import Button from "./ui/Button";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/analysis", label: "Instant Roof Analysis", icon: Shield },
    { href: "/proposal", label: "Create Field Proposal", icon: FilePlus },
  ];
  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-lg">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="font-bold text-lg" aria-label="MyRoofGenius">
          MyRoofGenius
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center space-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
          <Button as="a" href="/get-started" className="ml-4">
            Start Free Analysis
          </Button>
        </div>
        <button
          className="md:hidden p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden bg-bg border-t border-gray-200">
          <div className="flex flex-col space-y-4 p-4">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center space-x-2 py-2"
                onClick={() => setOpen(false)}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
          <div className="p-4 sticky bottom-0 bg-bg border-t border-gray-200">
            <Button as="a" href="/get-started" className="w-full">
              Start Free Analysis
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
