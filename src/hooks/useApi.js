import { useState, useCallback } from 'react';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, onSuccess, onError) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'An error occurred';
      setError(message);
      if (onError) onError(message, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute, setError };
}

export default useApi;
