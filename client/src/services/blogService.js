// ═══════════════════════════════════════════════════════════
//                   BLOG SERVICE
// ═══════════════════════════════════════════════════════════
import axios from "axios";

const BASE    = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const authH   = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const adminH  = () => ({ Authorization: `Bearer ${localStorage.getItem("adminToken")}` });

// ─────────────────────────────────────────
//   PUBLIC
// ─────────────────────────────────────────

// Get all blogs — supports page, limit, category, tag, search, sort
export const getAllBlogs = async (params = {}) => {
  const res = await axios.get(`${BASE}/blogs`, { params });
  return res.data;
};

// Get featured blogs
export const getFeaturedBlogs = async (limit = 6) => {
  const res = await axios.get(`${BASE}/blogs/featured`, { params: { limit } });
  return res.data;
};

// Get single blog by slug
export const getBlogBySlug = async (slug) => {
  const res = await axios.get(`${BASE}/blogs/${slug}`);
  return res.data;
};

// Get blogs by category
export const getBlogsByCategory = async (category, params = {}) => {
  const res = await axios.get(`${BASE}/blogs/category/${category}`, { params });
  return res.data;
};

// ─────────────────────────────────────────
//   USER
// ─────────────────────────────────────────

// Add comment
export const addComment = async (blogId, text) => {
  const res = await axios.post(
    `${BASE}/blogs/${blogId}/comments`,
    { text },
    { headers: authH() }
  );
  return res.data;
};

// Delete comment
export const deleteComment = async (blogId, commentId) => {
  const res = await axios.delete(
    `${BASE}/blogs/${blogId}/comments/${commentId}`,
    { headers: authH() }
  );
  return res.data;
};

// Toggle like
export const toggleLike = async (blogId) => {
  const res = await axios.put(
    `${BASE}/blogs/${blogId}/like`,
    {},
    { headers: authH() }
  );
  return res.data;
};

// ─────────────────────────────────────────
//   ADMIN
// ─────────────────────────────────────────

// Get all blogs (admin — includes drafts)
export const adminGetAllBlogs = async (params = {}) => {
  const res = await axios.get(`${BASE}/blogs`, {
    params,
    headers: adminH(),
  });
  return res.data;
};

// Create blog
export const createBlog = async (formData) => {
  const res = await axios.post(`${BASE}/blogs`, formData, {
    headers: { ...adminH(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update blog
export const updateBlog = async (id, formData) => {
  const res = await axios.put(`${BASE}/blogs/${id}`, formData, {
    headers: { ...adminH(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete blog
export const deleteBlog = async (id) => {
  const res = await axios.delete(`${BASE}/blogs/${id}`, {
    headers: adminH(),
  });
  return res.data;
};

// Upload blog video
export const uploadBlogVideo = async (blogId, formData, onProgress) => {
  const res = await axios.post(`${BASE}/blogs/${blogId}/video`, formData, {
    headers       : { ...adminH(), "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded / e.total) * 100))
      : undefined,
  });
  return res.data;
};

// Delete blog video
export const deleteBlogVideo = async (blogId) => {
  const res = await axios.delete(`${BASE}/blogs/${blogId}/video`, {
    headers: adminH(),
  });
  return res.data;
};
