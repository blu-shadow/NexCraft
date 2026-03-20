const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

// ═══════════════════════════════════════════════════════════
//                      ADMIN SCHEMA
// ═══════════════════════════════════════════════════════════

const adminSchema = new mongoose.Schema(
  {
    // ── Basic Info
    name: {
      type     : String,
      required : [true, "Admin name is required"],
      trim     : true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type     : String,
      required : [true, "Email is required"],
      unique   : true,
      lowercase: true,
      trim     : true,
      match    : [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type     : String,
      required : [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select   : false,
    },

    // ── Avatar
    avatar: {
      url      : { type: String, default: "" },
      publicId : { type: String, default: "" },
    },

    // ── Permissions (Fine-grained Control)
    permissions: {
      manageUsers    : { type: Boolean, default: true  },
      manageServices : { type: Boolean, default: true  },
      manageOrders   : { type: Boolean, default: true  },
      manageBlog     : { type: Boolean, default: true  },
      manageYoutube  : { type: Boolean, default: true  },
      manageSite     : { type: Boolean, default: true  },
      manageAdmins   : { type: Boolean, default: false }, // Super admin only
    },

    // ── Role
    isSuperAdmin: {
      type   : Boolean,
      default: false,
    },

    isActive: {
      type   : Boolean,
      default: true,
    },

    // ── Activity Log
    lastLogin: {
      type   : Date,
      default: null,
    },

    loginHistory: [
      {
        ip       : String,
        device   : String,
        loginAt  : { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─────────────────────────────────────────
//   Pre-save: Hash Password
// ─────────────────────────────────────────
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt    = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─────────────────────────────────────────
//   Method: Compare Password
// ─────────────────────────────────────────
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─────────────────────────────────────────
//   Method: Log Login
// ─────────────────────────────────────────
adminSchema.methods.logLogin = async function (ip = "", device = "") {
  this.lastLogin = new Date();
  this.loginHistory.push({ ip, device });

  // শুধু শেষ 10টা login history রাখবো
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  await this.save();
};

// ─────────────────────────────────────────
//   Index
// ─────────────────────────────────────────
adminSchema.index({ email: 1 });

module.exports = mongoose.model("Admin", adminSchema);
