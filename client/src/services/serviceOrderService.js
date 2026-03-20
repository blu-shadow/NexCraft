// ═══════════════════════════════════════════════════════════
//             SERVICE & ORDER SERVICE
// ═══════════════════════════════════════════════════════════
import axios from "axios";

const BASE   = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const authH  = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const adminH = () => ({ Authorization: `Bearer ${localStorage.getItem("adminToken")}` });

// ════════════════════════════════════════
//   SERVICES — PUBLIC
// ════════════════════════════════════════

// Get all active services
export const getAllServices = async (params = {}) => {
  const res = await axios.get(`${BASE}/services`, { params });
  return res.data;
};

// Get featured services (for Home page)
export const getFeaturedServices = async (limit = 6) => {
  const res = await axios.get(`${BASE}/services/featured`, { params: { limit } });
  return res.data;
};

// Get single service by slug
export const getServiceBySlug = async (slug) => {
  const res = await axios.get(`${BASE}/services/${slug}`);
  return res.data;
};

// Get services by category
export const getServicesByCategory = async (category) => {
  const res = await axios.get(`${BASE}/services/category/${category}`);
  return res.data;
};

// ════════════════════════════════════════
//   SERVICES — ADMIN
// ════════════════════════════════════════

// Create service
export const createService = async (formData) => {
  const res = await axios.post(`${BASE}/services`, formData, {
    headers: { ...adminH(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update service
export const updateService = async (id, formData) => {
  const res = await axios.put(`${BASE}/services/${id}`, formData, {
    headers: { ...adminH(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete service
export const deleteService = async (id) => {
  const res = await axios.delete(`${BASE}/services/${id}`, {
    headers: adminH(),
  });
  return res.data;
};

// Toggle active/inactive
export const toggleServiceStatus = async (id) => {
  const res = await axios.patch(`${BASE}/services/${id}/toggle`, {}, {
    headers: adminH(),
  });
  return res.data;
};

// Reorder services
export const reorderServices = async (orderedIds) => {
  const res = await axios.put(
    `${BASE}/services/reorder`,
    { orderedIds },
    { headers: adminH() }
  );
  return res.data;
};

// ════════════════════════════════════════
//   ORDERS — PUBLIC / USER
// ════════════════════════════════════════

// Place a new order (guest or user)
export const placeOrder = async (data) => {
  const token  = localStorage.getItem("token");
  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
  const res = await axios.post(`${BASE}/orders`, data, config);
  return res.data;
};

// Get my orders (logged-in user)
export const getMyOrders = async (params = {}) => {
  const res = await axios.get(`${BASE}/orders/my`, {
    headers: authH(),
    params,
  });
  return res.data;
};

// Get single order (own)
export const getMyOrderById = async (id) => {
  const res = await axios.get(`${BASE}/orders/my/${id}`, {
    headers: authH(),
  });
  return res.data;
};

// Cancel own order
export const cancelOrder = async (id) => {
  const res = await axios.patch(`${BASE}/orders/my/${id}/cancel`, {}, {
    headers: authH(),
  });
  return res.data;
};

// ════════════════════════════════════════
//   ORDERS — ADMIN
// ════════════════════════════════════════

// Get order stats
export const getOrderStats = async () => {
  const res = await axios.get(`${BASE}/orders/admin/stats`, {
    headers: adminH(),
  });
  return res.data;
};

// Get all orders
export const adminGetAllOrders = async (params = {}) => {
  const res = await axios.get(`${BASE}/orders/admin`, {
    headers: adminH(),
    params,
  });
  return res.data;
};

// Get single order (admin)
export const adminGetOrderById = async (id) => {
  const res = await axios.get(`${BASE}/orders/admin/${id}`, {
    headers: adminH(),
  });
  return res.data;
};

// Update order status
export const updateOrderStatus = async (id, status, note = "") => {
  const res = await axios.put(
    `${BASE}/orders/admin/${id}/status`,
    { status, note },
    { headers: adminH() }
  );
  return res.data;
};

// Update payment status
export const updatePaymentStatus = async (id, paymentData) => {
  const res = await axios.put(
    `${BASE}/orders/admin/${id}/payment`,
    paymentData,
    { headers: adminH() }
  );
  return res.data;
};

// Assign order to admin
export const assignOrder = async (id, adminId = null) => {
  const res = await axios.put(
    `${BASE}/orders/admin/${id}/assign`,
    { adminId },
    { headers: adminH() }
  );
  return res.data;
};

// Delete order
export const deleteOrder = async (id) => {
  const res = await axios.delete(`${BASE}/orders/admin/${id}`, {
    headers: adminH(),
  });
  return res.data;
};
