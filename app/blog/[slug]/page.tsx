import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";

// Add dynamic params export to handle dynamic routes
export async function generateStaticParams() {
  // Return empty array to disable static generation for dynamic routes
  return [];
}

async function getBlogPost(slug: string) {
  // Handle missing env vars gracefully
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.warn("Supabase environment variables not configured");
    return null;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();

  return data;
}

// Static content for demo
const staticContent = {
  "hidden-cost-drivers-commercial-roofing": `
    <div class="prose prose-lg max-w-none">
      <p class="lead">Commercial roofing projects frequently exceed initial budgets not because of poor estimation, but due to hidden cost drivers that remain unidentified during the planning phase. These concealed expenses can increase project costs by 15-35% and extend timelines by weeks or even months.</p>
      
      <h2>The 10 Hidden Cost Drivers</h2>
      
      <h3>1. Underlying Deck Deterioration</h3>
      <p>Structural damage to the roof deck often remains undetected until the existing roofing system is removed. Moisture intrusion, previous leaks, or aging buildings can cause significant deck deterioration requiring replacement rather than simple repairs. This single factor can increase material costs by 20-30% and add 3-5 days to project schedules.</p>
      
      <h3>2. Code Compliance Updates</h3>
      <p>Building codes evolve regularly, and existing roofing systems may have been grandfathered under previous standards. When undertaking a major roofing project, upgrades to meet current energy codes, drainage requirements, safety standards, and structural provisions become mandatory, adding 5-15% to overall project costs.</p>
      
      <h3>3. Inadequate Drainage Systems</h3>
      <p>Poor drainage is a leading cause of premature roof failure and often requires significant redesign during replacement projects. Addressing slope inadequacies, adding drainage points, or resizing drains and scuppers can add substantial unexpected costs that weren't factored into initial proposals focused primarily on roofing materials.</p>
      
      <h3>4. Hidden Asbestos or Hazardous Materials</h3>
      <p>Older commercial buildings may contain asbestos in roofing felts, mastics, flashing cements, or insulation boards. Discovery of these materials triggers mandatory abatement procedures that can add $3-8 per square foot and extend project timelines by 1-3 weeks depending on the extent of contamination.</p>
      
      <h3>5. Unforeseen Deck Type Transitions</h3>
      <p>Commercial buildings constructed in phases or with additions often have different deck types that weren't accounted for in initial inspections. These transitions require specialized detailing, different fastening systems, and additional material accommodations that increase labor costs and material requirements.</p>
      
      <div class="bg-secondary-700/5 p-6 rounded-lg my-8">
        <h4 class="text-xl font-semibold mb-3">Pro Tip: Pre-Project Inspection</h4>
        <p>Invest in comprehensive pre-project inspections including core samples and infrared scans. The $2,000-5,000 investment typically saves 10x in avoided surprises.</p>
      </div>
      
      <h3>6. Concealed Roof Penetrations</h3>
      <p>HVAC systems, plumbing vents, electrical conduits, and abandoned equipment curbs are frequently undocumented or misrepresented on building plans. Each penetration requires specific flashing details and often specialized materials, with each unexpected penetration adding $150-600 to project costs.</p>
      
      <h3>7. Building Settlement Issues</h3>
      <p>Over time, buildings settle unevenly, creating low spots where water ponds. Addressing these areas requires additional fill insulation, cricket structures, or tapered systems that weren't included in standard replacement estimates but are essential for proper performance of the new system.</p>
      
      <h3>8. Equipment Relocation Requirements</h3>
      <p>Rooftop units often need temporary relocation or raising to properly install new roofing systems beneath them. This specialized work typically requires licensed mechanical contractors, crane rentals, and after-hours scheduling that can add $1,500-5,000 per unit to overall project costs.</p>
      
      <h3>9. Insufficient Wall Flashing Height</h3>
      <p>Current commercial roofing standards require minimum flashing heights of 8-12 inches above the roof surface. Many older buildings were constructed with inadequate clearance, necessitating wall modifications, counterflashing adjustments, or custom solutions that significantly increase labor and material expenses.</p>
      
      <h3>10. Hidden Moisture in Existing Insulation</h3>
      <p>Infrared scans can miss moisture trapped within insulation boards, particularly in complex multi-layer systems. Discovering widespread wet insulation during tear-off requires complete replacement rather than reuse, potentially increasing insulation costs by 30-100% depending on the affected area.</p>
      
      <h2>Take Control of Your Roofing Project</h2>
      <p>Understanding these hidden cost drivers is the first step to avoiding budget overruns. Our Quote-to-Close Kit provides comprehensive tools to identify and account for these factors before they impact your project.</p>
    </div>
  `,
};

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  // Try to get from database first
  let post = await getBlogPost(params.slug);

  // If not in database, check static content
  if (!post && staticContent[params.slug as keyof typeof staticContent]) {
    post = {
      slug: params.slug,
      title: "10 Hidden Cost Drivers in Commercial Roofing Projects",
      content: staticContent[params.slug as keyof typeof staticContent],
      author: "Mike Woodworth",
      published_at: "2025-06-15",
      category: "Cost Management",
      read_time: "8 min read",
    };
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            datePublished: post.published_at,
            author: { "@type": "Person", name: post.author },
            publisher: {
              "@type": "Organization",
              name: "MyRoofGenius",
              logo: {
                "@type": "ImageObject",
                url: "https://myroofgenius.com/logo.png",
              },
            },
          }),
        }}
      />
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/blog" className="text-gray-500 hover:text-gray-700">
            Blog
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{post.category}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span className="font-medium">{post.author}</span>
            <span>•</span>
            <time>{new Date(post.published_at).toLocaleDateString()}</time>
            <span>•</span>
            <span>{post.read_time}</span>
          </div>
        </header>

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA Section */}
        <div className="mt-12 p-8 bg-gray-50 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Avoid These Costly Mistakes?
          </h3>
          <p className="text-gray-600 mb-6">
            Download our comprehensive Quote-to-Close Kit and take control of
            your next roofing project.
          </p>
          <Link
            href="/marketplace"
            className="inline-block bg-secondary-700 text-white px-6 py-3 rounded-lg hover:bg-secondary-700/80"
          >
            Browse Our Tools
          </Link>
        </div>

        {/* Author Bio */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg flex gap-4">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex-shrink-0"></div>
          <div>
            <h4 className="font-semibold mb-1">{post.author}</h4>
            <p className="text-gray-600 text-sm mb-2">
              Founder of MyRoofGenius with 15+ years in commercial roofing
              operations and technology implementation.
            </p>
            <Link
              href="/about"
              className="text-secondary-700 text-sm hover:underline"
            >
              More articles by {post.author}
            </Link>
          </div>
        </div>
      </article>
    </div>  );
}
