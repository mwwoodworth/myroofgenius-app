import { constructMetadata } from '../lib/metadata';

export const metadata = constructMetadata({
  title: 'Marketplace | MyRoofGenius - AI-Generated Roofing Templates & Tools',
  description: 'Browse our marketplace of AI-generated roofing templates, calculators, contracts, and inspection checklists. Professional tools created by AI for contractors.',
  keywords: ['roofing marketplace', 'contractor templates', 'roofing calculators', 'inspection checklists', 'AI-generated tools'],
});

export default async function MarketplacePageWrapper() {
  const { default: MarketplaceClient } = await import('./MarketplaceClient');
  return <MarketplaceClient />;
}