import React from 'react';
import { Link } from 'react-router-dom';

const Cancel = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Payment canceled</h1>
    <p>Your payment was canceled or failed. You can try again anytime.</p>
    <Link to="/marketplace">Back to Marketplace</Link>
  </div>
);

export default Cancel;
