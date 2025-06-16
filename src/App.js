impor, useEffectt React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
// Lazy‑load other pages (placeholders for now)
const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const Product = React.lazy(() => import('./pages/Product'));
import Header from './components/Header';
import * as Sentry from '@sentry/react';
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

const Blog = React.lazy(() => import('./pages/Blog'));
const Account = React.lazy(() => import('./pages/Account'));
const Success = React.lazy(() => import('./pages/Success'));
const Cancel = React.lazy(() => import('./pages/Cancel'));


const SubscribeForm = () => {
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

  ret
      <Header />
urn (
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
};

function 
  A
    useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
    }
  }, []);
pp() {
  return (
    <Router>
      <nav style={{ padding: '1rem', background: '#f5f5f5' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/marketplace" style={{ marginRight: '1rem' }}>Marketplace</Link>
        <Link to="/blog" style={{ marginRight: '1rem' }}>Blog</Link>
        <Link to="/account">Account</Link>
      </nav>

      <React.Suspense fallback={<p>Loading…</p>}>
        <Routes>
          <Route path="/" element={<><Home /><SubscribeForm /></>} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/account" element={<Account />} />
                  <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;
