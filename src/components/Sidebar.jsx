import { Home, FileText, X, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    const menuItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/posts/new', icon: FileText, label: 'New Post' },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-50 h-screen
                    w-64 
                    bg-gradient-to-b from-white to-gray-50
                    dark:from-slate-900 dark:to-slate-800
                    text-gray-900 dark:text-white 
                    shadow-xl border-r border-gray-200 dark:border-slate-700
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Admin Panel
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Cakung Barat</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg
                                    transition-all duration-200
                                    ${active
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                                    }
                                `}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer with Theme Toggle */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg 
                                   bg-gray-100 dark:bg-slate-700 
                                   text-gray-700 dark:text-gray-200
                                   hover:bg-gray-200 dark:hover:bg-slate-600 
                                   transition-colors"
                    >
                        {theme === 'light' ? (
                            <>
                                <Moon size={18} />
                                <span className="text-sm font-medium">Dark Mode</span>
                            </>
                        ) : (
                            <>
                                <Sun size={18} />
                                <span className="text-sm font-medium">Light Mode</span>
                            </>
                        )}
                    </button>
                    <div className="text-xs text-gray-400 dark:text-slate-400 text-center mt-3">
                        v1.0.0
                    </div>
                </div>
            </aside>
        </>
    );
}
