import { constructMetadata } from '../lib/metadata';

export const metadata = constructMetadata({
  title: 'Get Started | MyRoofGenius - Begin Your Roofing Software Journey',
  description: 'Start using MyRoofGenius AI-powered roofing software today. Quick onboarding, personalized setup, and instant access to contractor tools that transform your business.',
  keywords: ['get started myroofgenius', 'roofing software onboarding', 'contractor tools setup', 'AI roofing quick start', 'begin roofing software'],
});

export default async function GetStartedPageWrapper() {
  const { default: GetStartedClient } = await import('./GetStartedClient');
  return <GetStartedClient />;
}