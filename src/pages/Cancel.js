import React from 'react';
import { Link } from 'react-router-dom';
import content from '../../data/cancel.json';

const Cancel = () => (
  <div style={{ padding: '2rem' }}>
    <h1>{content.title}</h1>
    <p>{content.text}</p>
    <Link to="/marketplace">{content.linkText}</Link>
  </div>
);

export default Cancel;
