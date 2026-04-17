import React, { createContext, useState, useEffect, useContext } from 'react';
import { checkAuth, logoutUser, getTabAuthUser, persistTabAuthSession } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const setUserAndPersist = (nextUser) => {
        setUser((prevUser) => {
            const resolvedUser = typeof nextUser === 'function' ? nextUser(prevUser) : nextUser;
            if (resolvedUser) {
                persistTabAuthSession({ user: resolvedUser });
            }
            return resolvedUser;
        });
    };

    useEffect(() => {
        const tabUser = getTabAuthUser();
        if (tabUser) {
            setUser(tabUser);
        }

        // Check if user is logged in on mount
        const verifyUser = async () => {
            const res = await checkAuth();
            if (res.success) {
                setUser(res.user);
            } else {
                setUser(null);
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
        <AuthContext.Provider value={{ user, setUser: setUserAndPersist, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
