import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("pulse_token"));
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setCurrentUser(null);
        setUnreadNotifications(0);
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setCurrentUser(data.user);
        setUnreadNotifications(data.unreadNotifications || 0);
      } catch (error) {
        localStorage.removeItem("pulse_token");
        setToken(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, [token]);

  const persistAuth = (payload) => {
    localStorage.setItem("pulse_token", payload.token);
    setToken(payload.token);
    setCurrentUser(payload.user);
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    persistAuth(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persistAuth(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Ignore logout network errors and clear local state anyway.
    } finally {
      localStorage.removeItem("pulse_token");
      setToken(null);
      setCurrentUser(null);
      setUnreadNotifications(0);
    }
  };

  const refreshCurrentUser = async () => {
    const { data } = await api.get("/auth/me");
    setCurrentUser(data.user);
    setUnreadNotifications(data.unreadNotifications || 0);
    return data.user;
  };

  const value = useMemo(
    () => ({
      token,
      currentUser,
      unreadNotifications,
      loading,
      login,
      register,
      logout,
      refreshCurrentUser,
      setCurrentUser,
      setUnreadNotifications
    }),
    [token, currentUser, unreadNotifications, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

