import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { adminLoginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const [formData, setFormData] = useState({
        loginId: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;

        if (user.role === 'admin') {
            navigate('/admin', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await adminLoginUser(formData.loginId, formData.password);

        if (!res.success) {
            setError(res.message);
            setLoading(false);
            return;
        }

        if (res.user?.role !== 'admin') {
            setError('This account is not an admin account.');
            setLoading(false);
            return;
        }

        setUser(res.user);
        navigate('/admin', { replace: true });
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white border border-luxury-border rounded-3xl shadow-xl p-8 md:p-10">
                <div className="flex flex-col items-center mb-8">
                    <Link to="/">
                        <Logo size="lg" />
                    </Link>
                    <h1 className="text-2xl font-serif font-medium mt-6 text-text-charcoal">Admin Login</h1>
                    <p className="text-text-muted text-sm mt-2">Use admin login ID and password to access admin controls.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                {user && user.role !== 'admin' && (
                    <div className="mb-6 bg-blue-50 border border-blue-100 text-blue-700 text-sm p-3 rounded-lg text-center font-medium">
                        You are currently logged in as a member. Enter admin credentials below to switch to admin mode.
                    </div>
                )}

                <div className="mb-6 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl p-3 text-xs">
                    Default admin test credentials:
                    <div className="font-bold mt-1">Login ID: 1</div>
                    <div className="font-bold">Password: 1</div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-grey ml-3">Admin Login ID</label>
                        <input
                            type="text"
                            value={formData.loginId}
                            onChange={(e) => setFormData((prev) => ({ ...prev, loginId: e.target.value }))}
                            required
                            className="w-full bg-white border border-subtle-border rounded-full px-5 py-3.5 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm outline-none"
                            placeholder="Enter admin login ID"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-grey ml-3">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                            required
                            className="w-full bg-white border border-subtle-border rounded-full px-5 py-3.5 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm outline-none"
                            placeholder="Enter password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-full font-bold text-sm tracking-widest uppercase text-white bg-rajkumari-pink hover:bg-rajkumari-pink/90 transition-all shadow-soft disabled:opacity-70"
                    >
                        {loading ? 'Signing In...' : 'Admin Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-rajkumari hover:text-rajkumari-pink font-semibold">
                        Go to member login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
