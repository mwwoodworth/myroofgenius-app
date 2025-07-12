'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs() {
  const pathname = usePathname() ?? "";
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const label = seg.charAt(0).toUpperCase() + seg.slice(1);
    return { href, label };
  });
  if (!crumbs.length) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className="fixed top-16 left-4 z-40 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md px-3 py-1 rounded-lg text-sm shadow"
    >
      <ol className="flex space-x-1">
        <li>
          <Link href="/" className="hover:underline">
            Home
          </Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center">
            <span className="mx-1">/</span>
            {i === crumbs.length - 1 ? (
              <span aria-current="page">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:underline">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
