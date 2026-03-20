// ═══════════════════════════════════════════════════════════
//                  ORDER CONTROLLER
// ═══════════════════════════════════════════════════════════
const asyncHandler = require("express-async-handler");
const Order        = require("../models/Order.model");
const Service      = require("../models/Service.model");

// ═══════════════════════════════════════════════════════════

// @desc    Place a new order
// @route   POST /api/orders
// @access  Public (Guest or Logged-in User)
const placeOrder = asyncHandler(async (req, res) => {
  const {
    serviceId,
    name,
    email,
    phone,
    address,
    requirements,
    budgetAmount,
    deadline,
  } = req.body;

  if (!serviceId || !name || !email || !phone || !requirements) {
    res.status(400);
    throw new Error("Service, name, email, phone and requirements are required");
  }

  const service = await Service.findOne({ _id: serviceId, isActive: true });
  if (!service) {
    res.status(404);
    throw new Error("Service not found or unavailable");
  }

  const order = await Order.create({
    service     : serviceId,
    user        : req.user?._id || null,
    customerInfo: { name, email, phone, address: address || "" },
    requirements,
    budget      : { amount: budgetAmount || 0, currency: "BDT" },
    deadline    : deadline ? new Date(deadline) : null,
  });

  // Increment service order count
  service.totalOrders += 1;
  await service.save({ validateBeforeSave: false });

  const populatedOrder = await Order.findById(order._id).populate("service", "title icon category");

  res.status(201).json({
    success: true,
    message: "Order placed successfully! We will contact you soon.",
    order  : populatedOrder,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get logged in user's orders
// @route   GET /api/orders/my
// @access  Private (User)
const getMyOrders = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("service", "title icon category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success   : true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    orders,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get single order (own order)
// @route   GET /api/orders/my/:id
// @access  Private (User)
const getSingleOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id : req.params.id,
    user: req.user._id,
  }).populate("service", "title icon category shortDescription");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.status(200).json({ success: true, order });
});

// ═══════════════════════════════════════════════════════════

// @desc    Cancel own order (only if pending)
// @route   PATCH /api/orders/my/:id/cancel
// @access  Private (User)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id : req.params.id,
    user: req.user._id,
  });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.status !== "pending") {
    res.status(400);
    throw new Error("Only pending orders can be cancelled");
  }

  await order.updateStatus("cancelled", "Cancelled by user");

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
  });
});

// ═══════════════════════════════════════════════════════════
//   ADMIN CONTROLLERS
// ═══════════════════════════════════════════════════════════

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page     = parseInt(req.query.page)  || 1;
  const limit    = parseInt(req.query.limit) || 15;
  const skip     = (page - 1) * limit;

  const filter = {};
  if (req.query.status)   filter.status   = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.service)  filter.service  = req.query.service;
  if (req.query.payment)  filter["payment.status"] = req.query.payment;

  if (req.query.search) {
    filter.$or = [
      { orderId                : { $regex: req.query.search, $options: "i" } },
      { "customerInfo.name"    : { $regex: req.query.search, $options: "i" } },
      { "customerInfo.email"   : { $regex: req.query.search, $options: "i" } },
      { "customerInfo.phone"   : { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate)   filter.createdAt.$lte = new Date(req.query.endDate);
  }

  const sortField = req.query.sortBy || "createdAt";
  const sortOrder = req.query.order  === "asc" ? 1 : -1;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("service",    "title icon category")
      .populate("user",       "name email avatar")
      .populate("assignedTo", "name email")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success   : true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    orders,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get single order detail (Admin)
// @route   GET /api/orders/admin/:id
// @access  Admin
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("service",                  "title icon category shortDescription pricing")
    .populate("user",                     "name email phone avatar")
    .populate("assignedTo",               "name email avatar")
    .populate("statusHistory.changedBy",  "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.status(200).json({ success: true, order });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update order status
// @route   PUT /api/orders/admin/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const validStatuses = ["pending", "confirmed", "in-progress", "review", "completed", "cancelled"];
  if (!status || !validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  await order.updateStatus(status, note || "", req.admin._id);

  res.status(200).json({
    success: true,
    message: `Order status updated to "${status}"`,
    order,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update payment status
// @route   PUT /api/orders/admin/:id/payment
// @access  Admin
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status, method, amount, transactionId } = req.body;

  const validStatuses = ["unpaid", "partial", "paid"];
  if (!status || !validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid payment status. Must be: ${validStatuses.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.payment.status        = status;
  if (method)        order.payment.method        = method;
  if (amount)        order.payment.amount        = parseFloat(amount);
  if (transactionId) order.payment.transactionId = transactionId;
  if (status === "paid") order.payment.paidAt    = new Date();

  await order.save();

  res.status(200).json({
    success: true,
    message: "Payment status updated",
    payment: order.payment,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Assign order to an admin
// @route   PUT /api/orders/admin/:id/assign
// @access  Admin
const assignOrder = asyncHandler(async (req, res) => {
  const { adminId } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.assignedTo = adminId || req.admin._id;
  await order.save();

  const updated = await Order.findById(req.params.id).populate("assignedTo", "name email avatar");

  res.status(200).json({
    success   : true,
    message   : "Order assigned successfully",
    assignedTo: updated.assignedTo,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Delete order
// @route   DELETE /api/orders/admin/:id
// @access  Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  await Order.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get order stats for dashboard
// @route   GET /api/orders/admin/stats
// @access  Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const [
    totalOrders,
    pendingOrders,
    confirmedOrders,
    inProgressOrders,
    completedOrders,
    cancelledOrders,
    paidOrders,
    revenueData,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: "pending"     }),
    Order.countDocuments({ status: "confirmed"   }),
    Order.countDocuments({ status: "in-progress" }),
    Order.countDocuments({ status: "completed"   }),
    Order.countDocuments({ status: "cancelled"   }),
    Order.countDocuments({ "payment.status": "paid" }),
    Order.aggregate([
      { $match: { "payment.status": "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$payment.amount" } } },
    ]),
    Order.find()
      .populate("service", "title icon")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderId customerInfo status payment createdAt"),
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  res.status(200).json({
    success: true,
    stats  : {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
      paidOrders,
      totalRevenue,
    },
    recentOrders,
  });
});

// ═══════════════════════════════════════════════════════════

module.exports = {
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
};
