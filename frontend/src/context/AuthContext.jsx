import { createContext, useState, useEffect, useContext } from 'react';
import { getMe, requestOTP, verifyOTP, logout as apiLogout } from '../services/api';

const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (nextUser) => {
    if (!nextUser) return null;
    return {
      ...nextUser,
      timezone: nextUser.timezone || DEFAULT_TIMEZONE,
    };
  };

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data } = await getMe();
      setUser(normalizeUser(data.user));
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, otp) => {
    const { data } = await verifyOTP(email, otp);
    setUser(normalizeUser(data.user));
  };

  const requestLoginCode = async (email) => {
    await requestOTP(email);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await getMe();
    setUser(normalizeUser(data.user));
  };

  const updateUser = (nextUser) => {
    setUser(normalizeUser(nextUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, requestLoginCode, loading, refreshUser, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
