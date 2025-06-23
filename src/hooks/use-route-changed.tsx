import { useEffect } from 'react';

/**
 * Stub implementation of useRouteChanged (TSX version).
 * Replace with actual logic when ready.
 */
export default function useRouteChanged(callback?: () => void) {
  useEffect(() => {
    callback?.();
  }, [callback]);
}
