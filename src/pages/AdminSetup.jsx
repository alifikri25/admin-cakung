import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import './AdminSetup.css';

export default function AdminSetup() {
    const navigate = useNavigate();
    const { authFetch, setupMode, logout } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!setupMode) {
            // Not in setup mode, redirect to login
            navigate('/login');
        }
    }, [setupMode, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password !== confirmPassword) {
            setError('Password tidak sama');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        if (username.length < 3) {
            setError('Username minimal 3 karakter');
            return;
        }

        setIsLoading(true);

        try {
            const res = await authFetch(`${API_URL}/api/auth/admins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                    display_name: displayName || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal membuat admin');
            }

            setSuccess(true);

            // Logout from setup mode and redirect to login
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);

        } catch (error) {
            setError(error.message);
        }

        setIsLoading(false);
    };

    if (success) {
        return (
            <div className="setup-container">
                <div className="setup-card success-card">
                    <div className="success-icon">
                        <Check size={48} />
                    </div>
                    <h2>Admin Berhasil Dibuat!</h2>
                    <p>Silakan login dengan akun baru Anda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="setup-container">
            <div className="setup-card">
                <div className="setup-header">
                    <div className="setup-icon">
                        <UserPlus size={32} />
                    </div>
                    <h1>Setup Admin Pertama</h1>
                    <p>Buat akun admin untuk mengakses panel admin</p>
                </div>

                {error && (
                    <div className="error-message">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="displayName">Nama Lengkap (Opsional)</label>
                        <input
                            type="text"
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Nama yang akan ditampilkan"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username *</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username untuk login"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimal 6 karakter"
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Konfirmasi Password *</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Buat Admin
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
