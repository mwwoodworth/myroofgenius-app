#!/usr/bin/env node
import { existsSync, readFileSync } from 'fs';

interface EnvRequirement {
  key: string;
  validator: (value: string) => boolean;
  errorMessage: string;
  critical: boolean;
}

const requirements: EnvRequirement[] = [
  // Supabase - Critical for auth and data
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    validator: (v) => v.startsWith('https://') && v.includes('.supabase.co'),
    errorMessage: 'Must be a valid Supabase project URL',
    critical: true
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    validator: (v) => v.length > 20,
    errorMessage: 'Must be a valid Supabase anon key',
    critical: true
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    validator: (v) => v.length > 20,
    errorMessage: 'Must be a valid service role key (server-side only)',
    critical: true
  },
  // Stripe - Critical for payments
  {
    key: 'STRIPE_SECRET_KEY',
    validator: (v) => v.startsWith('sk_'),
    errorMessage: 'Must start with sk_',
    critical: true
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    validator: (v) => v.startsWith('whsec_'),
    errorMessage: 'Must start with whsec_',
    critical: true
  }
];

console.log('🛡️  Environment Protection Check\n');

let hasErrors = false;
const results = requirements.map(req => {
  const value = process.env[req.key];
  const isValid = value ? req.validator(value) : false;
  
  if (!isValid && req.critical) {
    hasErrors = true;
  }
  
  return { ...req, value: value ? '[SET]' : '[MISSING]', isValid };
});

// Group by status
const critical = results.filter(r => r.critical && !r.isValid);
const warnings = results.filter(r => !r.critical && !r.isValid);
const valid = results.filter(r => r.isValid);

if (critical.length > 0) {
  console.log('❌ CRITICAL ISSUES (Build will fail):');
  critical.forEach(r => {
    console.log(`   ${r.key}: ${r.value} - ${r.errorMessage}`);
  });
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS (Features may be limited):');
  warnings.forEach(r => {
    console.log(`   ${r.key}: ${r.value} - ${r.errorMessage}`);
  });
  console.log('');
}

console.log(`✅ Valid: ${valid.length} variables configured correctly\n`);

if (hasErrors) {
  console.log('🔧 TO FIX:');
  console.log('1. Copy .env.example to .env.local');
  console.log('2. Fill in the missing values from your Supabase/Stripe dashboards');
  console.log('3. Run this check again: npm run validate:env\n');
  process.exit(1);
} else {
  console.log('🎯 Environment ready for deployment!\n');
}
