# Sprint 8: DNS and CNAME Configuration

## Why This Matters

A misconfigured DNS setup breaks everything. Visitors hit dead ends. SEO value evaporates. Your carefully built application becomes invisible. This sprint ensures www.myroofgenius.com reliably reaches your application, protecting your brand's accessibility and search rankings.

DNS is your digital foundation. When it fails, nothing else matters.

## What This Protects

- **Prevents site downtime** from DNS misconfigurations
- **Protects SEO value** by maintaining consistent URLs
- **Ensures email deliverability** with proper domain verification
- **Safeguards user trust** with reliable site access

## Implementation Steps

### Step 1: Verify Current DNS Configuration

First, check your current DNS setup:

```bash
# Check current DNS records
nslookup myroofgenius.com
nslookup www.myroofgenius.com

# Check CNAME configuration
dig www.myroofgenius.com CNAME

# Trace DNS resolution path
dig +trace www.myroofgenius.com
```

### Step 2: Access Your DNS Provider

Common DNS providers and where to find DNS settings:

- **Cloudflare**: Dashboard → Select Domain → DNS
- **GoDaddy**: My Products → DNS → Manage DNS
- **Namecheap**: Domain List → Manage → Advanced DNS
- **Route 53**: Hosted Zones → Select Domain → Create Record
- **Google Domains**: My Domains → DNS

### Step 3: Configure the CNAME Record

Add this CNAME record for www subdomain:

```
Type:     CNAME
Name:     www
Value:    cname.vercel-dns.com
TTL:      300 (5 minutes during setup, then 3600)
Proxy:    Disabled (if using Cloudflare)
```

**For Vercel deployment**, your records should look like:

```
# A Records for root domain (myroofgenius.com)
Type: A
Name: @ (or blank)
Value: 76.76.21.21
TTL: 300

# CNAME for www subdomain
Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 300
```

### Step 4: Configure Vercel Domain Settings

In your Vercel dashboard:

1. Navigate to your project
2. Go to Settings → Domains
3. Add both domains:
   - `myroofgenius.com` (root)
   - `www.myroofgenius.com` (www)
4. Set redirect preference (typically www → root)

### Step 5: Create DNS Verification File

Create a DNS configuration reference:

```markdown
# DNS Configuration - MyRoofGenius.com

## Current Configuration (Updated: [DATE])

### Root Domain (myroofgenius.com)
- **Type**: A
- **Name**: @ (or leave blank)
- **Value**: 76.76.21.21
- **TTL**: 3600
- **Purpose**: Points root domain to Vercel

### WWW Subdomain (www.myroofgenius.com)
- **Type**: CNAME
- **Name**: www
- **Value**: cname.vercel-dns.com
- **TTL**: 3600
- **Purpose**: Points www to Vercel deployment

### Email Configuration (if applicable)
- **MX Records**: [Your email provider's MX records]
- **SPF**: v=spf1 include:[provider] ~all
- **DKIM**: [Provider-specific DKIM record]

## Verification Steps

1. DNS Propagation Check:
   ```bash
   dig myroofgenius.com
   dig www.myroofgenius.com
   ```

2. SSL Certificate Verification:
   ```bash
   curl -I https://myroofgenius.com
   curl -I https://www.myroofgenius.com
   ```

3. Redirect Testing:
   - Visit http://myroofgenius.com → Should redirect to HTTPS
   - Visit http://www.myroofgenius.com → Should redirect to HTTPS root

## Troubleshooting

- **SSL Certificate Issues**: Vercel auto-provisions certificates after DNS propagation
- **Propagation Delays**: Can take up to 48 hours globally
- **Cloudflare Proxy**: Disable orange cloud for CNAME records initially
```

Save this as `docs/dns-configuration.md` in your repository.

### Step 6: Implement DNS Health Check

Create a monitoring script:

