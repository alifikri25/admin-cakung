import { createContext, useContext, useState, useCallback } from 'react';

const CacheContext = createContext();

export const useCache = () => {
    const context = useContext(CacheContext);
    if (!context) {
        throw new Error('useCache must be used within CacheProvider');
    }
    return context;
};

export const CacheProvider = ({ children }) => {
    const [cache, setCache] = useState({});

    // Get cached data with TTL check
    const getCached = useCallback((key) => {
        const cached = cache[key];
        if (!cached) return null;

        const now = Date.now();
        if (now > cached.expiry) {
            // Cache expired, remove it
            setCache(prev => {
                const newCache = { ...prev };
                delete newCache[key];
                return newCache;
            });
            return null;
        }

        return cached.data;
    }, [cache]);

    // Set cache with TTL (default 5 minutes)
    const setCached = useCallback((key, data, ttl = 5 * 60 * 1000) => {
        setCache(prev => ({
            ...prev,
            [key]: {
                data,
                expiry: Date.now() + ttl
            }
        }));
    }, []);

    // Invalidate specific cache key
    const invalidate = useCallback((key) => {
        setCache(prev => {
            const newCache = { ...prev };
            delete newCache[key];
            return newCache;
        });
    }, []);

    // Clear all cache
    const clearAll = useCallback(() => {
        setCache({});
    }, []);

    // Invalidate cache keys that match a pattern
    const invalidatePattern = useCallback((pattern) => {
        setCache(prev => {
            const newCache = { ...prev };
            Object.keys(newCache).forEach(key => {
                if (key.includes(pattern)) {
                    delete newCache[key];
                }
            });
            return newCache;
        });
    }, []);

    return (
        <CacheContext.Provider value={{
            getCached,
            setCached,
            invalidate,
            invalidatePattern,
            clearAll
        }}>
            {children}
        </CacheContext.Provider>
    );
};
