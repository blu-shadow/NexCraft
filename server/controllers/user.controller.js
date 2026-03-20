// ═══════════════════════════════════════════════════════════
//                   USER CONTROLLER
// ═══════════════════════════════════════════════════════════
const asyncHandler           = require("express-async-handler");
const User                   = require("../models/User.model");
const Order                  = require("../models/Order.model");
const { deleteFromCloudinary } = require("../config/cloudinary");

// ═══════════════════════════════════════════════════════════

// @desc    Get my full profile
// @route   GET /api/users/profile
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    user   : user.getPublicProfile(),
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update profile (name, phone, bio)
// @route   PUT /api/users/profile
// @access  Private
const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, phone, bio } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (name)  user.name  = name.trim();
  if (phone) user.phone = phone.trim();
  if (bio !== undefined) user.bio = bio.trim();

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user   : user.getPublicProfile(),
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Upload / change avatar
// @route   PUT /api/users/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload an image file");
  }

  const user = await User.findById(req.user.id);

  // Delete old avatar from Cloudinary
  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId, "image");
  }

  user.avatar = {
    url      : req.file.path,
    publicId : req.file.filename,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "Avatar updated successfully",
    avatar : user.avatar,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Delete avatar
// @route   DELETE /api/users/avatar
// @access  Private
const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user.avatar?.publicId) {
    res.status(400);
    throw new Error("No avatar to delete");
  }

  await deleteFromCloudinary(user.avatar.publicId, "image");

  user.avatar = { url: "", publicId: "" };
  await user.save();

  res.status(200).json({
    success: true,
    message: "Avatar removed successfully",
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get my orders
// @route   GET /api/users/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const filter = { user: req.user.id };
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

// @desc    Delete my account
// @route   DELETE /api/users/account
// @access  Private
const deleteMyAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error("Please confirm with your password");
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Incorrect password");
  }

  // Delete avatar from Cloudinary
  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId, "image");
  }

  await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});

// ═══════════════════════════════════════════════════════════

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  deleteAvatar,
  getMyOrders,
  deleteMyAccount,
};
