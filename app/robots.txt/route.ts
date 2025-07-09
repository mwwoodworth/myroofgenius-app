export const dynamic = 'force-dynamic';

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://myroofgenius.com';
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /dashboard/',
    `Sitemap: ${baseUrl}/sitemap.xml`
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain' }
  });
}
