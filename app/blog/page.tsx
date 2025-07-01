import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';

// Add dynamic export to prevent static generation
export const dynamic = 'force-dynamic';

async function getBlogPosts() {
  // Handle missing env vars gracefully
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not configured');
    return [];
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  return data || [];
}

// Static blog posts for initial content
const staticPosts = [
  {
    id: '1',
    slug: 'hidden-cost-drivers-commercial-roofing',
    title: '10 Hidden Cost Drivers in Commercial Roofing Projects',
    excerpt: 'Identify budget risks before they compromise your project. Learn about the concealed expenses that can increase project costs by 15-35%.',
    author: 'Mike Woodworth',
    published_at: '2025-06-15',
    category: 'Cost Management',
    read_time: '8 min read',
    image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop'
  },
  {
    id: '2',
    slug: 'cash-flow-management-roofing-contractors',
    title: 'Cash Flow Management for Roofing Contractors',
    excerpt: 'Master the art of project cash flow forecasting to maintain healthy margins and avoid costly financing.',
    author: 'Mike Woodworth',
    published_at: '2025-06-10',
    category: 'Financial Management',
    read_time: '6 min read',
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop'
  },
  {
    id: '3',
    slug: 'colorado-roofing-compliance-guide',
    title: 'Colorado Roofing Compliance: What You Need to Know',
    excerpt: 'Navigate Class 4 impact requirements, snow load calculations, and local building codes with confidence.',
    author: 'Sarah Chen',
    published_at: '2025-06-05',
    category: 'Compliance',
    read_time: '10 min read',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop'
  }
];

export default async function Blog() {
  const dbPosts = await getBlogPosts();
  const posts = dbPosts.length > 0 ? dbPosts : staticPosts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Industry Insights & Best Practices</h1>
          <p className="text-xl text-gray-300">
            Expert guidance on estimation, project management, and growing your roofing business
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {posts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Image
                  src={posts[0].image_url}
                  alt={posts[0].title}
                  width={800}
                  height={600}
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
              <div>
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  Featured Article
                </span>
                <h2 className="text-3xl font-bold mt-4 mb-4">
                  <Link href={`/blog/${posts[0].slug}`} className="hover:text-blue-600">
                    {posts[0].title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  {posts[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{posts[0].author}</span>
                  <span>•</span>
                  <span>{new Date(posts[0].published_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{posts[0].read_time}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Recent Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <Link href={`/blog/${post.slug}`}>
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-6">
                  <span className="text-blue-600 text-sm font-semibold">
                    {post.category}
                  </span>
                  <h3 className="text-xl font-semibold mt-2 mb-3">
                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{post.read_time}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Get Weekly Industry Updates
          </h2>
          <p className="text-blue-100 mb-6">
            Join 2,800+ contractors receiving actionable insights every Tuesday
          </p>
          <Link
            href="/#newsletter"
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 font-semibold"
          >
            Subscribe Now
          </Link>
        </div>
      </section>
    </div>
  );
}