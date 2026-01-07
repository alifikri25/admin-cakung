import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "https://cakung-barat-server-1065513777845.asia-southeast2.run.app";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(() =>
        localStorage.getItem('refreshToken')
    );
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [setupMode, setSetupMode] = useState(false);
    const [authStatus, setAuthStatus] = useState(null);

    // Check auth status on mount
    const checkAuthStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/status`);
            const data = await res.json();
            setAuthStatus(data);
            return data;
        } catch (error) {
            console.error('Failed to check auth status:', error);
            return null;
        }
    }, []);

    // Refresh access token
    const refreshAccessToken = useCallback(async () => {
        if (!refreshToken) return null;

        try {
            const res = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!res.ok) {
                // Refresh token invalid or expired
                logout();
                return null;
            }

            const data = await res.json();
            setAccessToken(data.access_token);
            setSetupMode(data.setup_mode);
            return data.access_token;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            logout();
            return null;
        }
    }, [refreshToken]);

    // Login
    const login = async (username, password) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Login failed');
            }

            const data = await res.json();
            setAccessToken(data.access_token);
            setRefreshToken(data.refresh_token);
            setSetupMode(data.setup_mode);
            setIsAuthenticated(true);
            localStorage.setItem('refreshToken', data.refresh_token);

            return { success: true, setupMode: data.setup_mode };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Logout
    const logout = useCallback(() => {
        setAccessToken(null);
        setRefreshToken(null);
        setIsAuthenticated(false);
        setSetupMode(false);
        localStorage.removeItem('refreshToken');
    }, []);

    // Get valid access token (refresh if needed)
    const getAccessToken = useCallback(async () => {
        if (accessToken) return accessToken;
        return await refreshAccessToken();
    }, [accessToken, refreshAccessToken]);

    // Authenticated fetch helper
    const authFetch = useCallback(async (url, options = {}) => {
        const token = await getAccessToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        };

        let res = await fetch(url, { ...options, headers });

        // If 401, try refresh and retry once
        if (res.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                headers['Authorization'] = `Bearer ${newToken}`;
                res = await fetch(url, { ...options, headers });
            }
        }

        return res;
    }, [getAccessToken, refreshAccessToken]);

    // Initialize auth on mount
    useEffect(() => {
        const init = async () => {
            await checkAuthStatus();

            if (refreshToken) {
                const token = await refreshAccessToken();
                if (token) {
                    setIsAuthenticated(true);
                }
            }

            setIsLoading(false);
        };

        init();
    }, [checkAuthStatus, refreshAccessToken, refreshToken]);

    const value = {
        isAuthenticated,
        isLoading,
        setupMode,
        authStatus,
        login,
        logout,
        getAccessToken,
        authFetch,
        checkAuthStatus,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export default AuthContext;
