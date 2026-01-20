import React, { createContext, useState, useEffect, useContext } from 'react';
import { checkAuth, logoutUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const verifyUser = async () => {
            const res = await checkAuth();
            if (res.success) {
                setUser(res.user);
            }
            setLoading(false);
        };
        verifyUser();
    }, []);

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
