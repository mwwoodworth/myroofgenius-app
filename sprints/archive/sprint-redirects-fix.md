# Sprint 4: Remove Legacy Redirects in next.config.js

## Why This Matters

Legacy redirects are like detour signs left up after road construction ends. They confuse users, hurt SEO, and create maintenance debt. Your `/tools` and `/marketplace` redirects might be blocking pages you actually want to build or sending users to outdated destinations. Clean redirects protect your site architecture and user experience.

Every redirect is a decision about your site's structure. Make it intentional.

## What This Protects

- **Prevents user confusion** from outdated navigation paths
- **Protects SEO value** by avoiding redirect chains
- **Enables future development** of tools and marketplace pages
- **Simplifies site architecture** for cleaner maintenance

## Implementation Steps

### Step 1: Audit Current Redirects

First, check what redirects currently exist:

```bash
# Open your next.config.js and look for redirects
grep -n "redirects\|tools\|marketplace" next.config.js
```

### Step 2: Update next.config.js - Remove Legacy Redirects

Replace the redirects section in your `next.config.js`:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization settings
  images: {
    domains: [
      'images.unsplash.com',
      'cdn.myroofgenius.com', // Add your CDN if used
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Removed legacy redirects - keeping only essential ones
  async redirects() {
    return [
      // Only keep business-critical redirects here
      // Example: Old blog URLs to new structure
      // {
      //   source: '/blog/:slug',
      //   destination: '/resources/:slug',
      //   permanent: true,
      // },
      
      // Remove these problematic redirects:
      // ❌ /tools redirect
      // ❌ /marketplace redirect
      // ❌ Any other legacy paths
      
      // Keep any critical business redirects, like:
      // Domain migrations, rebrand URLs, or legal requirements
    ];
  },
  
  // If you need custom headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Webpack customization if needed
  webpack: (config, { isServer }) => {
    // Handle any custom webpack configs here
    return config;
  },
  
  // Environment variables to expose to the browser
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://myroofgenius.com',
  },
  
  // TypeScript and ESLint settings
  typescript: {
    // Set to true only in production to allow builds with TS errors during development
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
```

### Step 3: Create Placeholder Pages (If Needed)

If removing redirects will create 404s, create minimal placeholder pages:

```typescript
// app/tools/page.tsx (or pages/tools.tsx for Pages Router)
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tools | MyRoofGenius',
  description: 'Professional roofing tools and calculators coming soon.',
};

export default function ToolsPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          Tools & Calculators
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Our professional roofing tools are being refined to give you 
          the most accurate calculations and estimates.
        </p>
        <div className="space-y-4">
          <p className="text-gray-500">
            Coming soon:
          </p>
          <ul className="text-left inline-block space-y-2">
            <li>• Roof Area Calculator</li>
            <li>• Material Estimator</li>
            <li>• Cost Analysis Tools</li>
            <li>• Project Timeline Builder</li>
          </ul>
        </div>
        <a 
          href="/"
          className="inline-block mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return Home
        </a>
      </div>
    </main>
  );
}
```

```typescript
// app/marketplace/page.tsx (or pages/marketplace.tsx for Pages Router)
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace | MyRoofGenius',
  description: 'Find verified roofing contractors and suppliers.',
};

export default function MarketplacePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          Contractor Marketplace
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Connect with verified roofing professionals in your area.
        </p>
        <p className="text-gray-500 mb-8">
          We're building a trusted network of contractors who meet 
          our quality standards. Check back soon.
        </p>
        <a 
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return Home
        </a>
      </div>
    </main>
  );
}
```

### Step 4: Update Internal Links

Search and update any internal links pointing to redirected paths:

```bash
# Find all references to /tools or /marketplace in your codebase
grep -r "href=['\"]*/tools\|href=['\"]*/marketplace" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" .

# Common places to check:
# - Navigation components
# - Footer links
# - Sitemap
# - Marketing pages
```

### Step 5: Set Up Proper 404 Handling

Create or update your 404 page:

```typescript
// app/not-found.tsx (App Router) or pages/404.tsx (Pages Router)
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | MyRoofGenius',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for has moved or doesn't exist.
        </p>
        <div className="space-x-4">
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
          <a 
            href="/contact"
            className="inline-block px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}
```

## Test & Validation Steps

1. **Test redirect removal locally:**
   ```bash
   # Start dev server
   npm run dev
   
   # Test old redirect paths
   curl -I http://localhost:3000/tools
   curl -I http://localhost:3000/marketplace
   
   # Should return 200 (if pages created) or 404 (if not)
   # Should NOT return 301/302 redirects
   ```

2. **Build and test production behavior:**
   ```bash
   npm run build
   npm run start
   
   # Test again in production mode
   curl -I http://localhost:3000/tools
   ```

3. **Check for broken internal links:**
   ```bash
   # Use a link checker tool
   npx linkinator http://localhost:3000 --recurse
   ```

4. **Verify SEO impact:**
   - Check Google Search Console for crawl errors after deployment
   - Monitor 404 errors in your analytics
   - Set up proper redirects only if you see significant traffic to old URLs

## What to Watch For

- **High-traffic redirects:** Check analytics before removing - you may need to keep some
- **External links:** Other sites may link to your old URLs
- **Search engine index:** Google may have indexed the redirect URLs
- **User bookmarks:** Regular users may have bookmarked redirect URLs

If you discover significant traffic after removal, implement proper redirects:

```javascript
// Only add back if analytics show significant traffic
{
  source: '/tools',
  destination: '/resources/tools', // or wherever it should go
  permanent: true, // 301 redirect for SEO
}
```

## Success Criteria Checklist

- [ ] Legacy redirects removed from next.config.js
- [ ] No redirect loops or chains remain
- [ ] Placeholder pages created (if needed)
- [ ] Internal links updated to point to correct paths
- [ ] 404 page properly styled and helpful
- [ ] Build completes without errors
- [ ] No broken links in navigation or footer
- [ ] curl tests show correct status codes

## Commit Message

```
fix: remove legacy redirects and clean up routing

- Remove /tools and /marketplace redirects from next.config.js
- Add placeholder pages for tools and marketplace
- Update 404 page with helpful navigation
- Clean up next.config.js structure
- Add security headers for production

This simplifies routing and enables future development
of tools and marketplace features without conflicts.
```