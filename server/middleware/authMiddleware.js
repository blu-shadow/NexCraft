// ═══════════════════════════════════════════════════════════
//                   AUTH MIDDLEWARE
//         JWT Verify — User & Admin Protection
// ═══════════════════════════════════════════════════════════
const jwt   = require("jsonwebtoken");
const User  = require("../models/User.model");
const Admin = require("../models/Admin.model");

// ─────────────────────────────────────────
//   Helper: Extract Token from Header
// ─────────────────────────────────────────
const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  // Cookie fallback (optional)
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  return null;
};

// ═══════════════════════════════════════════════════════════
//   protect — Logged-in User Only
// ═══════════════════════════════════════════════════════════
const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "❌ Access denied. No token provided. Please login.",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "❌ Session expired. Please login again.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "❌ Invalid token. Please login again.",
      });
    }

    // Must be a user token (not admin)
    if (decoded.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "❌ Access denied. This route is for users only.",
      });
    }

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "❌ User no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "❌ Your account has been suspended. Contact support.",
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error(`\x1b[31m[Auth Middleware Error]: ${error.message}\x1b[0m`);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

// ═══════════════════════════════════════════════════════════
//   adminProtect — Admin Only
// ═══════════════════════════════════════════════════════════
const adminProtect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "❌ Admin access denied. No token provided.",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "❌ Admin session expired. Please login again.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "❌ Invalid admin token.",
      });
    }

    // Must be admin role
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "❌ Access denied. Admin privileges required.",
      });
    }

    // Find admin
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "❌ Admin account no longer exists.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "❌ Admin account is deactivated.",
      });
    }

    req.admin = admin;
    next();

  } catch (error) {
    console.error(`\x1b[31m[Admin Auth Middleware Error]: ${error.message}\x1b[0m`);
    res.status(500).json({
      success: false,
      message: "Internal server error during admin authentication.",
    });
  }
};

// ═══════════════════════════════════════════════════════════
//   superAdminProtect — Super Admin Only
// ═══════════════════════════════════════════════════════════
const superAdminProtect = async (req, res, next) => {
  // First run adminProtect
  await adminProtect(req, res, async () => {
    if (!req.admin?.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "❌ Access denied. Super Admin privileges required.",
      });
    }
    next();
  });
};

// ═══════════════════════════════════════════════════════════
//   optionalAuth — Attach user if token exists (no error if not)
//   Use for routes that work both for guests and logged-in users
// ═══════════════════════════════════════════════════════════
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) return next(); // Guest — continue without user

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "user") {
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    }

    if (decoded.role === "admin") {
      const admin = await Admin.findById(decoded.id);
      if (admin && admin.isActive) req.admin = admin;
    }

    next();
  } catch {
    next(); // Token invalid — treat as guest
  }
};

// ═══════════════════════════════════════════════════════════
//   checkPermission — Check specific admin permission
//   Usage: checkPermission("manageBlog")
// ═══════════════════════════════════════════════════════════
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "❌ Admin not authenticated.",
      });
    }

    // Super admin has all permissions
    if (req.admin.isSuperAdmin) return next();

    if (!req.admin.permissions?.[permission]) {
      return res.status(403).json({
        success: false,
        message: `❌ You don't have permission to perform this action. Required: "${permission}"`,
      });
    }

    next();
  };
};

// ═══════════════════════════════════════════════════════════

module.exports = {
  protect,
  adminProtect,
  superAdminProtect,
  optionalAuth,
  checkPermission,
};
