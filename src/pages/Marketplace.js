import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import   { supabase } from '../supabaseClient';

const Marketplace = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      setProducts(data || []);
    };
    fetchProducts();
  }, []);

  return (
    <motion.div
      className="max-w-6xl mx-auto px-6 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8 text-[#202940]">Marketplace</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <img src={p.image_url} alt={p.name} className="h-48 w-full object-cover rounded-t-lg" />
            <div className="p-4">
              <h3 className="font-semibold text-lg text-[#202940]">{p.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{p.description}</p>
              <p className="font-bold text-[#2366d1] mb-4">${p.price}</p>
              <a href={`/product/${p.id}`} className="bg-[#2366d1] hover:bg-[#1e59b8] text-white py-2 px-4 rounded w-full inline-block text-center">
                View
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Marketplace;
