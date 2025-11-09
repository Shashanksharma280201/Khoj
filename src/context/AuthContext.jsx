import { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI, setAuthToken } from '../lib/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem('khoj_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      setAuthToken(storedToken);
      try {
        const profile = await AuthAPI.me();
        setUser(profile);
      } catch (error) {
        console.error('Failed to restore session', error);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (credentials) => {
    try {
      const result = await AuthAPI.login(credentials);
      setAuthToken(result.token);
      setUser(result.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const result = await AuthAPI.signup(userData);
      setAuthToken(result.token);
      setUser(result.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
