import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        const stored = localStorage.getItem('auth');
        return stored ? JSON.parse(stored) : null;
    });

    const login = (userData) => {
        localStorage.setItem('auth', JSON.stringify(userData));
        setAuth(userData);
    };

    const logout = () => {
        localStorage.removeItem('auth');
        setAuth(null);
    };

    return (
        <AuthContext.Provider value={{ 
            auth, 
            login, 
            logout,
            departmentId: auth?.user?.department_id,
            departmentName: auth?.user?.department_name
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);