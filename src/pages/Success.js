import React from 'react';
import { Link } from 'react-router-dom';
import content from '../../data/success.json';

const Success = () => (
  <div style={{ padding: '2rem' }}>
    <h1>{content.title}</h1>
    <p>{content.text}</p>
    <Link to="/account">{content.linkText}</Link>
  </div>
);

export default Success;
