import partners from '../../../content/partners.json';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Params { params: { slug: string } }

export default function PartnerPage({ params: { slug } }: Params) {
  const partner = (partners as any[]).find(p => p.slug === slug);
  if (!partner) return <div className="p-4">Partner not found</div>;
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <Image src={partner.logo} alt={partner.name} width={120} height={120} />
      <h1 className="text-3xl font-bold">{partner.name}</h1>
      <p>{partner.description}</p>
      <div className="p-4 bg-blue-100 rounded">{partner.offer}</div>
      <Link href="/" className="text-blue-600 underline">Back to Home</Link>
    </div>
  );
}
