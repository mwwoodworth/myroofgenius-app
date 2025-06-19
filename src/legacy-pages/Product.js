import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleBuy = async () => {
    if (!product) return;
    const user = (await supabase.auth.getUser()).data?.user;

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_id: product.price_id,
        product_id: product.id,
        user_id: user?.id || null,
      }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading…</p>;
  if (!product) return <p style={{ padding: '2rem' }}>Product not found.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>
      <button onClick={handleBuy}>Buy Now</button>
    </div>
  );
};

export default Product;
