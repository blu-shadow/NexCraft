// ═══════════════════════════════════════════════════════════
//                    BLOG ROUTES
// ═══════════════════════════════════════════════════════════
const express = require("express");
const router  = express.Router();

const {
  getAllBlogs,
  getSingleBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogVideo,
  deleteBlogVideo,
  addComment,
  deleteComment,
  toggleLike,
  getFeaturedBlogs,
  getBlogsByCategory,
} = require("../controllers/blog.controller");

const { protect, adminProtect }       = require("../middleware/authMiddleware");
const {
  uploadBlogVideo  : uploadVideoMiddleware,
  uploadBlogImage  : uploadImageMiddleware,
} = require("../config/cloudinary");

// ─────────────────────────────────────────
//   PUBLIC ROUTES
// ─────────────────────────────────────────

// @route   GET /api/blogs
// @desc    Get all published blogs (with pagination, filter, search)
// @access  Public
router.get("/", getAllBlogs);

// @route   GET /api/blogs/featured
// @desc    Get featured blogs
// @access  Public
router.get("/featured", getFeaturedBlogs);

// @route   GET /api/blogs/category/:category
// @desc    Get blogs by category
// @access  Public
router.get("/category/:category", getBlogsByCategory);

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug (also increments view)
// @access  Public
router.get("/:slug", getSingleBlog);

// ─────────────────────────────────────────
//   USER ROUTES (Must Login)
// ─────────────────────────────────────────

// @route   POST /api/blogs/:id/comments
// @desc    Add a comment to a blog
// @access  Private (User)
router.post("/:id/comments", protect, addComment);

// @route   DELETE /api/blogs/:id/comments/:commentId
// @desc    Delete own comment
// @access  Private (User / Admin)
router.delete("/:id/comments/:commentId", protect, deleteComment);

// @route   PUT /api/blogs/:id/like
// @desc    Toggle like on a blog
// @access  Private (User)
router.put("/:id/like", protect, toggleLike);

// ─────────────────────────────────────────
//   ADMIN ROUTES
// ─────────────────────────────────────────

// @route   POST /api/blogs
// @desc    Create new blog (with optional thumbnail)
// @access  Admin
router.post(
  "/",
  adminProtect,
  uploadImageMiddleware.single("thumbnail"),
  createBlog
);

// @route   PUT /api/blogs/:id
// @desc    Update blog content / thumbnail
// @access  Admin
router.put(
  "/:id",
  adminProtect,
  uploadImageMiddleware.single("thumbnail"),
  updateBlog
);

// @route   DELETE /api/blogs/:id
// @desc    Delete blog
// @access  Admin
router.delete("/:id", adminProtect, deleteBlog);

// @route   POST /api/blogs/:id/video
// @desc    Upload video to a blog post
// @access  Admin
router.post(
  "/:id/video",
  adminProtect,
  uploadVideoMiddleware.single("video"),
  uploadBlogVideo
);

// @route   DELETE /api/blogs/:id/video
// @desc    Remove video from a blog post
// @access  Admin
router.delete("/:id/video", adminProtect, deleteBlogVideo);

module.exports = router;
