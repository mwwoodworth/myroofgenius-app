"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import Button from "../Button";
import Lottie from "lottie-react";
import successAnim from "../../public/empty-box.json";

export default function EmailSignupForm({
  className = "",
}: {
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "success" | "error" | "loading"
  >("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setStatus("success");
      else throw new Error("fail");
    } catch {
      setStatus("error");
    }
  };
  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={clsx(
        "space-y-4 glass rounded-2xl shadow-[0px_8px_32px_rgba(0,0,0,0.1)] p-6",
        className,
      )}
    >
      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center text-center"
        >
          <Lottie
            animationData={successAnim}
            className="w-24 h-24"
            loop={false}
          />
          <p className="text-accent-emerald font-semibold">Check your inbox!</p>
        </motion.div>
      ) : (
        <>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={status === "error"}
            className="w-full px-4 py-3 rounded-lg text-gray-900"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Submitting..." : "Get Free Sample"}
          </Button>
          <p className="text-xs text-text-secondary text-center">
            We respect your privacy. Unsubscribe anytime.
          </p>
          {status === "error" && (
            <p className="text-red-600 text-sm text-center">
              Enter a valid email to receive the sample.
            </p>
          )}
        </>
      )}
    </motion.form>
  );
}
