const mongoose = require("mongoose");

// ═══════════════════════════════════════════════════════════
//             SITE CONFIG SCHEMA
//   (Single Document — Admin থেকে সব কিছু Edit করবে)
// ═══════════════════════════════════════════════════════════

const siteConfigSchema = new mongoose.Schema(
  {
    // শুধু একটাই document থাকবে সবসময়
    singletonKey: {
      type   : String,
      default: "site_config",
      unique : true,
    },

    // ════════════════════════════════════
    //   BRANDING
    // ════════════════════════════════════
    branding: {
      siteName: {
        type   : String,
        default: "1000 Din",
        trim   : true,
      },
      tagline: {
        type   : String,
        default: "Building the future, one day at a time",
        trim   : true,
      },
      logo: {
        url      : { type: String, default: "" },
        publicId : { type: String, default: "" },
      },
      favicon: {
        url      : { type: String, default: "" },
        publicId : { type: String, default: "" },
      },
      primaryColor  : { type: String, default: "#4F46E5" },
      secondaryColor: { type: String, default: "#7C3AED" },
    },

    // ════════════════════════════════════
    //   ABOUT PAGE
    // ════════════════════════════════════
    about: {
      title: {
        type   : String,
        default: "আমাদের সম্পর্কে",
      },
      content: {
        type   : String,
        default: "",
      },
      mission: {
        type   : String,
        default: "",
      },
      vision: {
        type   : String,
        default: "",
      },
      founderName: {
        type   : String,
        default: "",
      },
      founderBio: {
        type   : String,
        default: "",
      },
      founderImage: {
        url      : { type: String, default: "" },
        publicId : { type: String, default: "" },
      },
      teamMembers: [
        {
          name    : { type: String },
          role    : { type: String },
          image   : { type: String, default: "" },
          facebook: { type: String, default: "" },
        },
      ],
    },

    // ════════════════════════════════════
    //   PRIVACY POLICY
    // ════════════════════════════════════
    privacy: {
      title  : { type: String, default: "Privacy Policy" },
      content: { type: String, default: "" },
      lastUpdated: { type: Date, default: Date.now },
    },

    // ════════════════════════════════════
    //   CERTIFICATES & ACHIEVEMENTS
    // ════════════════════════════════════
    certificates: [
      {
        title      : { type: String, required: true },
        issuedBy   : { type: String, default: ""   },
        issuedDate : { type: Date,   default: null  },
        image      : {
          url      : { type: String, default: "" },
          publicId : { type: String, default: "" },
        },
        credentialUrl: { type: String, default: "" },
        description  : { type: String, default: "" },
      },
    ],

    // ════════════════════════════════════
    //   CONTACT INFO
    // ════════════════════════════════════
    contact: {
      email  : { type: String, default: "" },
      phone  : { type: String, default: "" },
      address: { type: String, default: "" },
      mapUrl : { type: String, default: "" },
    },

    // ════════════════════════════════════
    //   SOCIAL LINKS
    // ════════════════════════════════════
    social: {
      facebook : { type: String, default: "" },
      youtube  : { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter  : { type: String, default: "" },
      linkedin : { type: String, default: "" },
      github   : { type: String, default: "" },
    },

    // ════════════════════════════════════
    //   THEME SETTINGS
    // ════════════════════════════════════
    theme: {
      defaultMode: {
        type   : String,
        enum   : ["light", "dark", "system"],
        default: "light",
      },
      allowUserTheme: {
        type   : Boolean,
        default: true,
      },
    },

    // ════════════════════════════════════
    //   SEO
    // ════════════════════════════════════
    seo: {
      metaTitle      : { type: String, default: "1000 Din — Web & Tech Services" },
      metaDescription: { type: String, default: "" },
      metaKeywords   : [{ type: String }],
      ogImage        : { type: String, default: "" },
    },

    // ════════════════════════════════════
    //   MAINTENANCE MODE
    // ════════════════════════════════════
    maintenance: {
      isEnabled: { type: Boolean, default: false },
      message  : { type: String, default: "We are under maintenance. Please check back soon!" },
    },

    // ── Last Updated By
    lastUpdatedBy: {
      type   : mongoose.Schema.Types.ObjectId,
      ref    : "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─────────────────────────────────────────
//   Static: Get or Create Config
//   (সবসময় একটাই document থাকবে)
// ─────────────────────────────────────────
siteConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne({ singletonKey: "site_config" });
  if (!config) {
    config = await this.create({ singletonKey: "site_config" });
  }
  return config;
};

module.exports = mongoose.model("SiteConfig", siteConfigSchema);
