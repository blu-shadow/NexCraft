const mongoose = require("mongoose");

// ═══════════════════════════════════════════════════════════
//            YOUTUBE VIDEO & CHANNEL SCHEMA
// ═══════════════════════════════════════════════════════════

// ── Single Video Schema
const youtubeVideoSchema = new mongoose.Schema(
  {
    // ── Video Info
    title: {
      type     : String,
      required : [true, "Video title is required"],
      trim     : true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type     : String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default  : "",
    },

    // ── YouTube Link থেকে Extract করা Data
    youtubeUrl: {
      type    : String,
      required: [true, "YouTube URL is required"],
      trim    : true,
    },

    videoId: {
      type    : String,
      required: true,
      unique  : true, // Duplicate video allow করবে না
    },

    // Auto-generated embed URL
    embedUrl: {
      type: String,
    },

    // Thumbnail (YouTube auto)
    thumbnailUrl: {
      type   : String,
      default: "",
    },

    // ── Category
    category: {
      type   : String,
      enum   : ["tutorial", "project", "tips", "review", "vlog", "other"],
      default: "other",
    },

    tags: [{ type: String, trim: true, lowercase: true }],

    // ── Status
    isPublished: {
      type   : Boolean,
      default: true,
    },

    isFeatured: {
      type   : Boolean,
      default: false,
    },

    // ── Order/Sort
    sortOrder: {
      type   : Number,
      default: 0,
    },

    // ── Added By
    addedBy: {
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
//   Pre-save: Extract Video ID & URLs
// ─────────────────────────────────────────
youtubeVideoSchema.pre("save", function (next) {
  if (!this.isModified("youtubeUrl")) return next();

  const url = this.youtubeUrl;
  let videoId = null;

  // Support different YouTube URL formats:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  // https://www.youtube.com/shorts/VIDEO_ID

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      videoId = match[1];
      break;
    }
  }

  if (!videoId) {
    return next(new Error("❌ Invalid YouTube URL format"));
  }

  this.videoId      = videoId;
  this.embedUrl     = `https://www.youtube.com/embed/${videoId}`;
  this.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  next();
});

// ─────────────────────────────────────────
//   Indexes
// ─────────────────────────────────────────
youtubeVideoSchema.index({ videoId   : 1  });
youtubeVideoSchema.index({ isPublished: 1 });
youtubeVideoSchema.index({ sortOrder : 1  });
youtubeVideoSchema.index({ createdAt : -1 });

// ═══════════════════════════════════════════════════════════
//            YOUTUBE CHANNEL INFO SCHEMA
//     (Single Document — Admin থেকে Edit করবে)
// ═══════════════════════════════════════════════════════════

const channelSchema = new mongoose.Schema(
  {
    // শুধু একটাই document থাকবে
    singletonKey: {
      type   : String,
      default: "channel",
      unique : true,
    },

    channelName: {
      type     : String,
      required : [true, "Channel name is required"],
      trim     : true,
      maxlength: [100, "Channel name cannot exceed 100 characters"],
      default  : "1000 Din",
    },

    channelUrl: {
      type   : String,
      trim   : true,
      default: "",
    },

    channelHandle: {
      type   : String, // @username
      trim   : true,
      default: "",
    },

    description: {
      type     : String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default  : "",
    },

    // Channel Banner Image
    bannerImage: {
      url      : { type: String, default: "" },
      publicId : { type: String, default: "" },
    },

    // Channel Logo/Avatar
    channelLogo: {
      url      : { type: String, default: "" },
      publicId : { type: String, default: "" },
    },

    subscriberCount: {
      type   : String, // "10K", "1.2M" format
      default: "",
    },

    // Subscribe Button URL
    subscribeUrl: {
      type   : String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const YoutubeVideo   = mongoose.model("YoutubeVideo", youtubeVideoSchema);
const YoutubeChannel = mongoose.model("YoutubeChannel", channelSchema);

module.exports = { YoutubeVideo, YoutubeChannel };
