import { useEffect } from 'react';

/**
 * Global stub for useRouteChanged.
 */
export default function useRouteChanged(callback?: () => void) {
  useEffect(() => {
    callback?.();
  }, [callback]);
}
