import { createContext, useState, useEffect, useContext } from 'react';
import { getMe, requestOTP, verifyOTP, logout as apiLogout } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data } = await getMe();
      setUser(data.user);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, otp) => {
    const { data } = await verifyOTP(email, otp);
    setUser(data.user);
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
    setUser(data.user);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, requestLoginCode, loading, refreshUser, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
