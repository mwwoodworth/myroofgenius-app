'use client';

/**
 * Send an alert to a Make.com webhook if configured.
 */
export async function sendAlert(message: string) {
  const url = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  } catch (err) {
    console.error('alert failed', err);
  }
}
