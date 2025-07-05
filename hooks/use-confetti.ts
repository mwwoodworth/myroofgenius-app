import { useCallback } from "react";

export function useConfetti() {
  return useCallback(async () => {
    const mod = await import("canvas-confetti");
    const confetti = mod.default || mod;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);
}
