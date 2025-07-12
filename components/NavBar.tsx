"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";
import ThemeToggle from "./ui/ThemeToggle";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Home" },
    { href: "/tools", label: "Tools" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/fieldapps", label: "Field Apps" },
    { href: "/blog", label: "Blog" },
  ];
  return (
    <header className="sticky top-0 z-50 glass-navbar">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="font-bold text-lg" aria-label="MyRoofGenius">
          MyRoofGenius
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Login
          </Link>
          <Button as="a" href="/signup" className="ml-2">
            Sign Up
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <button
            className="md:hidden p-3 w-11 h-11 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-bg border-t border-gray-200 overflow-hidden"
          >
            <div className="flex flex-col space-y-4 p-4">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="py-3.5"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/login"
                className="py-3.5"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Button
                as="a"
                href="/signup"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Sign Up
              </Button>
            </div>
            <div className="p-4 sticky bottom-0 bg-bg border-t border-gray-200 flex items-center justify-between">
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
