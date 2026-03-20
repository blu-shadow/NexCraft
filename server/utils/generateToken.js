// ═══════════════════════════════════════════════════════════
//                   GENERATE TOKEN UTILITY
// ═══════════════════════════════════════════════════════════
const jwt    = require("jsonwebtoken");
const crypto = require("crypto");

// ─────────────────────────────────────────
//   Generate JWT Access Token
// ─────────────────────────────────────────
const generateAccessToken = (id, role = "user") => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// ─────────────────────────────────────────
//   Generate Short-lived Token (e.g. email verify)
// ─────────────────────────────────────────
const generateShortToken = (id, role = "user", expiresIn = "1h") => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// ─────────────────────────────────────────
//   Verify JWT Token
// ─────────────────────────────────────────
const verifyToken = (token) => {
  try {
    return { valid: true, decoded: jwt.verify(token, process.env.JWT_SECRET) };
  } catch (err) {
    return {
      valid  : false,
      expired: err.name === "TokenExpiredError",
      message: err.message,
    };
  }
};

// ─────────────────────────────────────────
//   Generate Crypto Random Token (Password Reset / Email Verify)
//   Returns: { rawToken, hashedToken }
//   Store hashedToken in DB, send rawToken to user
// ─────────────────────────────────────────
const generateCryptoToken = () => {
  const rawToken    = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { rawToken, hashedToken };
};

// ─────────────────────────────────────────
//   Hash a raw token (for comparison)
// ─────────────────────────────────────────
const hashToken = (rawToken) => {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
};

// ─────────────────────────────────────────
//   Generate OTP (4 or 6 digits)
// ─────────────────────────────────────────
const generateOTP = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

// ─────────────────────────────────────────
//   Send Token as Cookie + JSON Response
// ─────────────────────────────────────────
const sendTokenResponse = (res, statusCode, payload, token) => {
  const cookieOptions = {
    expires  : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly : true,
    secure   : process.env.NODE_ENV === "production",
    sameSite : "strict",
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      token,
      ...payload,
    });
};

// ═══════════════════════════════════════════════════════════

module.exports = {
  generateAccessToken,
  generateShortToken,
  verifyToken,
  generateCryptoToken,
  hashToken,
  generateOTP,
  sendTokenResponse,
};
