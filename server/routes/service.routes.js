// ═══════════════════════════════════════════════════════════
//                  SERVICE ROUTES
// ═══════════════════════════════════════════════════════════
const express = require("express");
const router  = express.Router();

const {
  getAllServices,
  getSingleService,
  getFeaturedServices,
  getServicesByCategory,
  createService,
  updateService,
  deleteService,
  reorderServices,
  toggleServiceStatus,
} = require("../controllers/service.controller");

const { adminProtect }   = require("../middleware/authMiddleware");
const { uploadBlogImage } = require("../config/cloudinary");

// ─────────────────────────────────────────
//   PUBLIC ROUTES
// ─────────────────────────────────────────

// @route   GET /api/services
// @desc    Get all active services
// @access  Public
router.get("/", getAllServices);

// @route   GET /api/services/featured
// @desc    Get featured services for Home page
// @access  Public
router.get("/featured", getFeaturedServices);

// @route   GET /api/services/category/:category
// @desc    Get services by category
// @access  Public
router.get("/category/:category", getServicesByCategory);

// @route   GET /api/services/:slug
// @desc    Get single service by slug
// @access  Public
router.get("/:slug", getSingleService);

// ─────────────────────────────────────────
//   ADMIN ROUTES
// ─────────────────────────────────────────

// @route   POST /api/services
// @desc    Create new service
// @access  Admin
router.post(
  "/",
  adminProtect,
  uploadBlogImage.single("image"),
  createService
);

// @route   PUT /api/services/:id
// @desc    Update service
// @access  Admin
router.put(
  "/:id",
  adminProtect,
  uploadBlogImage.single("image"),
  updateService
);

// @route   DELETE /api/services/:id
// @desc    Delete service
// @access  Admin
router.delete("/:id", adminProtect, deleteService);

// @route   PUT /api/services/reorder
// @desc    Reorder services (drag & drop)
// @access  Admin
router.put("/reorder", adminProtect, reorderServices);

// @route   PATCH /api/services/:id/toggle
// @desc    Toggle service active/inactive
// @access  Admin
router.patch("/:id/toggle", adminProtect, toggleServiceStatus);

module.exports = router;
