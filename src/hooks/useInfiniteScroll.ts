import { useState, useEffect } from 'react';

interface UseInfiniteScrollReturn {
  isFetching: boolean;
  setIsFetching: (fetching: boolean) => void;
}

const useInfiniteScroll = (
  callback: () => void
): UseInfiniteScrollReturn => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      
      // Check if user has scrolled to near bottom
      if (scrollTop + clientHeight >= scrollHeight - 100 && !isFetching) {
        setIsFetching(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching]);

  useEffect(() => {
    if (!isFetching) return;
    
    const fetchData = async () => {
      await callback();
      setIsFetching(false);
    };

    fetchData();
  }, [isFetching, callback]);

  return { isFetching, setIsFetching };
};

export default useInfiniteScroll;
