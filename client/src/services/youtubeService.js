// ═══════════════════════════════════════════════════════════
//                 YOUTUBE SERVICE
// ═══════════════════════════════════════════════════════════
import axios from "axios";

const BASE   = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const adminH = () => ({ Authorization: `Bearer ${localStorage.getItem("adminToken")}` });

// ─────────────────────────────────────────
//   PUBLIC
// ─────────────────────────────────────────

// Get channel info
export const getChannelInfo = async () => {
  const res = await axios.get(`${BASE}/youtube/channel`);
  return res.data;
};

// Get all videos — supports page, limit, category, search
export const getAllVideos = async (params = {}) => {
  const res = await axios.get(`${BASE}/youtube/videos`, { params });
  return res.data;
};

// Get featured videos
export const getFeaturedVideos = async (limit = 6) => {
  const res = await axios.get(`${BASE}/youtube/videos/featured`, { params: { limit } });
  return res.data;
};

// Get single video
export const getVideoById = async (id) => {
  const res = await axios.get(`${BASE}/youtube/videos/${id}`);
  return res.data;
};

// Get by category
export const getVideosByCategory = async (category, params = {}) => {
  const res = await axios.get(`${BASE}/youtube/videos/category/${category}`, { params });
  return res.data;
};

// ─────────────────────────────────────────
//   ADMIN
// ─────────────────────────────────────────

// Add video link
export const addVideo = async (data) => {
  const res = await axios.post(`${BASE}/youtube/videos`, data, {
    headers: adminH(),
  });
  return res.data;
};

// Update video
export const updateVideo = async (id, data) => {
  const res = await axios.put(`${BASE}/youtube/videos/${id}`, data, {
    headers: adminH(),
  });
  return res.data;
};

// Delete video
export const deleteVideo = async (id) => {
  const res = await axios.delete(`${BASE}/youtube/videos/${id}`, {
    headers: adminH(),
  });
  return res.data;
};

// Reorder videos
export const reorderVideos = async (orderedIds) => {
  const res = await axios.put(
    `${BASE}/youtube/videos/reorder`,
    { orderedIds },
    { headers: adminH() }
  );
  return res.data;
};

// Update channel info
export const updateChannelInfo = async (formData) => {
  const res = await axios.put(`${BASE}/youtube/channel`, formData, {
    headers: { ...adminH(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
