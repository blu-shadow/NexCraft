const mongoose = require("mongoose");

// ═══════════════════════════════════════════════════════════
//                    SERVICE SCHEMA
// ═══════════════════════════════════════════════════════════

const serviceSchema = new mongoose.Schema(
  {
    // ── Service Info
    title: {
      type     : String,
      required : [true, "Service title is required"],
      trim     : true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    slug: {
      type     : String,
      unique   : true,
      lowercase: true,
    },

    shortDescription: {
      type     : String,
      required : [true, "Short description is required"],
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },

    fullDescription: {
      type    : String,
      required: [true, "Full description is required"],
    },

    // ── Icon & Image
    icon: {
      type   : String, // emoji or icon class
      default: "🛠️",
    },

    image: {
      url      : { type: String, default: "" },
      publicId : { type: String, default: "" },
    },

    // ── Category
    category: {
      type   : String,
      required: [true, "Category is required"],
      enum   : [
        "web-design",
        "web-development",
        "web-app",
        "game-development",
        "app-development",
        "motherboard-repair",
        "chip-level-repair",
        "other",
      ],
    },

    // ── Pricing
    pricing: {
      type: {
        type    : String,
        enum    : ["fixed", "range", "negotiable", "free"],
        default : "negotiable",
      },
      minPrice  : { type: Number, default: 0    },
      maxPrice  : { type: Number, default: 0    },
      currency  : { type: String, default: "BDT"},
      unit      : { type: String, default: ""   }, // "per project", "per hour"
    },

    // ── Features List
    features: [
      {
        text     : { type: String, required: true },
        isIncluded: { type: Boolean, default: true },
      },
    ],

    // ── Delivery
    deliveryTime: {
      type   : String, // "3-5 days", "1 week"
      default: "",
    },

    // ── Status & Sort
    isActive: {
      type   : Boolean,
      default: true,
    },

    isFeatured: {
      type   : Boolean,
      default: false,
    },

    sortOrder: {
      type   : Number,
      default: 0,
    },

    // ── Stats
    totalOrders: {
      type   : Number,
      default: 0,
    },

    // ── Added By
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref : "Admin",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref : "Admin",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─────────────────────────────────────────
//   Pre-save: Auto Generate Slug
// ─────────────────────────────────────────
serviceSchema.pre("save", async function (next) {
  if (!this.isModified("title")) return next();

  let slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const existing = await mongoose.model("Service").findOne({ slug });
  if (existing && existing._id.toString() !== this._id.toString()) {
    slug = `${slug}-${Date.now()}`;
  }

  this.slug = slug;
  next();
});

// ─────────────────────────────────────────
//   Indexes
// ─────────────────────────────────────────
serviceSchema.index({ slug    : 1  });
serviceSchema.index({ category: 1  });
serviceSchema.index({ isActive: 1  });
serviceSchema.index({ sortOrder: 1 });

module.exports = mongoose.model("Service", serviceSchema);
