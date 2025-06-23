import { useEffect } from 'react';

/**
 * Stub implementation of useRouteChanged.
 * Replace with actual logic when ready.
 */
export default function useRouteChanged(callback: () => void) {
  useEffect(() => {
    // No-op: call the callback immediately for now
    callback?.();
  }, [callback]);
}
