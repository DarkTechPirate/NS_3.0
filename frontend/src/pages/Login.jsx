import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, GOOGLE_AUTH_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Login = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await loginUser(formData.email, formData.password);

        if (res.success) {
            setUser(res.user);
            navigate('/dashboard'); // Go to dashboard after login
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="font-display bg-background-light min-h-screen flex flex-col items-center justify-center p-6 text-text-charcoal relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-rajkumari-light/30 rounded-full blur-[100px] opacity-60"></div>
                <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-ghee-yellow/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-luxury-border rounded-3xl shadow-xl p-8 md:p-10 relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <Link to="/">
                        <Logo size="lg" />
                    </Link>
                    <h1 className="text-2xl font-serif font-medium mt-6 text-text-charcoal">Welcome Back</h1>
                    <p className="text-text-muted text-sm mt-2">Log in to your account</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-grey ml-3">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-white border border-subtle-border rounded-full px-5 py-3.5 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm outline-none"
                            placeholder="name@email.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-grey ml-3">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-white border border-subtle-border rounded-full px-5 py-3.5 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm outline-none pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-grey/50 hover:text-rajkumari transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                        <div className="flex justify-end pr-2 pt-1">
                            <Link to="#" className="text-xs font-medium text-rajkumari hover:text-rajkumari-pink transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-2 rounded-full font-bold text-sm tracking-widest uppercase text-white bg-rajkumari-pink hover:bg-rajkumari-pink/90 transition-all duration-300 transform hover:scale-[1.02] shadow-soft disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="grow border-t border-luxury-border"></div>
                        <span className="shrink-0 mx-3 text-slate-grey/50 text-[10px] uppercase tracking-widest font-bold">Or</span>
                        <div className="grow border-t border-luxury-border"></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-full border border-luxury-border bg-white text-text-charcoal font-medium text-sm transition-all duration-300 hover:bg-ghee-light/50 hover:border-ghee-yellow/50"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-4 w-4" />
                        Continue with Google
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-text-muted">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-bold text-rajkumari hover:text-rajkumari-pink transition-colors">
                            Apply Now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
