# MyRoofGenius Production Deployment Guide

## Overview
MyRoofGenius is a production-ready AI-native SaaS platform for roofing estimation and management, built with Next.js 14, TypeScript, and modern cloud services.

## Prerequisites

- Node.js 18+ and npm 8+
- Supabase account and project
- Anthropic API key for Claude AI
- Stripe account (for payments)
- Deployment platform account (Vercel recommended)

## Environment Configuration

### Required Environment Variables
Copy `.env.local.example` to `.env.local` and configure:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=MyRoofGenius
NEXT_PUBLIC_APP_DESCRIPTION=AI-Powered Roofing Estimation Platform

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Claude AI (required)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Stripe (required for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
```

## Database Setup

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/` folder
3. Enable Row Level Security (RLS) on all tables
4. Set up authentication providers as needed

## Deployment Steps

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel --prod
```

### Option 2: Docker

```bash
# Build the Docker image
docker build -t myroofgenius .

# Run with environment variables
docker run -p 3000:3000 --env-file .env.local myroofgenius
```

### Option 3: Traditional VPS

```bash
# Install dependencies
npm ci --production

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "myroofgenius" -- start
```

## Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test authentication flow (login/signup)
- [ ] Test Stripe payment integration
- [ ] Verify Claude AI responses are working
- [ ] Check PWA installation on mobile devices
- [ ] Test email notifications (if configured)
- [ ] Monitor application logs for errors
- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure backup strategy for database
- [ ] Set up SSL certificate (automatic on Vercel)
- [ ] Configure custom domain and DNS
- [ ] Test all API endpoints
- [ ] Verify SEO meta tags and sitemap

## Monitoring & Maintenance

### Health Check
Monitor the `/api/health` endpoint:
```bash
curl https://yourdomain.com/api/health
```

### Logs
- Vercel: Check Functions tab in dashboard
- Docker: `docker logs container_name`
- PM2: `pm2 logs myroofgenius`

### Database Backups
Configure automatic backups in Supabase dashboard

### Updates
```bash
# Update dependencies
npm update

# Rebuild and redeploy
npm run build
vercel --prod
```

## Security Considerations

1. **API Keys**: Never commit API keys to git
2. **CORS**: Configure allowed origins in `next.config.js`
3. **Rate Limiting**: Implement rate limiting on API routes
4. **Input Validation**: All user inputs are validated
5. **SQL Injection**: Using Supabase client prevents SQL injection
6. **XSS Protection**: React automatically escapes content

## Performance Optimization

- Images are optimized with Next.js Image component
- Static pages are pre-rendered at build time
- API routes use caching where appropriate
- PWA caches assets for offline access
- Lazy loading for heavy components

## Support

For issues or questions:
- Check logs for error messages
- Review environment variable configuration
- Ensure all services (Supabase, Stripe, etc.) are active
- Contact BrainOps support team

## Architecture

```
MyRoofGenius/
├── app/              # Next.js 14 App Router pages
├── components/       # React components
├── lib/             # Utility functions and configurations
├── public/          # Static assets
├── styles/          # Global styles
├── supabase/        # Database migrations and types
└── api/             # API route handlers
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase, Next.js API Routes
- **AI**: Claude AI via Anthropic SDK
- **Payments**: Stripe
- **PWA**: next-pwa
- **Analytics**: Optional (GA, Mixpanel)

---

Built with excellence by BrainOps - 2025