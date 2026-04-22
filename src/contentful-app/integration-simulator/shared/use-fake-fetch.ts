import { useCallback, useEffect, useRef, useState } from 'react';

interface FakeFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Wraps a fetcher function with configurable fake latency for demo realism.
 * @param fetcher - async function that returns data
 * @param deps - dependency array (re-fetches when deps change)
 * @param delayRange - [minMs, maxMs] for random fake latency (default: [300, 800])
 */
export function useFakeFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  delayRange: [number, number] = [300, 800],
): FakeFetchState<T> {
  const [state, setState] = useState<FakeFetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [minMs, maxMs] = delayRange;

  useEffect(() => {
    let cancelled = false;

    setState((s) => ({ ...s, isLoading: true, error: null }));

    const delay = minMs + Math.random() * (maxMs - minMs);

    const timer = setTimeout(async () => {
      try {
        const data = await fetcherRef.current();
        if (!cancelled) {
          setState({ data, isLoading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            data: null,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
