# MyRoofGenius Setup Guide

Complete setup instructions for the MyRoofGenius AI-powered roofing software platform.

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **Vercel CLI** (optional, for deployment)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/myroofgenius-app.git
   cd myroofgenius-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure environment variables** (see sections below)

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser** to `http://localhost:3000`

## Environment Configuration

### Required Environment Variables

Copy `.env.local.example` to `.env.local` and configure the following:

#### 🔐 **Database & Authentication**
```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

#### 🤖 **AI Services**
```env
# Anthropic Claude (Required for AI features)
ANTHROPIC_API_KEY=your_anthropic_api_key

# OpenAI (Optional, for additional AI features)
OPENAI_API_KEY=your_openai_api_key
```

#### 💳 **Payment Processing**
```env
# Stripe (Required for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

#### 📊 **Analytics & Monitoring**
```env
# Google Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry (Optional, for error tracking)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Vercel Analytics (Optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_vercel_analytics_id
```

### Optional Environment Variables

#### 📧 **Email Services**
```env
# Resend (for transactional emails)
RESEND_API_KEY=your_resend_api_key

# ConvertKit (for marketing emails)
CONVERTKIT_API_KEY=your_convertkit_api_key
```

#### 🔔 **Push Notifications**
```env
# Web Push VAPID keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

#### 🗺️ **Maps & Weather**
```env
# Mapbox (for location services)
MAPBOX_TOKEN=your_mapbox_token

# OpenWeatherMap (for weather data)
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
```

## Service Setup Instructions

### 1. Supabase Setup

1. **Create a new project** at [supabase.com](https://supabase.com)
2. **Get your keys** from Settings > API
3. **Set up authentication providers** (optional):
   - Go to Authentication > Providers
   - Enable Google, GitHub, or other providers
4. **Create database tables** (run the SQL migrations in `/database/migrations/`)

### 2. Stripe Setup

1. **Create a Stripe account** at [stripe.com](https://stripe.com)
2. **Get your API keys** from Dashboard > Developers > API keys
3. **Set up webhooks**:
   - Go to Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `checkout.session.completed`, etc.
4. **Configure products** in the Stripe Dashboard

### 3. Anthropic Claude Setup

1. **Get API access** at [console.anthropic.com](https://console.anthropic.com)
2. **Create an API key** in the dashboard
3. **Set usage limits** (recommended for production)

### 4. Analytics Setup

#### Google Analytics
1. **Create a GA4 property** at [analytics.google.com](https://analytics.google.com)
2. **Get your Measurement ID** from Admin > Data Streams
3. **Set up enhanced ecommerce** (optional)

#### Sentry
1. **Create a project** at [sentry.io](https://sentry.io)
2. **Get your DSN** from Settings > Projects > [Your Project] > Client Keys
3. **Set up error boundaries** (already configured)

### 5. Email Setup

#### Resend
1. **Create an account** at [resend.com](https://resend.com)
2. **Get your API key** from the dashboard
3. **Verify your domain** for production

#### ConvertKit
1. **Create an account** at [convertkit.com](https://convertkit.com)
2. **Get your API key** from Account > Settings > Advanced
3. **Set up email sequences** and forms

### 6. Push Notifications

#### Web Push (VAPID)
1. **Generate VAPID keys**:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. **Add keys to environment variables**

#### OneSignal (Optional)
1. **Create an app** at [onesignal.com](https://onesignal.com)
2. **Get your App ID and API key**
3. **Configure web push settings**

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check

# Generate build analysis
npm run analyze
```

## Database Setup

### Supabase Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (id)
);

-- Create estimates table
CREATE TABLE estimates (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  address TEXT,
  roof_type TEXT,
  dimensions JSONB,
  materials JSONB,
  cost_breakdown JSONB,
  total_cost DECIMAL(10,2),
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (id)
);

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (id)
);

-- RLS Policies
CREATE POLICY "Users can view own profiles" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profiles" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own estimates" ON estimates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create estimates" ON estimates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estimates" ON estimates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
```

## Deployment

### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set environment variables** in Vercel dashboard

### Environment Variables for Production

Update these values for production:

```env
# Production URLs
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com

# Production API keys (not test keys)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key

# Production Supabase (if different)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
```

### Custom Domain Setup

1. **Add domain** in Vercel dashboard
2. **Update DNS records** as instructed
3. **Update environment variables** with new domain

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Payment Testing

Use Stripe test cards:
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Insufficient funds**: `4000000000009995`

## Security Considerations

### API Keys
- Never commit API keys to version control
- Use different keys for development and production
- Rotate keys regularly
- Monitor API usage

### Authentication
- Enable 2FA for all service accounts
- Use strong passwords
- Implement rate limiting
- Monitor authentication logs

### Data Protection
- Enable RLS on all Supabase tables
- Validate all user inputs
- Use HTTPS in production
- Implement proper error handling

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run analyze

# Check for unused dependencies
npm install -g depcheck
depcheck
```

### Image Optimization
- Use Next.js Image component
- Optimize images before uploading
- Use WebP format when possible
- Implement lazy loading

### Caching
- Configure CDN caching
- Use service workers for offline support
- Implement Redis for server-side caching

## Monitoring & Maintenance

### Error Tracking
- Monitor Sentry for errors
- Set up alerts for critical errors
- Review error logs regularly

### Performance Monitoring
- Use Vercel Analytics
- Monitor Core Web Vitals
- Set up performance budgets

### Backup Strategy
- Regular database backups
- Export important data
- Test backup restoration

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install
```

#### Database Connection Issues
- Check Supabase service status
- Verify connection strings
- Review RLS policies

#### API Errors
- Check API key validity
- Verify environment variables
- Review rate limits

#### Deployment Issues
- Check build logs
- Verify environment variables
- Review domain configuration

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue in the GitHub repository
- **Support**: Contact support@myroofgenius.com
- **Community**: Join our Discord server

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

For detailed contribution guidelines, see CONTRIBUTING.md.