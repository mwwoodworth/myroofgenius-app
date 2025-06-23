import { useEffect } from 'react';

export default function useRouteChanged(callback?: () => void) {
  useEffect(() => {
    callback?.();
  }, [callback]);
}
