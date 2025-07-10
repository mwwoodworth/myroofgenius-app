'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Invalid credentials. Please try again.');
    else {
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  };

  const handleMagic = async () => {
    setError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError('Could not send magic link.');
    else setMagicSent(true);
    setLoading(false);
  };

  const handleProvider = async (provider: string) => {
    setError(null);
    try {
      await signIn(provider);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Authentication error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">Sign in</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <p className="text-red-600 text-sm" id="login-error">{error}</p>}
          {magicSent && (
            <p className="text-green-600 text-sm" role="status">
              Check your email for a login link.
            </p>
          )}
          <label htmlFor="login-email" className="sr-only">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            aria-describedby="login-error"
            className="w-full border p-2 rounded"
          />
          <label htmlFor="login-password" className="sr-only">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            aria-describedby="login-error"
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2 rounded"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={handleMagic}
            disabled={loading}
            className="w-full border border-gray-300 py-2 rounded text-gray-700 mt-2"
          >
            Send magic link
          </button>
          <button
            type="button"
            onClick={() => handleProvider('google')}
            className="w-full border border-gray-300 py-2 rounded text-gray-700 mt-2"
          >
            Sign in with Google
          </button>
          <button
            type="button"
            onClick={() => handleProvider('azure-ad')}
            className="w-full border border-gray-300 py-2 rounded text-gray-700 mt-2"
          >
            Sign in with Microsoft
          </button>
          <button
            type="button"
            onClick={() => handleProvider('linkedin')}
            className="w-full border border-gray-300 py-2 rounded text-gray-700 mt-2"
          >
            Sign in with LinkedIn
          </button>
          <button
            type="button"
            onClick={() => handleProvider('apple')}
            className="w-full border border-gray-300 py-2 rounded text-gray-700 mt-2"
          >
            Sign in with Apple
          </button>
        </form>
        <p className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-accent underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