```javascript
// scripts/check-dns.js
const dns = require('dns').promises;
const https = require('https');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

async function checkDNS() {
  console.log('🌐 DNS Configuration Check\n');
  
  const domains = [
    'myroofgenius.com',
    'www.myroofgenius.com'
  ];
  
  for (const domain of domains) {
    console.log(`Checking ${domain}:`);
    
    try {
      // DNS Resolution
      const addresses = await dns.resolve4(domain);
      console.log(`${colors.green}✅ DNS resolves to: ${addresses.join(', ')}${colors.reset}`);
      
      // HTTPS Check
      const httpsCheck = await checkHTTPS(domain);
      if (httpsCheck.success) {
        console.log(`${colors.green}✅ HTTPS working (Status: ${httpsCheck.status})${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ HTTPS issue: ${httpsCheck.error}${colors.reset}`);
      }
      
      // CNAME Check for www
      if (domain.startsWith('www.')) {
        try {
          const cname = await dns.resolveCname(domain);
          console.log(`${colors.green}✅ CNAME points to: ${cname[0]}${colors.reset}`);
        } catch (e) {
          console.log(`${colors.yellow}⚠️  No CNAME record (using A record instead)${colors.reset}`);
        }
      }
      
    } catch (error) {
      console.log(`${colors.red}❌ DNS Error: ${error.message}${colors.reset}`);
    }
    
    console.log('');
  }
  
  // Check propagation
  console.log('Global DNS Propagation:');
  console.log('Check propagation status at: https://www.whatsmydns.net');
  console.log(`- Search for: myroofgenius.com`);
  console.log(`- Search for: www.myroofgenius.com`);
}

function checkHTTPS(domain) {
  return new Promise((resolve) => {
    https.get(`https://${domain}`, (res) => {
      resolve({
        success: true,
        status: res.statusCode,
        headers: res.headers
      });
    }).on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });
  });
}

// Run the check
checkDNS().catch(console.error);
```

Add to package.json:
```json
{
  "scripts": {
    "check:dns": "node scripts/check-dns.js"
  }
}
```

### Step 7: Set Up Redirect Rules

Ensure proper redirects in your application:

```javascript
// middleware.ts (Next.js 13+)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && protocol !== 'https') {
    return NextResponse.redirect(
      `https://${hostname}${request.nextUrl.pathname}${request.nextUrl.search}`,
      301
    );
  }
  
  // Redirect www to non-www (or vice versa based on preference)
  if (hostname.startsWith('www.')) {
    const newHost = hostname.slice(4); // Remove 'www.'
    return NextResponse.redirect(
      `${protocol}://${newHost}${request.nextUrl.pathname}${request.nextUrl.search}`,
      301
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Test & Validation Steps

1. **Wait for DNS propagation (5-30 minutes typically):**
   ```bash
   # Check DNS propagation
   npm run check:dns
   ```

2. **Test all URL variations:**
   ```bash
   # Test each variant
   curl -I http://myroofgenius.com
   curl -I https://myroofgenius.com
   curl -I http://www.myroofgenius.com
   curl -I https://www.myroofgenius.com
   
   # All should return 200 or 301 redirects to your canonical URL
   ```

3. **Verify SSL certificates:**
   ```bash
   # Check SSL certificate
   openssl s_client -connect myroofgenius.com:443 -servername myroofgenius.com < /dev/null
   ```

4. **Test from multiple locations:**
   - Use https://www.whatsmydns.net to check global propagation
   - Test from mobile network (different DNS)
   - Use VPN to test from different geographic locations

## What to Watch For

- **Propagation delays**: DNS changes can take 24-48 hours globally
- **SSL provisioning**: Vercel needs valid DNS to provision SSL certificates
- **Email disruption**: Changing DNS can affect email if MX records aren't preserved
- **Analytics tracking**: Update Google Analytics and Search Console after DNS changes

## Success Criteria Checklist

- [ ] DNS records added correctly at provider
- [ ] www.myroofgenius.com resolves correctly
- [ ] SSL certificates active for both root and www
- [ ] Proper redirects working (www → root or vice versa)
- [ ] HTTP → HTTPS redirect functioning
- [ ] DNS propagation complete globally
- [ ] Vercel domains verified in dashboard
- [ ] No email delivery disruption
- [ ] DNS health check script passing

## Commit Message

```
fix: add DNS configuration and monitoring

- Document DNS CNAME configuration for www subdomain
- Create DNS health check script
- Add middleware for proper HTTPS/www redirects
- Document DNS setup for team reference
- Add troubleshooting guide for common issues

This ensures reliable domain resolution and protects
site accessibility across all URL variations.
```