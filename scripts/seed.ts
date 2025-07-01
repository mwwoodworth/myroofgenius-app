import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedDatabase() {
  console.log('🌱 Seeding database with initial data...');

  const products = [
    {
      name: 'Roofing Estimation Toolkit Pro',
      description: 'Complete Excel toolkit with templates for accurate roofing estimates.',
      price: 197.0,
      original_price: 297.0,
      category: 'estimation',
      features: 'Excel templates,Video tutorials,Lifetime updates,Email support',
      image_url: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800',
      is_active: true,
      is_featured: true
    },
    {
      name: 'Safety Compliance Bundle',
      description: 'OSHA-compliant safety checklists and training materials.',
      price: 147.0,
      category: 'safety',
      features: 'Safety checklists,Training guides,Compliance updates',
      image_url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800',
      is_active: true
    },
    {
      name: 'Contract Template Library',
      description: 'Professional roofing contract templates vetted by attorneys.',
      price: 97.0,
      category: 'templates',
      features: 'Contract templates,Legal clauses,State-specific versions',
      image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
      is_active: true
    },
    {
      name: 'Marketing Materials Pack',
      description: 'Ready-to-use marketing content for roofing businesses.',
      price: 127.0,
      category: 'marketing',
      features: 'Brochures,Social media posts,Email campaigns,Flyer templates',
      image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
      is_active: true
    },
    {
      name: 'Financial Management Toolkit',
      description: 'Spreadsheets and tools for managing roofing business finances.',
      price: 167.0,
      category: 'financial',
      features: 'P&L templates,Cash flow spreadsheets,Job costing sheets,Tax prep checklists',
      image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
      is_active: true
    }
  ];

  for (const product of products) {
    const { data: prod, error } = await supabase
      .from('products')
      .insert({
        ...product,
        price_id: `price_${Date.now()}_${Math.random().toString(36).slice(-8)}`
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting product:', error.message);
      continue;
    }
    console.log(`Inserted product: ${prod.name}`);

    await supabase.from('product_files').insert([
      {
        product_id: prod.id,
        file_name: `${prod.name.replace(/\s+/g, '_')}_Main.pdf`,
        file_url: `/protected/files/${prod.id}_main.pdf`,
        file_size: Math.floor(Math.random() * 5000000) + 500000,
        file_type: 'application/pdf'
      },
      {
        product_id: prod.id,
        file_name: `${prod.name.replace(/\s+/g, '_')}_Guide.pdf`,
        file_url: `/protected/files/${prod.id}_guide.pdf`,
        file_size: Math.floor(Math.random() * 2000000) + 200000,
        file_type: 'application/pdf'
      }
    ]);
  }

  const prompts = [
    {
      name: 'copilot_field',
      version: 1,
      content: `You are an AI assistant specialized in helping roofing field workers. Provide quick, on-site answers including measurements, material recommendations, safety tips, and weather considerations in a concise, practical manner.`,
      category: 'copilot',
      is_active: true
    },
    {
      name: 'copilot_pm',
      version: 1,
      content: `You are an AI assistant for roofing project managers. Provide detailed guidance on project scheduling, budget management, crew coordination, client communication, and reporting. Responses should be professional and thorough.`,
      category: 'copilot',
      is_active: true
    },
    {
      name: 'estimation_analyzer',
      version: 1,
      content: `Analyze the provided roof image and output a JSON with:
{
  "square_feet": <estimated area>,
  "pitch": "<roof pitch>",
  "material": "<roof material type>",
  "condition": "<overall condition>",
  "damage_areas": [...],
  "recommendations": [...],
  "remaining_life": <years>,
  "confidence_scores": { ... }
}
Include estimated repair and replacement costs in recommendations.`,
      category: 'analysis',
      is_active: true
    }
  ];
  for (const prompt of prompts) {
    await supabase.from('prompts').insert(prompt);
  }
  console.log('Inserted AI prompts.');

  const emailTemplates = [
    {
      name: 'welcome',
      subject: 'Welcome to MyRoofGenius!',
      html_content: `
        <h1>Welcome to MyRoofGenius, {{name}}!</h1>
        <p>Thank you for joining MyRoofGenius. We're excited to help you streamline your roofing business.</p>
        <p>Here are a few things you can do now:</p>
        <ul>
          <li>Browse our marketplace for professional tools and templates.</li>
          <li>Try our AI-powered roof estimator on the Dashboard.</li>
          <li>Use the AI Copilot for instant answers to roofing questions.</li>
        </ul>
        <p>If you have any questions, we're here to help!</p>
        <p>Best,<br>The MyRoofGenius Team</p>
      `,
      text_content: `Welcome to MyRoofGenius, {{name}}! Thank you for joining. You can now browse our marketplace, try the AI estimator, and use the AI Copilot. We're here to help if you have any questions. - The MyRoofGenius Team`,
      variables: ['name'],
      is_active: true
    },
    {
      name: 'order_confirmation',
      subject: 'Your MyRoofGenius Order {{order_number}}',
      html_content: `
        <h1>Thank you for your purchase!</h1>
        <p>Hello,</p>
        <p>Your order <strong>{{order_number}}</strong> has been confirmed. You can download your files using the links below:</p>
        {{download_links}}
        <p>Product: {{product_name}}<br/>
        Total Paid: {{amount}}</p>
        <p>We appreciate your business! If you have any issues, feel free to reply to this email.</p>
        <p>Best regards,<br>The MyRoofGenius Team</p>
      `,
      text_content: `Thank you for your purchase!\nYour order {{order_number}} is confirmed.\nDownload your files:\n{{download_links}}\nProduct: {{product_name}}\nTotal Paid: {{amount}}\nThank you for your business!`,
      variables: ['order_number', 'download_links', 'product_name', 'amount'],
      is_active: true
    }
  ];
  for (const template of emailTemplates) {
    await supabase.from('email_templates').insert(template);
  }
  console.log('Inserted email templates.');

  console.log('✅ Seeding complete.');
}

seedDatabase().catch(err => {
  console.error('Seed error:', err);
});
