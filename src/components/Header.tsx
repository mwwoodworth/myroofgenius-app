import Link from 'next/link'
import siteConfig from '../data/config'

export default function Header() {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between border-b">
      <span className="text-lg font-semibold">
        <Link href="/">{siteConfig.name}</Link>
      </span>
      <nav className="space-x-4 text-sm">
        {siteConfig.header.links.map(({ id, label, href }) => (
          <Link key={id} href={href} className="hover:underline">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
