import { useState, useEffect, useRef } from 'react';

interface UseInfiniteScrollReturn {
  isFetching: boolean;
  setIsFetching: (fetching: boolean) => void;
}

const useInfiniteScroll = (callback: () => Promise<void> | void): UseInfiniteScrollReturn => {
  const [isFetching, setIsFetching] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const nearBottom = scrollTop + clientHeight >= scrollHeight - 200;
        if (nearBottom && !isFetching) {
          setIsFetching(true);
        }
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll as EventListener);
  }, [isFetching]);

  useEffect(() => {
    if (!isFetching) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        await callback();
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [isFetching, callback]);

  return { isFetching, setIsFetching };
};

export default useInfiniteScroll;
