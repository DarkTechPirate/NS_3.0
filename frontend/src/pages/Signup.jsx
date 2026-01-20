import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignUp, GOOGLE_AUTH_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Signup = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Minimal Password Strength (Frontend check visual only, detailed logic on backend)
    const [passwordStrength, setPasswordStrength] = useState(0);

    const checkStrength = (pass) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score; // Max 4
    };

    const getStrengthColor = (level) => {
        if (passwordStrength >= level) {
            if (passwordStrength <= 1) return 'bg-red-400';
            if (passwordStrength === 2) return 'bg-amber-400';
            return 'bg-green-500';
        }
        return 'bg-stone-200';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'password') {
            setPasswordStrength(checkStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (passwordStrength < 3) {
            setError("Password is too weak. Please include standard complexity (Upper, Number, Symbol).");
            return;
        }

        setLoading(true);

        const res = await SignUp(formData.fullname, formData.email, formData.password, formData.confirmPassword);

        if (res.success) {
            setUser(res.user);
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="font-display bg-background-light min-h-screen flex flex-col items-center justify-center p-6 text-text-charcoal relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-ghee-yellow/10 rounded-full blur-[100px] opacity-60"></div>
                <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-rajkumari-light/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-luxury-border rounded-3xl shadow-xl p-8 md:p-10 relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <Link to="/">
                        <Logo size="lg" />
                    </Link>
                    <h1 className="text-2xl font-serif font-medium mt-6 text-text-charcoal">Apply for Membership</h1>
                    <p className="text-text-muted text-sm mt-2">Begin your journey with us</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-grey ml-3">Full Name</label>
                        <input
                            type="text"
                            name="fullname"
                            required
                            value={formData.fullname}
                            onChange={handleChange}
                            className="w-full bg-white border border-subtle-border rounded-full px-5 py-3.5 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm outline-none"
                            placeholder="Your Name"
                        />
                    </div>

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
                        {/* Strength Meter */}
                        {formData.password && (
                            <div className="px-4 flex gap-1 h-1 mt-2">
                                {[1, 2, 3, 4].map((level) => (
                                    <div key={level} className={`flex-1 rounded-full transition-all duration-300 ${getStrengthColor(level)}`}></div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-grey ml-3">Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full bg-white border border-subtle-border rounded-full px-5 py-3.5 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-2 rounded-full font-bold text-sm tracking-widest uppercase text-white bg-rajkumari-pink hover:bg-rajkumari-pink/90 transition-all duration-300 transform hover:scale-[1.02] shadow-soft disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            'Create Account'
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
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-rajkumari hover:text-rajkumari-pink transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
