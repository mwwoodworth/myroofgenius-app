import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://myroofgenius.com';
  const pages = [
    { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${baseUrl}/marketplace`, changefreq: 'daily', priority: '0.8' },
    { loc: `${baseUrl}/blog`, changefreq: 'weekly', priority: '0.6' }
  ];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data } = await supabase
      .from('products')
      .select('id')
      .eq('is_active', true);
    for (const row of data || []) {
      pages.push({
        loc: `${baseUrl}/product/${row.id}`,
        changefreq: 'weekly',
        priority: '0.7'
      });
    }
  }

  const xml = [
    "<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>",
    ...pages.map(
      p =>
        `  <url><loc>${p.loc}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
    ),
    '</urlset>'
  ].join('\n');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
