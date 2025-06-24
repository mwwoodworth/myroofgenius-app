import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import * as Sentry from '@sentry/react';

import Header from './components/Header';
import Footer from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Product = lazy(() => import('./pages/Product'));
const Blog = lazy(() => import('./pages/Blog'));
const Account = lazy(() => import('./pages/Account'));
const Success = lazy(() => import('./pages/Success'));
const Cancel = lazy(() => import('./pages/Cancel'));

// Initialize Sentry for error tracking
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
});

function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ padding: '0.5rem', marginRight: '0.5rem' }}
      />
      <button type="submit" style={{ padding: '0.5rem 1rem' }}>
        Subscribe
      </button>
      {status === 'loading' && <p>Submitting…</p>}
      {status === 'success' && <p>Thanks for subscribing!</p>}
      {status === 'error' && <p>Something went wrong.</p>}
    </form>
  );
}

export default function App() {
  useEffect(() => {
    const gaId = process.env.REACT_APP_GA_MEASUREMENT_ID;
    if (typeof window !== 'undefined' && gaId) {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', gaId);
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <Router>
      <Header />
      <nav style={{ padding: '1rem', background: '#f5f5f5' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>
          Home
        </Link>
        <Link to="/marketplace" style={{ marginRight: '1rem' }}>
          Marketplace
        </Link>
        <Link to="/blog" style={{ marginRight: '1rem' }}>
          Blog
        </Link>
        <Link to="/account">Account</Link>
      </nav>
      <Suspense fallback={<p>Loading…</p>}>
        <Routes>
          <Route path="/" element={<><Home /><SubscribeForm /></>} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/account" element={<Account />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Routes>
      </Suspense>
      <Footer />
    </Router>
  );
}

