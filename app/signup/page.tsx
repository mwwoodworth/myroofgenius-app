"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useConfetti } from "../../hooks/use-confetti";
import Button from "../../components/Button";
import Form from "../../components/Form";
import { buildMeta } from "../../lib/metadata";

export const generateMetadata = () =>
  buildMeta({
    title: "Sign Up | MyRoofGenius",
    description: "Create your account to start using AI roofing tools.",
  });

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const triggerConfetti = useConfetti();
  const supabase = createClientComponentClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("Could not create account. Please check your details.");
    else setSuccess(true);
    setLoading(false);
  };

  useEffect(() => {
    if (success) triggerConfetti();
  }, [success, triggerConfetti]);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-center">Check your email to confirm your account.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">Create account</h1>
        <Form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <p className="text-danger text-sm" id="signup-error">
              {error}
            </p>
          )}
          <Form.Input
            label="Email"
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={error || undefined}
          />
          <Form.Input
            label="Password"
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            error={error || undefined}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </Form>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-accent underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
