import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { Calendar, Clock, User } from 'lucide-react';
import { constructMetadata } from '../lib/metadata';

export const metadata = constructMetadata({
  title: 'Blog | MyRoofGenius - Roofing Industry Insights & AI Updates',
  description: 'Discover the latest roofing industry trends, AI technology updates, and expert insights. Learn how artificial intelligence is transforming roofing businesses.',
  keywords: ['roofing blog', 'AI roofing insights', 'contractor tips', 'roofing industry news', 'construction technology blog'],
});

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const postsDirectory = join(process.cwd(), 'data/posts');
    const filenames = readdirSync(postsDirectory);
    
    const posts = filenames
      .filter(name => name.endsWith('.md'))
      .map(name => {
        const fullPath = join(postsDirectory, name);
        const fileContents = readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        
        return {
          slug: name.replace(/\.md$/, ''),
          title: data.title || 'Untitled',
          excerpt: data.excerpt || content.slice(0, 200) + '...',
          date: data.date || new Date().toISOString(),
          author: data.author || 'MyRoofGenius AI',
          readTime: data.readTime || '5 min read',
          tags: data.tags || [],
          featured: data.featured || false
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return posts;
  } catch (error) {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Roofing <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Intelligence</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Expert insights, AI-powered analysis, and industry trends from the future of roofing
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">No blog posts yet</h2>
            <p className="text-slate-400">Check back soon for AI-generated roofing insights!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 h-full">
                  {post.featured && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full mb-4">
                      <span className="text-xs text-yellow-300 font-medium">Featured</span>
                    </div>
                  )}
                  
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-white/10 rounded-full text-xs text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 text-sm text-slate-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <time>{new Date(post.date).toLocaleDateString()}</time>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}