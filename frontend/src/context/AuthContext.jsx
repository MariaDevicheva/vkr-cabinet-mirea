import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token || 'logged_in');
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('profile', JSON.stringify(data.profile));

        setUser(data.user);
        setUserType(data.userType);
        setProfile(data.profile);

        return { success: true };
      }

      return {
        success: false,
        error: data.error || data.detail || 'Неверный логин или пароль'
      };
    } catch (error) {
      console.error('Ошибка:', error);
      return { success: false, error: 'Ошибка подключения к серверу' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');

    setUser(null);
    setProfile(null);
    setUserType(null);
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    const savedUser = localStorage.getItem('user');
    const savedProfile = localStorage.getItem('profile');
    const savedUserType = localStorage.getItem('userType');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType);
      if (savedProfile) setProfile(JSON.parse(savedProfile));
    }

    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, userType, login, logout, loading, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);