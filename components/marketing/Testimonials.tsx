'use client';
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "John R.",
    title: "Owner, Eagle Roofing",
    quote: "MyRoofGenius helped us win more bids and simplify estimating. Highly recommend.",
  },
  {
    name: "Alicia T.",
    title: "Project Manager, Peak Commercial",
    quote: "The user-friendly tools save hours every week and keep our margins healthy.",
  },
  {
    name: "Miguel F.",
    title: "Estimator, Skyline Roofers",
    quote: "We landed three new contracts in our first month using MyRoofGenius. Game changer!",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gradient-to-b from-transparent to-[#011225]">
      <h2 className="text-3xl font-bold text-center mb-12">What Contractors Say</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="bg-white/10 p-8 rounded-xl shadow-lg border border-white/10"
          >
            <p className="text-lg mb-6 font-medium">&ldquo;{t.quote}&rdquo;</p>
            <div className="font-bold">{t.name}</div>
            <div className="text-accent-emerald text-xs">{t.title}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
