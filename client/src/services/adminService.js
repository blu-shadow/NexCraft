// ═══════════════════════════════════════════════════════════
//                  ADMIN SERVICE
//     Dashboard, Users, Site Config, Admin Management
// ═══════════════════════════════════════════════════════════
import axios from "axios";

const BASE   = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const adminH = () => ({ Authorization: `Bearer ${localStorage.getItem("adminToken")}` });

// ════════════════════════════════════════
//   DASHBOARD
// ════════════════════════════════════════

export const getDashboardStats = async () => {
  const res = await axios.get(`${BASE}/admin/dashboard`, {
    headers: adminH(),
  });
  return res.data;
};

// ════════════════════════════════════════
//   USER MANAGEMENT
// ════════════════════════════════════════

export const getAllUsers = async (params = {}) => {
  const res = await axios.get(`${BASE}/admin/users`, {
    headers: adminH(),
    params,
  });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axios.get(`${BASE}/admin/users/${id}`, {
    headers: adminH(),
  });
  return res.data;
};

export const toggleUserStatus = async (id) => {
  const res = await axios.patch(`${BASE}/admin/users/${id}/toggle`, {}, {
    headers: adminH(),
  });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`${BASE}/admin/users/${id}`, {
    headers: adminH(),
  });
  return res.data;
};

// ════════════════════════════════════════
//   ADMIN MANAGEMENT (Super Admin)
// ════════════════════════════════════════

export const getAllAdmins = async () => {
  const res = await axios.get(`${BASE}/admin/admins`, {
    headers: adminH(),
  });
  return res.data;
};

export const createAdmin = async (formData) => {
  const res = await axios.post(`${BASE}/admin/admins`, formData, {
    headers: { ...adminH(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateAdmin = async (id, formData) => {
  const res = await axios.put(`${BASE}/admin/admins/${id}`, formData, {
    headers: { ...adminH(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const toggleAdminStatus = async (id) => {
  const res = await axios.patch(`${BASE}/admin/admins/${id}/toggle`, {}, {
    headers: adminH(),
  });
  return res.data;
};

export const deleteAdmin = async (id) => {
  const res = await axios.delete(`${BASE}/admin/admins/${id}`, {
    headers: adminH(),
  });
  return res.data;
};

// ════════════════════════════════════════
//   SITE CONFIG
// ════════════════════════════════════════

export const getSiteConfig = async () => {
  const res = await axios.get(`${BASE}/admin/site-config`, {
    headers: adminH(),
  });
  return res.data;
};

export const updateBranding = async (formData) => {
  const res = await axios.put(`${BASE}/admin/site-config/branding`, formData, {
    headers: { ...adminH(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateAbout = async (data) => {
  const res = await axios.put(`${BASE}/admin/site-config/about`, data, {
    headers: adminH(),
  });
  return res.data;
};

export const updatePrivacy = async (data) => {
  const res = await axios.put(`${BASE}/admin/site-config/privacy`, data, {
    headers: adminH(),
  });
  return res.data;
};

export const updateContact = async (data) => {
  const res = await axios.put(`${BASE}/admin/site-config/contact`, data, {
    headers: adminH(),
  });
  return res.data;
};

export const updateSocial = async (data) => {
  const res = await axios.put(`${BASE}/admin/site-config/social`, data, {
    headers: adminH(),
  });
  return res.data;
};

export const updateSeo = async (data) => {
  const res = await axios.put(`${BASE}/admin/site-config/seo`, data, {
    headers: adminH(),
  });
  return res.data;
};

export const addCertificate = async (data) => {
  const res = await axios.post(`${BASE}/admin/site-config/certificates`, data, {
    headers: adminH(),
  });
  return res.data;
};

export const updateCertificate = async (certId, data) => {
  const res = await axios.put(`${BASE}/admin/site-config/certificates/${certId}`, data, {
    headers: adminH(),
  });
  return res.data;
};

export const deleteCertificate = async (certId) => {
  const res = await axios.delete(`${BASE}/admin/site-config/certificates/${certId}`, {
    headers: adminH(),
  });
  return res.data;
};

export const toggleMaintenance = async (message = "") => {
  const res = await axios.patch(
    `${BASE}/admin/site-config/maintenance`,
    { message },
    { headers: adminH() }
  );
  return res.data;
};
