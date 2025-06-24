import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import content from '../../data/account.json';

const Account = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, amount, status, created_at, products (name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
    };
    fetchOrders();
  }, [user]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'github' });
  };

  if (!user)
    return (
      <div style={{ padding: '2rem' }}>
        <h1>{content.title}</h1>
        <button onClick={handleLogin}>{content.signIn}</button>
      </div>
    );

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{content.ordersHeadline}</h1>
      {orders.length === 0 ? (
        <p>{content.noOrders}</p>
      ) : (
        <ul>
          {orders.map((o) => (
            <li key={o.id}>
              {o.products?.name || 'Product'} – ${o.amount} – {o.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Account;
