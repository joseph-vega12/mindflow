import { useCallback, useEffect } from 'react';

export const useDebounce = (effect: (...args: any) => void, delay: number, deps: any[]) => {
  const callback = useCallback(effect, deps);

  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);
};
