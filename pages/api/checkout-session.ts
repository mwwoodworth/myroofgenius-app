import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

let stripe: Stripe | null = null;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripe) {
    stripe = new Stripe(key, { apiVersion: "2023-10-16" });
  }
  return stripe;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { price_id, product_id, user_id } = req.body;
    if (!price_id || !product_id || !user_id) {
      return res.status(400).json({ error: "missing data" });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: product } = await supabase
      .from("products")
      .select("price_id, price")
      .eq("id", product_id)
      .single();
    if (!product || product.price_id !== price_id) {
      return res.status(400).json({ error: "invalid product" });
    }

    const idempotencyKey =
      req.headers["idempotency-key"] || crypto.randomUUID();
    const stripeClient = getStripe();
    if (!stripeClient) {
      return res.status(500).json({ error: "Server not configured" });
    }

    const session = await stripeClient.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [{ price: price_id, quantity: 1 }],
        metadata: { product_id, user_id },
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      },
      { idempotencyKey: String(idempotencyKey) },
    );

    return res.status(200).json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Operation failed";
    console.error(`[Checkout] session creation failed: ${message}`);
    return res.status(500).json({
      error: "Unable to complete request. Please refresh and try again.",
    });
  }
}
