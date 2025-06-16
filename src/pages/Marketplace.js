import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Marketplace = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (!error) setProducts(data || []);
    };
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Marketplace</h1>
      {products.length === 0 ? (
        <p>No products yet…</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          }}
        >
          {products.map((p) => (
            <div key={p.id} style={{ border: '1px solid #ddd', padding: '1rem' }}>
              <h3>{p.name}</h3>
              <p>${p.price}</p>
              <Link to={`/product/${p.id}`}>View</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
