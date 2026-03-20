const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

// ═══════════════════════════════════════════════════════════
//                      USER SCHEMA
// ═══════════════════════════════════════════════════════════

const userSchema = new mongoose.Schema(
  {
    // ── Basic Info
    name: {
      type     : String,
      required : [true, "Name is required"],
      trim     : true,
      minlength: [2,  "Name must be at least 2 characters"],
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

    phone: {
      type  : String,
      trim  : true,
      match : [/^(\+88)?01[3-9]\d{8}$/, "Please enter a valid BD phone number"],
      default: "",
    },

    password: {
      type     : String,
      required : [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select   : false, // Password by default fetch হবে না
    },

    // ── Profile
    avatar: {
      url      : { type: String, default: "" },
      publicId : { type: String, default: "" }, // Cloudinary public ID
    },

    bio: {
      type     : String,
      maxlength: [200, "Bio cannot exceed 200 characters"],
      default  : "",
    },

    // ── Role
    role: {
      type   : String,
      enum   : ["user", "admin"],
      default: "user",
    },

    // ── Account Status
    isVerified: {
      type   : Boolean,
      default: false,
    },

    isActive: {
      type   : Boolean,
      default: true,
    },

    // ── Password Reset
    resetPasswordToken  : { type: String,   select: false },
    resetPasswordExpire : { type: Date,     select: false },

    // ── Last Login
    lastLogin: {
      type   : Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto
    versionKey: false,
  }
);

// ─────────────────────────────────────────
//   Pre-save: Hash Password
// ─────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt    = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─────────────────────────────────────────
//   Method: Compare Password
// ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─────────────────────────────────────────
//   Method: Get Public Profile
// ─────────────────────────────────────────
userSchema.methods.getPublicProfile = function () {
  return {
    _id      : this._id,
    name     : this.name,
    email    : this.email,
    phone    : this.phone,
    avatar   : this.avatar,
    bio      : this.bio,
    role     : this.role,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

// ─────────────────────────────────────────
//   Index
// ─────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
