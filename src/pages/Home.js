import React from 'react';
import content from '../../data/home.json';

const Home = () => (
  <div style={{ padding: '2rem' }}>
    <h1>{content.headline}</h1>
    <p>{content.subline}</p>
  </div>
);

export default Home;
