import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const useQuery = () => {
  const { search } = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(search);
    const result = {};
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    return result;
  }, [search]);
};

export default useQuery;
