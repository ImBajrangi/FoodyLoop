import { useState, useEffect } from 'react';
import { cache } from './cache';

export function useAppState() {
  const [state, setState] = useState(() => cache.getState());

  useEffect(() => {
    const unsubscribe = cache.subscribe(() => {
      setState({ ...cache.getState() });
    });
    return () => unsubscribe();
  }, []);

  return { state, cache };
}
