// ═══════════════════════════════════════════════════════════
//                   AUTH CONTROLLER
// ═══════════════════════════════════════════════════════════
const asyncHandler = require("express-async-handler");
const jwt          = require("jsonwebtoken");
const crypto       = require("crypto");
const User         = require("../models/User.model");
const Admin        = require("../models/Admin.model");

// ─────────────────────────────────────────
//   Helper: Generate JWT Token
// ─────────────────────────────────────────
const generateToken = (id, role = "user") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// ─────────────────────────────────────────
//   Helper: Send Token Response
// ─────────────────────────────────────────
const sendTokenResponse = (res, statusCode, user, role = "user") => {
  const token = generateToken(user._id, role);
  res.status(statusCode).json({
    success: true,
    token,
    user   : user.getPublicProfile ? user.getPublicProfile() : user,
  });
};

// ═══════════════════════════════════════════════════════════

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  // Duplicate check
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, phone, password });

  sendTokenResponse(res, 201, user);
});

// ═══════════════════════════════════════════════════════════

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  // select password explicitly (schema has select: false)
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Your account has been suspended. Contact support.");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(res, 200, user);
});

// ═══════════════════════════════════════════════════════════

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password");

  if (!admin || !(await admin.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid admin credentials");
  }

  if (!admin.isActive) {
    res.status(403);
    throw new Error("Admin account is deactivated");
  }

  // Log login info
  const ip     = req.ip || req.headers["x-forwarded-for"] || "";
  const device = req.headers["user-agent"] || "";
  await admin.logLogin(ip, device);

  const token = generateToken(admin._id, "admin");

  res.status(200).json({
    success: true,
    token,
    admin: {
      _id          : admin._id,
      name         : admin.name,
      email        : admin.email,
      avatar       : admin.avatar,
      permissions  : admin.permissions,
      isSuperAdmin : admin.isSuperAdmin,
      lastLogin    : admin.lastLogin,
    },
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
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

// @desc    Update password (logged in user)
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current password and new password are required");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(res, 200, user);
});

// ═══════════════════════════════════════════════════════════

// @desc    Forgot password — generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return success (security — don't reveal if email exists)
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If this email exists, a reset link has been sent",
    });
  }

  // Generate token
  const resetToken                = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken         = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire        = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  // TODO: Send email with reset link
  // const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  // await sendEmail({ to: user.email, subject: "Password Reset", resetUrl });

  console.log(`\x1b[33m[DEV] Reset Token: ${resetToken}\x1b[0m`);

  res.status(200).json({
    success: true,
    message: "Password reset link sent to email",
    // Only in development:
    ...(process.env.NODE_ENV === "development" && { resetToken }),
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Reset password with token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  // Hash incoming token to compare
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken  : hashedToken,
    resetPasswordExpire : { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  user.password            = newPassword;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(res, 200, user);
});

// ═══════════════════════════════════════════════════════════

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  // JWT is stateless — client clears token
  // If using cookies: res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// ═══════════════════════════════════════════════════════════

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  logoutUser,
};
