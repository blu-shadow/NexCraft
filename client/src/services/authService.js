// ═══════════════════════════════════════════════════════════
//                   AUTH SERVICE
//           All Auth-related API calls
// ═══════════════════════════════════════════════════════════
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Auth token headers
const authHeader  = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const adminHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("adminToken")}` });

// ─────────────────────────────────────────
//   USER AUTH
// ─────────────────────────────────────────

// Register
export const register = async (data) => {
  const res = await axios.post(`${BASE}/auth/register`, data);
  return res.data;
};

// Login
export const login = async (data) => {
  const res = await axios.post(`${BASE}/auth/login`, data);
  return res.data;
};

// Get current user (me)
export const getMe = async (token) => {
  const res = await axios.get(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update password
export const updatePassword = async (data) => {
  const res = await axios.put(`${BASE}/auth/update-password`, data, {
    headers: authHeader(),
  });
  return res.data;
};

// Forgot password
export const forgotPassword = async (email) => {
  const res = await axios.post(`${BASE}/auth/forgot-password`, { email });
  return res.data;
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  const res = await axios.put(`${BASE}/auth/reset-password/${token}`, { newPassword });
  return res.data;
};

// Logout
export const logout = async () => {
  const res = await axios.post(`${BASE}/auth/logout`, {}, {
    headers: authHeader(),
  });
  return res.data;
};

// ─────────────────────────────────────────
//   ADMIN AUTH
// ─────────────────────────────────────────

// Admin login
export const adminLogin = async (data) => {
  const res = await axios.post(`${BASE}/auth/admin/login`, data);
  return res.data;
};

// Get current admin (me)
export const getAdminMe = async (token) => {
  const res = await axios.get(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ─────────────────────────────────────────
//   USER PROFILE
// ─────────────────────────────────────────

// Get my profile
export const getMyProfile = async () => {
  const res = await axios.get(`${BASE}/users/profile`, {
    headers: authHeader(),
  });
  return res.data;
};

// Update profile
export const updateMyProfile = async (data) => {
  const res = await axios.put(`${BASE}/users/profile`, data, {
    headers: authHeader(),
  });
  return res.data;
};

// Upload avatar
export const uploadAvatar = async (formData) => {
  const res = await axios.put(`${BASE}/users/avatar`, formData, {
    headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete avatar
export const deleteAvatar = async () => {
  const res = await axios.delete(`${BASE}/users/avatar`, {
    headers: authHeader(),
  });
  return res.data;
};

// Delete account
export const deleteAccount = async (password) => {
  const res = await axios.delete(`${BASE}/users/account`, {
    headers: authHeader(),
    data   : { password },
  });
  return res.data;
};

export default { authHeader, adminHeader };
