const cloudinary  = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ─────────────────────────────────────────
//   Cloudinary Configuration
// ─────────────────────────────────────────
cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key    : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
});

// ─────────────────────────────────────────
//   Storage: Avatar / Profile Pictures
// ─────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder        : "1000din/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  },
});

// ─────────────────────────────────────────
//   Storage: Blog Videos
// ─────────────────────────────────────────
const blogVideoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder         : "1000din/blog-videos",
    resource_type  : "video",
    allowed_formats: ["mp4", "mov", "avi", "mkv", "webm"],
  },
});

// ─────────────────────────────────────────
//   Storage: Blog Thumbnail Images
// ─────────────────────────────────────────
const blogImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder         : "1000din/blog-images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation : [{ width: 1280, height: 720, crop: "fill" }],
  },
});

// ─────────────────────────────────────────
//   Storage: Site Logo
// ─────────────────────────────────────────
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder         : "1000din/logos",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
  },
});

// ─────────────────────────────────────────
//   File Size Validator (Middleware)
// ─────────────────────────────────────────
const fileFilter = (allowedTypes) => (req, file, cb) => {
  const isAllowed = allowedTypes.some((type) =>
    file.mimetype.startsWith(type)
  );
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error(`❌ File type not allowed: ${file.mimetype}`), false);
  }
};

// ─────────────────────────────────────────
//   Multer Upload Instances
// ─────────────────────────────────────────

// Profile Avatar — max 5MB
const uploadAvatar = multer({
  storage : avatarStorage,
  limits  : { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(["image/"]),
});

// Blog Video — max 200MB
const uploadBlogVideo = multer({
  storage : blogVideoStorage,
  limits  : { fileSize: 200 * 1024 * 1024 },
  fileFilter: fileFilter(["video/"]),
});

// Blog Thumbnail — max 10MB
const uploadBlogImage = multer({
  storage : blogImageStorage,
  limits  : { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter(["image/"]),
});

// Site Logo — max 5MB
const uploadLogo = multer({
  storage : logoStorage,
  limits  : { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(["image/"]),
});

// ─────────────────────────────────────────
//   Delete File from Cloudinary
// ─────────────────────────────────────────
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error(`❌ Cloudinary delete error: ${error.message}`);
    throw error;
  }
};

// ─────────────────────────────────────────
//   Exports
// ─────────────────────────────────────────
module.exports = {
  cloudinary,
  uploadAvatar,
  uploadBlogVideo,
  uploadBlogImage,
  uploadLogo,
  deleteFromCloudinary,
};
