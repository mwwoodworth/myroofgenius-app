import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Runs an optional callback whenever the Next.js route changes.
 */
export default function useRouteChanged(callback?: () => void) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => callback?.();

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, callback]);
}
