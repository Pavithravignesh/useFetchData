import { useState, useEffect, useCallback, useRef } from 'react';

// Define the types for the options object
interface FetchOptions {
    refreshInterval?: number;
    dedupingInterval?: number;
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
    onError?: (error: any) => void;
}

// Define the return type of the hook
interface FetchResult<T> {
    data: T | null;
    error: any;
    isLoading: boolean;
    isValidating: boolean;
}

// Define the type for the fetcher function
type Fetcher<T> = () => Promise<T>;

// Define the global cache with a generic type
const globalCache = new Map<string, { data: any; lastFetch: number }>();

// Main hook function with generic type for data
const useFetchData = <T>(key: string, fetcher: Fetcher<T>, options: FetchOptions = {}): FetchResult<T> => {
    const {
        refreshInterval = 0,
        dedupingInterval = 2000,
        revalidateOnFocus = true,
        revalidateOnReconnect = true,
        onError = null
    } = options;

    const cache = useRef(globalCache);
    const [data, setData] = useState<T | null>(cache.current.get(key)?.data || null);
    const [error, setError] = useState<any>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [isLoading, setIsLoading] = useState(!data);

    // Function to fetch and cache data
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const now = Date.now();
        const cached = cache.current.get(key);

        // Use cached data if within deduping interval
        if (cached && now - cached.lastFetch < dedupingInterval) {
            setData(cached.data);
            setIsLoading(false);
            return;
        }

        setIsValidating(true);
        try {
            const newData = await fetcher();
            setData(newData);
            cache.current.set(key, { data: newData, lastFetch: now });
        } catch (err) {
            setError(err);
            if (onError) onError(err);
        } finally {
            setIsLoading(false);
            setIsValidating(false);
        }
    }, [key, fetcher, dedupingInterval, onError]);

    // Initial fetch and refresh interval
    useEffect(() => {
        if (!key) return;
        fetchData();

        if (refreshInterval) {
            const intervalId = setInterval(fetchData, refreshInterval);
            return () => clearInterval(intervalId);
        }
    }, [fetchData, refreshInterval]);

    // Revalidate on window focus
    useEffect(() => {
        if (!revalidateOnFocus) return;
        const onFocus = () => fetchData();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchData, revalidateOnFocus]);

    // Revalidate on network reconnection
    useEffect(() => {
        if (!revalidateOnReconnect) return;
        const onOnline = () => fetchData();
        window.addEventListener('online', onOnline);
        return () => window.removeEventListener('online', onOnline);
    }, [fetchData, revalidateOnReconnect]);

    return { data, error, isLoading, isValidating };
};

export default useFetchData;
