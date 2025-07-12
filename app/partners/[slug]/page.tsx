import partners from "../../../content/partners.json";
import Image from "next/image";
import Link from "next/link";
import { buildMeta } from "../../../lib/metadata";

export const dynamic = "force-dynamic";

interface Params {
  params: { slug: string };
}

interface Partner {
  slug: string;
  name: string;
  description: string;
  logo: string;
  offer: string;
}

export async function generateMetadata({ params }: Params) {
  const partner = (partners as Partner[]).find((p) => p.slug === params.slug);
  if (!partner) return {};
  return buildMeta({
    title: `${partner.name} Partner | MyRoofGenius`,
    description: partner.description,
    image: partner.logo,
  });
}

export default function PartnerPage({ params: { slug } }: Params) {
  const partner = (partners as Partner[]).find((p) => p.slug === slug);
  if (!partner) return <div className="p-4">Partner not found</div>;
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <Image src={partner.logo} alt={partner.name} width={120} height={120} />
      <h1 className="text-3xl font-bold">{partner.name}</h1>
      <p>{partner.description}</p>
      <div className="p-4 bg-secondary-700/10 rounded">{partner.offer}</div>
      <Link href="/" className="text-secondary-700 underline">
        Back to Home
      </Link>
    </div>
  );
}
