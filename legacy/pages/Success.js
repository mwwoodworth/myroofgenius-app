import React from 'react';
import { Link } from 'react-router-dom';

const Success = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Thank you for your purchase!</h1>
    <p>Your order was successful. A confirmation email is on its way.</p>
    <Link to="/account">Go to your account</Link>
  </div>
);

export default Success;
