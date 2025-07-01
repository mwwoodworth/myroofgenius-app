'use client';
import { Contractor } from '../../types/marketplace';
import ContractorCard from './ContractorCard';

export default function ContractorGrid({ contractors }: { contractors: Contractor[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contractors.map((c) => (
        <ContractorCard key={c.id} contractor={c} />
      ))}
    </div>
  );
}
