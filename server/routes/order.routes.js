// ═══════════════════════════════════════════════════════════
//                   ORDER ROUTES
// ═══════════════════════════════════════════════════════════
const express = require("express");
const router  = express.Router();

const {
  placeOrder,
  getMyOrders,
  getSingleOrder,
  cancelOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  assignOrder,
  deleteOrder,
  getOrderStats,
} = require("../controllers/order.controller");

const { protect, adminProtect } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────
//   PUBLIC ROUTES
// ─────────────────────────────────────────

// @route   POST /api/orders
// @desc    Place a new service order (guest or logged-in)
// @access  Public
router.post("/", placeOrder);

// ─────────────────────────────────────────
//   USER ROUTES (Must Login)
// ─────────────────────────────────────────

// @route   GET /api/orders/my
// @desc    Get all orders by logged in user
// @access  Private (User)
router.get("/my", protect, getMyOrders);

// @route   GET /api/orders/my/:id
// @desc    Get single order detail (own order only)
// @access  Private (User)
router.get("/my/:id", protect, getSingleOrder);

// @route   PATCH /api/orders/my/:id/cancel
// @desc    Cancel own order (only if pending)
// @access  Private (User)
router.patch("/my/:id/cancel", protect, cancelOrder);

// ─────────────────────────────────────────
//   ADMIN ROUTES
// ─────────────────────────────────────────

// @route   GET /api/orders/admin/stats
// @desc    Get order stats (total, pending, completed, revenue)
// @access  Admin
router.get("/admin/stats", adminProtect, getOrderStats);

// @route   GET /api/orders/admin
// @desc    Get all orders (with filter, search, pagination)
// @access  Admin
router.get("/admin", adminProtect, getAllOrders);

// @route   GET /api/orders/admin/:id
// @desc    Get any single order detail
// @access  Admin
router.get("/admin/:id", adminProtect, getOrderById);

// @route   PUT /api/orders/admin/:id/status
// @desc    Update order status (confirm, in-progress, complete, etc.)
// @access  Admin
router.put("/admin/:id/status", adminProtect, updateOrderStatus);

// @route   PUT /api/orders/admin/:id/payment
// @desc    Update payment status
// @access  Admin
router.put("/admin/:id/payment", adminProtect, updatePaymentStatus);

// @route   PUT /api/orders/admin/:id/assign
// @desc    Assign order to an admin
// @access  Admin
router.put("/admin/:id/assign", adminProtect, assignOrder);

// @route   DELETE /api/orders/admin/:id
// @desc    Delete an order
// @access  Admin
router.delete("/admin/:id", adminProtect, deleteOrder);

module.exports = router;
