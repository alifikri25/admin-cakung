import { createContext, useContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Load from localStorage or default to 'light'
        const savedTheme = localStorage.getItem('admin-theme');
        return savedTheme || 'light';
    });

    useEffect(() => {
        // Save to localStorage whenever theme changes
        localStorage.setItem('admin-theme', theme);

        // Update document class for Tailwind dark mode - instant apply
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        // Use flushSync to apply theme change immediately
        flushSync(() => {
            setTheme(prev => prev === 'light' ? 'dark' : 'light');
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

