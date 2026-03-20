// ═══════════════════════════════════════════════════════════
//                 UPLOAD MIDDLEWARE
//    Multer — Local Storage (Development fallback)
// ═══════════════════════════════════════════════════════════
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// ─────────────────────────────────────────
//   Helper: Ensure directory exists
// ─────────────────────────────────────────
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// ─────────────────────────────────────────
//   Allowed File Types
// ─────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|webp|svg/;
const ALLOWED_VIDEO_TYPES = /mp4|mov|avi|mkv|webm/;
const ALLOWED_DOC_TYPES   = /pdf|doc|docx/;

// ─────────────────────────────────────────
//   File Filter Factory
// ─────────────────────────────────────────
const createFileFilter = (allowedTypes, label = "file") => {
  return (req, file, cb) => {
    const extName  = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    }

    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `❌ Invalid ${label} type. Allowed: ${allowedTypes}`
      )
    );
  };
};

// ═══════════════════════════════════════════════════════════
//   STORAGE ENGINES (Local — for Development)
// ═══════════════════════════════════════════════════════════

// ── Avatar Storage
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/avatars");
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `avatar-${req.user?._id || "guest"}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ── Blog Image / Thumbnail Storage
const blogImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/blog-images");
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `blog-img-${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ── Blog Video Storage
const blogVideoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/blog-videos");
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `blog-video-${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ── Logo Storage
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/logos");
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `logo-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ── Certificate Storage
const certificateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/certificates");
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `cert-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ═══════════════════════════════════════════════════════════
//   MULTER INSTANCES
// ═══════════════════════════════════════════════════════════

// ── Avatar Upload — max 5MB, images only
const uploadAvatar = multer({
  storage   : avatarStorage,
  limits    : { fileSize: 5 * 1024 * 1024 },
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES, "image"),
});

// ── Blog Thumbnail — max 10MB, images only
const uploadBlogImage = multer({
  storage   : blogImageStorage,
  limits    : { fileSize: 10 * 1024 * 1024 },
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES, "image"),
});

// ── Blog Video — max 200MB, videos only
const uploadBlogVideo = multer({
  storage   : blogVideoStorage,
  limits    : { fileSize: 200 * 1024 * 1024 },
  fileFilter: createFileFilter(ALLOWED_VIDEO_TYPES, "video"),
});

// ── Logo — max 5MB, images only
const uploadLogo = multer({
  storage   : logoStorage,
  limits    : { fileSize: 5 * 1024 * 1024 },
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES, "image"),
});

// ── Certificate Image — max 10MB, images only
const uploadCertificate = multer({
  storage   : certificateStorage,
  limits    : { fileSize: 10 * 1024 * 1024 },
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES, "image"),
});

// ═══════════════════════════════════════════════════════════
//   MULTER ERROR HANDLER MIDDLEWARE
//   Use after any upload middleware in routes
// ═══════════════════════════════════════════════════════════
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    const messages = {
      LIMIT_FILE_SIZE       : "❌ File too large. Please upload a smaller file.",
      LIMIT_FILE_COUNT      : "❌ Too many files uploaded at once.",
      LIMIT_UNEXPECTED_FILE : `❌ ${err.message}`,
      LIMIT_FIELD_KEY       : "❌ Field name too long.",
      LIMIT_FIELD_VALUE     : "❌ Field value too long.",
      LIMIT_PART_COUNT      : "❌ Too many fields in form.",
    };

    return res.status(400).json({
      success: false,
      message: messages[err.code] || `Upload error: ${err.message}`,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed.",
    });
  }

  next();
};

// ═══════════════════════════════════════════════════════════
//   Helper: Delete local file
// ═══════════════════════════════════════════════════════════
const deleteLocalFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`\x1b[33m[Upload] Deleted local file: ${filePath}\x1b[0m`);
    }
  } catch (err) {
    console.error(`\x1b[31m[Upload] Failed to delete file: ${err.message}\x1b[0m`);
  }
};

// ═══════════════════════════════════════════════════════════

module.exports = {
  uploadAvatar,
  uploadBlogImage,
  uploadBlogVideo,
  uploadLogo,
  uploadCertificate,
  handleUploadError,
  deleteLocalFile,
};
