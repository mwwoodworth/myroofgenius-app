#!/usr/bin/env tsx
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  example?: string;
}

const envVars: EnvVar[] = [
  // Critical
  { name: 'ANTHROPIC_API_KEY', required: true, description: 'Claude AI API key' },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, description: 'Supabase anonymous key' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Supabase service role key' },
  { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', required: true, description: 'Stripe publishable key' },
  { name: 'STRIPE_SECRET_KEY', required: true, description: 'Stripe secret key' },
  { name: 'STRIPE_WEBHOOK_SECRET', required: true, description: 'Stripe webhook secret' },
  { name: 'NEXTAUTH_SECRET', required: true, description: 'NextAuth secret for session encryption' },
  
  // Optional but recommended
  { name: 'NEXT_PUBLIC_SENTRY_DSN', required: false, description: 'Sentry error tracking' },
  { name: 'MAPBOX_TOKEN', required: false, description: 'Mapbox for roof visualization' },
  { name: 'REDIS_URL', required: false, description: 'Redis for caching' },
];

function checkEnv() {
  console.log('🔍 Checking environment configuration...\n');
  
  const envPath = join(process.cwd(), '.env.local');
  const envExists = existsSync(envPath);
  
  if (!envExists) {
    console.error('❌ .env.local file not found!');
    console.log('📝 Create one by copying .env.example:');
    console.log('   cp .env.example .env.local\n');
    process.exit(1);
  }
  
  const envContent = readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  const envMap = new Map<string, string>();
  
  // Parse env file
  envLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        envMap.set(key.trim(), valueParts.join('=').trim());
      }
    }
  });
  
  let hasErrors = false;
  let hasWarnings = false;
  
  console.log('Required Environment Variables:');
  console.log('==============================\n');
  
  envVars.forEach(({ name, required, description }) => {
    const value = envMap.get(name) || process.env[name];
    const isSet = value && value !== '' && !value.includes('[') && !value.includes('...');
    
    if (required && !isSet) {
      console.error(`❌ ${name} - ${description}`);
      console.error(`   Not set or contains placeholder value\n`);
      hasErrors = true;
    } else if (required) {
      console.log(`✅ ${name} - ${description}`);
      console.log(`   Value: ${value?.substring(0, 20)}...`);
      console.log('');
    }
  });
  
  console.log('\nOptional Environment Variables:');
  console.log('==============================\n');
  
  envVars.filter(v => !v.required).forEach(({ name, description }) => {
    const value = envMap.get(name) || process.env[name];
    const isSet = value && value !== '' && !value.includes('[') && !value.includes('...');
    
    if (!isSet) {
      console.warn(`⚠️  ${name} - ${description}`);
      console.warn(`   Not configured (optional)\n`);
      hasWarnings = true;
    } else {
      console.log(`✅ ${name} - ${description}`);
      console.log(`   Value: ${value?.substring(0, 20)}...`);
      console.log('');
    }
  });
  
  console.log('\nSummary:');
  console.log('========\n');
  
  if (hasErrors) {
    console.error('❌ Missing required environment variables!');
    console.error('   Please configure all required variables before deployment.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.warn('⚠️  Some optional features may not work without additional configuration.');
    console.log('✅ All required environment variables are configured!\n');
  } else {
    console.log('✅ All environment variables are properly configured!\n');
  }
  
  // Check feature flags
  console.log('Feature Flags:');
  console.log('=============\n');
  
  const featureFlags = [
    'NEXT_PUBLIC_AI_COPILOT_ENABLED',
    'NEXT_PUBLIC_DYNAMIC_ONBOARDING',
    'NEXT_PUBLIC_RAG_ENABLED',
    'NEXT_PUBLIC_MODULAR_DASHBOARD',
  ];
  
  featureFlags.forEach(flag => {
    const value = envMap.get(flag) || process.env[flag];
    console.log(`${flag}: ${value === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
  });
  
  console.log('\n✨ Environment check complete!');
}

// Run the check
checkEnv();