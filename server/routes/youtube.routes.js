// ═══════════════════════════════════════════════════════════
//                  YOUTUBE ROUTES
// ═══════════════════════════════════════════════════════════
const express = require("express");
const router  = express.Router();

const {
  getAllVideos,
  getSingleVideo,
  getFeaturedVideos,
  getVideosByCategory,
  addVideo,
  updateVideo,
  deleteVideo,
  reorderVideos,
  getChannelInfo,
  updateChannelInfo,
} = require("../controllers/youtube.controller");

const { adminProtect } = require("../middleware/authMiddleware");
const { uploadLogo }   = require("../config/cloudinary");

// ─────────────────────────────────────────
//   PUBLIC ROUTES
// ─────────────────────────────────────────

// @route   GET /api/youtube/channel
// @desc    Get channel info (name, banner, etc.)
// @access  Public
router.get("/channel", getChannelInfo);

// @route   GET /api/youtube/videos
// @desc    Get all published videos (pagination + filter)
// @access  Public
router.get("/videos", getAllVideos);

// @route   GET /api/youtube/videos/featured
// @desc    Get featured videos
// @access  Public
router.get("/videos/featured", getFeaturedVideos);

// @route   GET /api/youtube/videos/category/:category
// @desc    Get videos by category
// @access  Public
router.get("/videos/category/:category", getVideosByCategory);

// @route   GET /api/youtube/videos/:id
// @desc    Get single video by ID
// @access  Public
router.get("/videos/:id", getSingleVideo);

// ─────────────────────────────────────────
//   ADMIN ROUTES
// ─────────────────────────────────────────

// @route   POST /api/youtube/videos
// @desc    Add new YouTube video link
// @access  Admin
router.post("/videos", adminProtect, addVideo);

// @route   PUT /api/youtube/videos/:id
// @desc    Update video info
// @access  Admin
router.put("/videos/:id", adminProtect, updateVideo);

// @route   DELETE /api/youtube/videos/:id
// @desc    Delete video
// @access  Admin
router.delete("/videos/:id", adminProtect, deleteVideo);

// @route   PUT /api/youtube/videos/reorder
// @desc    Reorder videos (drag & drop sort)
// @access  Admin
router.put("/videos/reorder", adminProtect, reorderVideos);

// @route   PUT /api/youtube/channel
// @desc    Update channel info (name, handle, urls, logo, banner)
// @access  Admin
router.put(
  "/channel",
  adminProtect,
  uploadLogo.single("channelLogo"),
  updateChannelInfo
);

module.exports = router;
