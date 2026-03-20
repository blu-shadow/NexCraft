// ═══════════════════════════════════════════════════════════
//                   ADMIN ROUTES
// ═══════════════════════════════════════════════════════════
const express = require("express");
const router  = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  deleteUser,
  toggleUserStatus,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
  getSiteConfig,
  updateBranding,
  updateAbout,
  updatePrivacy,
  updateContact,
  updateSocial,
  updateSeo,
  addCertificate,
  updateCertificate,
  deleteCertificate,
  toggleMaintenance,
} = require("../controllers/admin.controller");

const { adminProtect, superAdminProtect } = require("../middleware/authMiddleware");
const { uploadLogo, uploadAvatar }        = require("../config/cloudinary");

// ─────────────────────────────────────────
//   All routes require Admin login
// ─────────────────────────────────────────
router.use(adminProtect);

// ════════════════════════════════════════
//   DASHBOARD
// ════════════════════════════════════════

// @route   GET /api/admin/dashboard
// @desc    Get all stats: users, orders, blogs, videos, revenue
// @access  Admin
router.get("/dashboard", getDashboardStats);

// ════════════════════════════════════════
//   USER MANAGEMENT
// ════════════════════════════════════════

// @route   GET /api/admin/users
// @desc    Get all registered users (search + pagination)
// @access  Admin
router.get("/users", getAllUsers);

// @route   GET /api/admin/users/:id
// @desc    Get single user detail
// @access  Admin
router.get("/users/:id", getUserById);

// @route   PATCH /api/admin/users/:id/toggle
// @desc    Block / Unblock a user
// @access  Admin
router.patch("/users/:id/toggle", toggleUserStatus);

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user account
// @access  Admin
router.delete("/users/:id", deleteUser);

// ════════════════════════════════════════
//   ADMIN MANAGEMENT (Super Admin Only)
// ════════════════════════════════════════

// @route   GET /api/admin/admins
// @desc    Get all admins
// @access  Super Admin
router.get("/admins", superAdminProtect, getAllAdmins);

// @route   POST /api/admin/admins
// @desc    Create new admin
// @access  Super Admin
router.post(
  "/admins",
  superAdminProtect,
  uploadAvatar.single("avatar"),
  createAdmin
);

// @route   PUT /api/admin/admins/:id
// @desc    Update admin info / permissions
// @access  Super Admin
router.put(
  "/admins/:id",
  superAdminProtect,
  uploadAvatar.single("avatar"),
  updateAdmin
);

// @route   PATCH /api/admin/admins/:id/toggle
// @desc    Activate / Deactivate admin
// @access  Super Admin
router.patch("/admins/:id/toggle", superAdminProtect, toggleAdminStatus);

// @route   DELETE /api/admin/admins/:id
// @desc    Delete admin account
// @access  Super Admin
router.delete("/admins/:id", superAdminProtect, deleteAdmin);

// ════════════════════════════════════════
//   SITE CONFIG
// ════════════════════════════════════════

// @route   GET /api/admin/site-config
// @desc    Get full site config
// @access  Admin
router.get("/site-config", getSiteConfig);

// @route   PUT /api/admin/site-config/branding
// @desc    Update site name, logo, colors
// @access  Admin
router.put(
  "/site-config/branding",
  uploadLogo.single("logo"),
  updateBranding
);

// @route   PUT /api/admin/site-config/about
// @desc    Update About page content
// @access  Admin
router.put("/site-config/about", updateAbout);

// @route   PUT /api/admin/site-config/privacy
// @desc    Update Privacy Policy
// @access  Admin
router.put("/site-config/privacy", updatePrivacy);

// @route   PUT /api/admin/site-config/contact
// @desc    Update Contact Info
// @access  Admin
router.put("/site-config/contact", updateContact);

// @route   PUT /api/admin/site-config/social
// @desc    Update Social Media Links
// @access  Admin
router.put("/site-config/social", updateSocial);

// @route   PUT /api/admin/site-config/seo
// @desc    Update SEO meta info
// @access  Admin
router.put("/site-config/seo", updateSeo);

// @route   POST /api/admin/site-config/certificates
// @desc    Add new certificate
// @access  Admin
router.post("/site-config/certificates", addCertificate);

// @route   PUT /api/admin/site-config/certificates/:certId
// @desc    Update a certificate
// @access  Admin
router.put("/site-config/certificates/:certId", updateCertificate);

// @route   DELETE /api/admin/site-config/certificates/:certId
// @desc    Delete a certificate
// @access  Admin
router.delete("/site-config/certificates/:certId", deleteCertificate);

// @route   PATCH /api/admin/site-config/maintenance
// @desc    Toggle maintenance mode on/off
// @access  Admin
router.patch("/site-config/maintenance", toggleMaintenance);

module.exports = router;
