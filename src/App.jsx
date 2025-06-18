import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import Marketplace from './pages/Marketplace';
import Product from './pages/Product';
import Blog from './pages/Blog';
import Account from './pages/Account';
import Success from './pages/Success';
import Cancel from './pages/Cancel';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/account" element={<Account />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Routes>
      </Layout>
    </Router>
  );
}
