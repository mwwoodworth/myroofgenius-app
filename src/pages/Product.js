import React from 'react';
import { useParams } from 'react-router-dom';

const Product = () => {
  const { id } = useParams();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Product {id}</h1>
      <p>Product details coming soon…</p>
    </div>
  );
};

export default Product;
