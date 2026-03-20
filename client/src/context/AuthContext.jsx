// ═══════════════════════════════════════════════════════════
//                    AUTH CONTEXT
//        User & Admin Authentication State
// ═══════════════════════════════════════════════════════════
import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // ── State
  const [user,         setUser        ] = useState(null);
  const [admin,        setAdmin       ] = useState(null);
  const [loading,      setLoading     ] = useState(true);   // user auth loading
  const [adminLoading, setAdminLoading] = useState(true);   // admin auth loading
  const [error,        setError       ] = useState(null);

  // ─────────────────────────────────────────
  //   On Mount: Restore session from localStorage
  // ─────────────────────────────────────────
  useEffect(() => {
    const initUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const data = await authService.getMe(token);
          if (data?.user) setUser(data.user);
        }
      } catch {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    const initAdmin = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (token) {
          const data = await authService.getAdminMe(token);
          if (data?.admin) setAdmin(data.admin);
        }
      } catch {
        localStorage.removeItem("adminToken");
      } finally {
        setAdminLoading(false);
      }
    };

    initUser();
    initAdmin();
  }, []);

  // ─────────────────────────────────────────
  //   Register
  // ─────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setError(null);
    try {
      const data = await authService.register(formData);
      if (data?.token) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        navigate("/");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      return { success: false, message: msg };
    }
  }, [navigate]);

  // ─────────────────────────────────────────
  //   Login (User)
  // ─────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await authService.login({ email, password });
      if (data?.token) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        navigate("/");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password";
      setError(msg);
      return { success: false, message: msg };
    }
  }, [navigate]);

  // ─────────────────────────────────────────
  //   Admin Login
  // ─────────────────────────────────────────
  const adminLogin = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await authService.adminLogin({ email, password });
      if (data?.token) {
        localStorage.setItem("adminToken", data.token);
        setAdmin(data.admin);
        navigate("/admin/dashboard");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid admin credentials";
      setError(msg);
      return { success: false, message: msg };
    }
  }, [navigate]);

  // ─────────────────────────────────────────
  //   Logout (User)
  // ─────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  // ─────────────────────────────────────────
  //   Admin Logout
  // ─────────────────────────────────────────
  const adminLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    setAdmin(null);
    navigate("/admin/login");
  }, [navigate]);

  // ─────────────────────────────────────────
  //   Update user in state (after profile edit)
  // ─────────────────────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  }, []);

  const updateAdmin = useCallback((updatedAdmin) => {
    setAdmin((prev) => ({ ...prev, ...updatedAdmin }));
  }, []);

  // ─────────────────────────────────────────
  //   Helpers
  // ─────────────────────────────────────────
  const isLoggedIn     = !!user;
  const isAdmin        = !!admin;
  const isSuperAdmin   = admin?.isSuperAdmin === true;
  const userToken      = localStorage.getItem("token");
  const adminToken     = localStorage.getItem("adminToken");

  const hasPermission  = (permission) => {
    if (!admin) return false;
    if (admin.isSuperAdmin) return true;
    return admin.permissions?.[permission] === true;
  };

  // ─────────────────────────────────────────
  //   Context Value
  // ─────────────────────────────────────────
  const value = {
    // State
    user,
    admin,
    loading,
    adminLoading,
    error,
    // Auth flags
    isLoggedIn,
    isAdmin,
    isSuperAdmin,
    userToken,
    adminToken,
    // Actions
    register,
    login,
    adminLogin,
    logout,
    adminLogout,
    updateUser,
    updateAdmin,
    hasPermission,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
