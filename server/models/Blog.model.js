const mongoose = require("mongoose");

// ═══════════════════════════════════════════════════════════
//                      BLOG SCHEMA
// ═══════════════════════════════════════════════════════════

// ── Comment Sub-schema
const commentSchema = new mongoose.Schema(
  {
    user: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : "User",
      required: true,
    },
    name  : { type: String, required: true },
    avatar: { type: String, default: ""   },
    text  : {
      type     : String,
      required : [true, "Comment text is required"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, versionKey: false }
);

// ── Main Blog Schema
const blogSchema = new mongoose.Schema(
  {
    // ── Content
    title: {
      type     : String,
      required : [true, "Blog title is required"],
      trim     : true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    slug: {
      type  : String,
      unique: true,
      lowercase: true,
    },

    content: {
      type    : String,
      required: [true, "Blog content is required"],
    },

    excerpt: {
      type     : String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
      default  : "",
    },

    // ── Media
    thumbnail: {
      url      : { type: String, default: "" },
      publicId : { type: String, default: "" },
    },

    // Blog এ Video (Cloudinary upload)
    video: {
      url      : { type: String, default: "" },
      publicId : { type: String, default: "" },
      duration : { type: Number, default: 0  }, // seconds
    },

    // ── Category & Tags
    category: {
      type   : String,
      enum   : ["tutorial", "news", "update", "project", "tips", "other"],
      default: "other",
    },

    tags: [{ type: String, trim: true, lowercase: true }],

    // ── Author
    author: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : "Admin",
      required: true,
    },

    // ── Engagement
    views   : { type: Number, default: 0 },
    likes   : [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],

    // ── Status
    status: {
      type   : String,
      enum   : ["draft", "published", "archived"],
      default: "draft",
    },

    isFeatured: {
      type   : Boolean,
      default: false,
    },

    publishedAt: {
      type   : Date,
      default: null,
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
blogSchema.pre("save", async function (next) {
  if (!this.isModified("title")) return next();

  // Title থেকে slug বানাবে
  let slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  // Duplicate slug হলে number যোগ করবে
  const existing = await mongoose.model("Blog").findOne({ slug });
  if (existing && existing._id.toString() !== this._id.toString()) {
    slug = `${slug}-${Date.now()}`;
  }

  this.slug = slug;

  // Published হলে publishedAt set করবে
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// ─────────────────────────────────────────
//   Virtual: Like Count
// ─────────────────────────────────────────
blogSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

blogSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// ─────────────────────────────────────────
//   Method: Increment View
// ─────────────────────────────────────────
blogSchema.methods.incrementView = async function () {
  this.views += 1;
  await this.save();
};

// ─────────────────────────────────────────
//   Indexes
// ─────────────────────────────────────────
blogSchema.index({ slug     : 1         });
blogSchema.index({ status   : 1         });
blogSchema.index({ category : 1         });
blogSchema.index({ tags     : 1         });
blogSchema.index({ createdAt: -1        });
blogSchema.index({ views    : -1        });

module.exports = mongoose.model("Blog", blogSchema);
