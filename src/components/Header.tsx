import siteConfig from '#data/config';

export default function Header() {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between border-b">
      <span className="text-lg font-semibold">{siteConfig.seo.title}</span>
      <nav className="space-x-4">
        {siteConfig.header.links.map((link) => (
          <a key={link.href || link.id} href={link.href || `/#${link.id}`} className="hover:underline">
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
