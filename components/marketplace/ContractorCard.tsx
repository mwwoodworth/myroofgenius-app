'use client'
import { Contractor } from '../../types/marketplace'
import Card from '../ui/Card'

export default function ContractorCard({ contractor }: { contractor: Contractor }) {
  return (
    <Card className="flex flex-col gap-2">
      <h3 className="font-semibold">{contractor.businessName}</h3>
      <p className="text-sm text-text-secondary">Rating: {contractor.rating}/5</p>
    </Card>
  )
}
