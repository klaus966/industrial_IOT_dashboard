import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Here you would verify token or fetch user profile
            // For now we just assume if token exists, we are logged in
            // A real app would hit /users/me here
            setLoading(false);
            // We could decode JWT to get user info if needed
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        // Prepare form data for OAuth2 compatible endpoint
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        try {
            // Send login request
            const res = await client.post('/auth/token', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            // Extract and save token
            const accessToken = res.data.access_token;
            localStorage.setItem('token', accessToken);
            setToken(accessToken);
            setUser({ email });
            return true;
        } catch (err) {
            console.error("Login failed", err);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
