"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { signIn } from "next-auth/react";
import Button from "../../components/Button";
import Form from "../../components/Form";
import { buildMeta } from "../../lib/metadata";

export const generateMetadata = () =>
  buildMeta({
    title: "Login | MyRoofGenius",
    description: "Access your MyRoofGenius account and tools.",
  });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError("Invalid credentials. Please try again.");
    else {
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  const handleMagic = async () => {
    setError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("Could not send magic link.");
    else setMagicSent(true);
    setLoading(false);
  };

  const handleProvider = async (provider: string) => {
    setError(null);
    try {
      await signIn(provider);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Authentication error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">Sign in</h1>
        <Form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <p className="text-red-600 text-sm" id="login-error">
              {error}
            </p>
          )}
          {magicSent && (
            <p className="text-green-600 text-sm" role="status">
              Check your email for a login link.
            </p>
          )}
          <Form.Input
            label="Email"
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={error || undefined}
          />
          <Form.Input
            label="Password"
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={error || undefined}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <Button
            type="button"
            onClick={handleMagic}
            disabled={loading}
            variant="secondary"
            className="w-full mt-2"
          >
            Send magic link
          </Button>
          <Button
            type="button"
            onClick={() => handleProvider("google")}
            variant="secondary"
            className="w-full mt-2"
          >
            Sign in with Google
          </Button>
          <Button
            type="button"
            onClick={() => handleProvider("azure-ad")}
            variant="secondary"
            className="w-full mt-2"
          >
            Sign in with Microsoft
          </Button>
          <Button
            type="button"
            onClick={() => handleProvider("linkedin")}
            variant="secondary"
            className="w-full mt-2"
          >
            Sign in with LinkedIn
          </Button>
          <Button
            type="button"
            onClick={() => handleProvider("apple")}
            variant="secondary"
            className="w-full mt-2"
          >
            Sign in with Apple
          </Button>
        </Form>
        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
