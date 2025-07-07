'use client';
import { Contractor } from '../../types/marketplace';
import ContractorCard from './ContractorCard';
import { motion } from 'framer-motion';

export default function ContractorGrid({ contractors }: { contractors: Contractor[] }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
      }}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {contractors.map((c) => (
        <motion.div key={c.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
          <ContractorCard contractor={c} />
        </motion.div>
      ))}
    </motion.div>
  );
}
