import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Trash2, AlertCircle, X, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import './AdminManagement.css';

export default function AdminManagement() {
    const navigate = useNavigate();
    const { authFetch, isAuthenticated } = useAuth();

    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Add admin modal
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        display_name: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch admins
    const fetchAdmins = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await authFetch(`${API_URL}/api/auth/admins`);

            if (!res.ok) {
                if (res.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Gagal memuat data admin');
            }

            const data = await res.json();
            setAdmins(data);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, navigate]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchAdmins();
    }, [isAuthenticated, navigate, fetchAdmins]);

    // Create admin
    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setFormError('');

        if (formData.password.length < 6) {
            setFormError('Password minimal 6 karakter');
            return;
        }

        if (formData.username.length < 3) {
            setFormError('Username minimal 3 karakter');
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await authFetch(`${API_URL}/api/auth/admins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    display_name: formData.display_name || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal membuat admin');
            }

            await fetchAdmins();
            setShowModal(false);
            setFormData({ username: '', password: '', display_name: '' });
        } catch (err) {
            setFormError(err.message);
        }

        setIsSubmitting(false);
    };

    // Delete admin
    const handleDeleteAdmin = async (adminId, adminUsername) => {
        if (!window.confirm(`Yakin ingin menghapus admin "${adminUsername}"?`)) {
            return;
        }

        try {
            const res = await authFetch(`${API_URL}/api/auth/admins/${adminId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal menghapus admin');
            }

            await fetchAdmins();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="admin-management">
            <div className="admin-header">
                <div className="header-left">
                    <Users size={28} />
                    <div>
                        <h1>Manajemen Admin</h1>
                        <p>{admins.length} admin terdaftar</p>
                    </div>
                </div>
                <button className="btn-add" onClick={() => setShowModal(true)}>
                    <UserPlus size={18} />
                    Tambah Admin
                </button>
            </div>

            {error && (
                <div className="error-banner">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button onClick={() => setError('')}><X size={16} /></button>
                </div>
            )}

            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Memuat data admin...</p>
                </div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Nama</th>
                                <th>Dibuat</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((admin) => (
                                <tr key={admin.id}>
                                    <td className="username-cell">
                                        <span className="username-badge">{admin.username}</span>
                                    </td>
                                    <td>{admin.display_name || '-'}</td>
                                    <td>{formatDate(admin.created_at)}</td>
                                    <td>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteAdmin(admin.id, admin.username)}
                                            title="Hapus Admin"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {admins.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="empty-state">
                                        Belum ada admin terdaftar
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Admin Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Tambah Admin Baru</h3>
                            <button className="btn-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {formError && (
                            <div className="modal-error">
                                <AlertCircle size={16} />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateAdmin}>
                            <div className="form-group">
                                <label>Nama Lengkap (Opsional)</label>
                                <input
                                    type="text"
                                    value={formData.display_name}
                                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                    placeholder="Nama yang akan ditampilkan"
                                />
                            </div>

                            <div className="form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="Username untuk login"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Password *</label>
                                <div className="password-input">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Minimal 6 karakter"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <span className="loading-spinner-sm"></span>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            Simpan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
