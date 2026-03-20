// ═══════════════════════════════════════════════════════════
//                    USER ROUTES
// ═══════════════════════════════════════════════════════════
const express = require("express");
const router  = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  deleteAvatar,
  getMyOrders,
  deleteMyAccount,
} = require("../controllers/user.controller");

const { protect }                    = require("../middleware/authMiddleware");
const { uploadAvatar: uploadAvatarMiddleware } = require("../config/cloudinary");

// ─────────────────────────────────────────
//   All routes are PRIVATE (must login)
// ─────────────────────────────────────────
router.use(protect);

// @route   GET  /api/users/profile
// @desc    Get my full profile
// @access  Private
router.get("/profile", getMyProfile);

// @route   PUT  /api/users/profile
// @desc    Update name, phone, bio
// @access  Private
router.put("/profile", updateMyProfile);

// @route   PUT  /api/users/avatar
// @desc    Upload / change profile picture
// @access  Private
router.put(
  "/avatar",
  uploadAvatarMiddleware.single("avatar"),
  uploadAvatar
);

// @route   DELETE /api/users/avatar
// @desc    Remove profile picture
// @access  Private
router.delete("/avatar", deleteAvatar);

// @route   GET  /api/users/my-orders
// @desc    Get all orders placed by me
// @access  Private
router.get("/my-orders", getMyOrders);

// @route   DELETE /api/users/account
// @desc    Delete my own account
// @access  Private
router.delete("/account", deleteMyAccount);

module.exports = router;
