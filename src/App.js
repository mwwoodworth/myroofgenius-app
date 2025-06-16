import React, { useState } from 'react';

function App() {
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
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>MyRoofGenius</h1>
      <p>Welcome! This is a placeholder React application.</p>

      <h2>Subscribe to our newsletter</h2>
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
      </form>
      {status === 'loading' && <p>Submitting...</p>}
      {status === 'success' && <p>Thanks for subscribing!</p>}
      {status === 'error' && <p>Something went wrong. Please try again.</p>}
    </div>
  );
}

export default App;
