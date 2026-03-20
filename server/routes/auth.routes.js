// ═══════════════════════════════════════════════════════════
//                    AUTH ROUTES
// ═══════════════════════════════════════════════════════════
const express = require("express");
const router  = express.Router();

const {
  registerUser,
  loginUser,
  loginAdmin,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  logoutUser,
} = require("../controllers/auth.controller");

const { protect, adminProtect } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────
//   PUBLIC ROUTES
// ─────────────────────────────────────────

// @route   POST /api/auth/register
// @desc    New user register
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    User login → JWT token
// @access  Public
router.post("/login", loginUser);

// @route   POST /api/auth/admin/login
// @desc    Admin login → JWT token
// @access  Public
router.post("/admin/login", loginAdmin);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", forgotPassword);

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.put("/reset-password/:token", resetPassword);

// ─────────────────────────────────────────
//   PROTECTED ROUTES (User must be logged in)
// ─────────────────────────────────────────

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get("/me", protect, getMe);

// @route   PUT /api/auth/update-password
// @desc    Update own password
// @access  Private
router.put("/update-password", protect, updatePassword);

// @route   POST /api/auth/logout
// @desc    Logout user (clear cookie if used)
// @access  Private
router.post("/logout", protect, logoutUser);

module.exports = router;
