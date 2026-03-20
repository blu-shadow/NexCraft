// ═══════════════════════════════════════════════════════════
//                  ADMIN CONTROLLER
// ═══════════════════════════════════════════════════════════
const asyncHandler             = require("express-async-handler");
const User                     = require("../models/User.model");
const Admin                    = require("../models/Admin.model");
const Blog                     = require("../models/Blog.model");
const Order                    = require("../models/Order.model");
const Service                  = require("../models/Service.model");
const { YoutubeVideo }         = require("../models/YoutubeVideo.model");
const SiteConfig               = require("../models/SiteConfig.model");
const { deleteFromCloudinary } = require("../config/cloudinary");

// ════════════════════════════════════════════════════════════
//   DASHBOARD
// ════════════════════════════════════════════════════════════

// @desc    Get full dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalBlogs,
    publishedBlogs,
    totalVideos,
    totalServices,
    revenueData,
    recentOrders,
    recentUsers,
    ordersByStatus,
  ] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ status: "pending"   }),
    Order.countDocuments({ status: "completed" }),
    Blog.countDocuments(),
    Blog.countDocuments({ status: "published"  }),
    YoutubeVideo.countDocuments({ isPublished: true }),
    Service.countDocuments({ isActive: true }),
    Order.aggregate([
      { $match: { "payment.status": "paid" } },
      { $group: { _id: null, total: { $sum: "$payment.amount" } } },
    ]),
    Order.find()
      .populate("service", "title icon")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderId customerInfo status payment createdAt"),
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email avatar createdAt"),
    Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      users: {
        total: totalUsers,
      },
      orders: {
        total    : totalOrders,
        pending  : pendingOrders,
        completed: completedOrders,
        byStatus : ordersByStatus,
      },
      blogs: {
        total    : totalBlogs,
        published: publishedBlogs,
      },
      videos  : { total: totalVideos   },
      services: { total: totalServices },
      revenue : { total: revenueData[0]?.total || 0, currency: "BDT" },
    },
    recentOrders,
    recentUsers,
  });
});

// ════════════════════════════════════════════════════════════
//   USER MANAGEMENT
// ════════════════════════════════════════════════════════════

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.query.status === "active")   filter.isActive = true;
  if (req.query.status === "inactive") filter.isActive = false;

  if (req.query.search) {
    filter.$or = [
      { name  : { $regex: req.query.search, $options: "i" } },
      { email : { $regex: req.query.search, $options: "i" } },
      { phone : { $regex: req.query.search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success   : true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    users,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const orderCount = await Order.countDocuments({ user: user._id });

  res.status(200).json({
    success: true,
    user   : { ...user.getPublicProfile(), orderCount },
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Block / Unblock user
// @route   PATCH /api/admin/users/:id/toggle
// @access  Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success  : true,
    message  : `User ${user.isActive ? "activated" : "blocked"} successfully`,
    isActive : user.isActive,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId, "image");
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// ════════════════════════════════════════════════════════════
//   ADMIN MANAGEMENT (Super Admin Only)
// ════════════════════════════════════════════════════════════

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Super Admin
const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    total  : admins.length,
    admins,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Create new admin
// @route   POST /api/admin/admins
// @access  Super Admin
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, permissions, isSuperAdmin } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const exists = await Admin.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error("Admin with this email already exists");
  }

  const adminData = {
    name,
    email,
    password,
    permissions  : permissions   ? JSON.parse(permissions)  : {},
    isSuperAdmin : isSuperAdmin  === "true",
  };

  if (req.file) {
    adminData.avatar = {
      url      : req.file.path,
      publicId : req.file.filename,
    };
  }

  const admin = await Admin.create(adminData);

  res.status(201).json({
    success: true,
    message: "Admin created successfully",
    admin  : {
      _id        : admin._id,
      name       : admin.name,
      email      : admin.email,
      avatar     : admin.avatar,
      permissions: admin.permissions,
      isSuperAdmin: admin.isSuperAdmin,
    },
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update admin
// @route   PUT /api/admin/admins/:id
// @access  Super Admin
const updateAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  const { name, email, permissions, isSuperAdmin } = req.body;

  if (name)        admin.name        = name;
  if (email)       admin.email       = email.toLowerCase();
  if (permissions) admin.permissions = { ...admin.permissions, ...JSON.parse(permissions) };
  if (isSuperAdmin !== undefined) admin.isSuperAdmin = isSuperAdmin === "true";

  if (req.file) {
    if (admin.avatar?.publicId) {
      await deleteFromCloudinary(admin.avatar.publicId, "image");
    }
    admin.avatar = {
      url      : req.file.path,
      publicId : req.file.filename,
    };
  }

  await admin.save();

  res.status(200).json({
    success: true,
    message: "Admin updated successfully",
    admin  : {
      _id        : admin._id,
      name       : admin.name,
      email      : admin.email,
      avatar     : admin.avatar,
      permissions: admin.permissions,
      isSuperAdmin: admin.isSuperAdmin,
    },
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Activate / Deactivate admin
// @route   PATCH /api/admin/admins/:id/toggle
// @access  Super Admin
const toggleAdminStatus = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  // Super admin cannot deactivate themselves
  if (admin._id.toString() === req.admin._id.toString()) {
    res.status(400);
    throw new Error("Cannot deactivate your own account");
  }

  admin.isActive = !admin.isActive;
  await admin.save({ validateBeforeSave: false });

  res.status(200).json({
    success : true,
    message : `Admin ${admin.isActive ? "activated" : "deactivated"} successfully`,
    isActive: admin.isActive,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Delete admin
// @route   DELETE /api/admin/admins/:id
// @access  Super Admin
const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  if (admin._id.toString() === req.admin._id.toString()) {
    res.status(400);
    throw new Error("Cannot delete your own account");
  }

  if (admin.avatar?.publicId) {
    await deleteFromCloudinary(admin.avatar.publicId, "image");
  }

  await Admin.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Admin deleted successfully",
  });
});

// ════════════════════════════════════════════════════════════
//   SITE CONFIG MANAGEMENT
// ════════════════════════════════════════════════════════════

// @desc    Get full site config
// @route   GET /api/admin/site-config
// @access  Admin
const getSiteConfig = asyncHandler(async (req, res) => {
  const config = await SiteConfig.getConfig();
  res.status(200).json({ success: true, config });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update branding (logo, name, colors)
// @route   PUT /api/admin/site-config/branding
// @access  Admin
const updateBranding = asyncHandler(async (req, res) => {
  const { siteName, tagline, primaryColor, secondaryColor } = req.body;
  const config = await SiteConfig.getConfig();

  if (siteName)       config.branding.siteName       = siteName;
  if (tagline)        config.branding.tagline        = tagline;
  if (primaryColor)   config.branding.primaryColor   = primaryColor;
  if (secondaryColor) config.branding.secondaryColor = secondaryColor;

  if (req.file) {
    if (config.branding.logo?.publicId) {
      await deleteFromCloudinary(config.branding.logo.publicId, "image");
    }
    config.branding.logo = {
      url      : req.file.path,
      publicId : req.file.filename,
    };
  }

  config.lastUpdatedBy = req.admin._id;
  await config.save();

  res.status(200).json({
    success : true,
    message : "Branding updated successfully",
    branding: config.branding,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update About page
// @route   PUT /api/admin/site-config/about
// @access  Admin
const updateAbout = asyncHandler(async (req, res) => {
  const config = await SiteConfig.getConfig();
  const { title, content, mission, vision, founderName, founderBio } = req.body;

  if (title)       config.about.title       = title;
  if (content)     config.about.content     = content;
  if (mission)     config.about.mission     = mission;
  if (vision)      config.about.vision      = vision;
  if (founderName) config.about.founderName = founderName;
  if (founderBio)  config.about.founderBio  = founderBio;

  config.lastUpdatedBy = req.admin._id;
  await config.save();

  res.status(200).json({
    success: true,
    message: "About page updated successfully",
    about  : config.about,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update Privacy Policy
// @route   PUT /api/admin/site-config/privacy
// @access  Admin
const updatePrivacy = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const config = await SiteConfig.getConfig();

  if (title)   config.privacy.title   = title;
  if (content) config.privacy.content = content;
  config.privacy.lastUpdated  = new Date();
  config.lastUpdatedBy        = req.admin._id;

  await config.save();

  res.status(200).json({
    success: true,
    message: "Privacy policy updated successfully",
    privacy: config.privacy,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update Contact Info
// @route   PUT /api/admin/site-config/contact
// @access  Admin
const updateContact = asyncHandler(async (req, res) => {
  const { email, phone, address, mapUrl } = req.body;
  const config = await SiteConfig.getConfig();

  if (email)   config.contact.email   = email;
  if (phone)   config.contact.phone   = phone;
  if (address) config.contact.address = address;
  if (mapUrl)  config.contact.mapUrl  = mapUrl;

  config.lastUpdatedBy = req.admin._id;
  await config.save();

  res.status(200).json({
    success : true,
    message : "Contact info updated successfully",
    contact : config.contact,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update Social Links
// @route   PUT /api/admin/site-config/social
// @access  Admin
const updateSocial = asyncHandler(async (req, res) => {
  const { facebook, youtube, instagram, twitter, linkedin, github } = req.body;
  const config = await SiteConfig.getConfig();

  if (facebook)  config.social.facebook  = facebook;
  if (youtube)   config.social.youtube   = youtube;
  if (instagram) config.social.instagram = instagram;
  if (twitter)   config.social.twitter   = twitter;
  if (linkedin)  config.social.linkedin  = linkedin;
  if (github)    config.social.github    = github;

  config.lastUpdatedBy = req.admin._id;
  await config.save();

  res.status(200).json({
    success: true,
    message: "Social links updated successfully",
    social : config.social,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update SEO settings
// @route   PUT /api/admin/site-config/seo
// @access  Admin
const updateSeo = asyncHandler(async (req, res) => {
  const { metaTitle, metaDescription, metaKeywords, ogImage } = req.body;
  const config = await SiteConfig.getConfig();

  if (metaTitle)       config.seo.metaTitle       = metaTitle;
  if (metaDescription) config.seo.metaDescription = metaDescription;
  if (metaKeywords)    config.seo.metaKeywords     = JSON.parse(metaKeywords);
  if (ogImage)         config.seo.ogImage          = ogImage;

  config.lastUpdatedBy = req.admin._id;
  await config.save();

  res.status(200).json({
    success: true,
    message: "SEO settings updated successfully",
    seo    : config.seo,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Add certificate
// @route   POST /api/admin/site-config/certificates
// @access  Admin
const addCertificate = asyncHandler(async (req, res) => {
  const { title, issuedBy, issuedDate, credentialUrl, description } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Certificate title is required");
  }

  const config = await SiteConfig.getConfig();

  config.certificates.push({
    title,
    issuedBy      : issuedBy       || "",
    issuedDate    : issuedDate     ? new Date(issuedDate) : null,
    credentialUrl : credentialUrl  || "",
    description   : description    || "",
  });

  config.lastUpdatedBy = req.admin._id;
  await config.save();

  res.status(201).json({
    success     : true,
    message     : "Certificate added successfully",
    certificates: config.certificates,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update certificate
// @route   PUT /api/admin/site-config/certificates/:certId
// @access  Admin
const updateCertificate = asyncHandler(async (req, res) => {
  const config = await SiteConfig.getConfig();
  const cert   = config.certificates.id(req.params.certId);

  if (!cert) {
    res.status(404);
    throw new Error("Certificate not found");
  }

  const { title, issuedBy, issuedDate, credentialUrl, description } = req.body;

  if (title)         cert.title         = title;
  if (issuedBy)      cert.issuedBy      = issuedBy;
  if (issuedDate)    cert.issuedDate    = new Date(issuedDate);
  if (credentialUrl) cert.credentialUrl = credentialUrl;
  if (description)   cert.description   = description;

  config.lastUpdatedBy = req.admin._id;
  await config.save();

  res.status(200).json({
    success     : true,
    message     : "Certificate updated successfully",
    certificates: config.certificates,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Delete certificate
// @route   DELETE /api/admin/site-config/certificates/:certId
// @access  Admin
const deleteCertificate = asyncHandler(async (req, res) => {
  const config = await SiteConfig.getConfig();
  const cert   = config.certificates.id(req.params.certId);

  if (!cert) {
    res.status(404);
    throw new Error("Certificate not found");
  }

  // Delete image from Cloudinary if exists
  if (cert.image?.publicId) {
    await deleteFromCloudinary(cert.image.publicId, "image");
  }

  cert.deleteOne();
  config.lastUpdatedBy = req.admin._id;
  await config.save();

  res.status(200).json({
    success     : true,
    message     : "Certificate deleted successfully",
    certificates: config.certificates,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Toggle maintenance mode
// @route   PATCH /api/admin/site-config/maintenance
// @access  Admin
const toggleMaintenance = asyncHandler(async (req, res) => {
  const config = await SiteConfig.getConfig();
  const { message } = req.body;

  config.maintenance.isEnabled = !config.maintenance.isEnabled;
  if (message) config.maintenance.message = message;

  config.lastUpdatedBy = req.admin._id;
  await config.save();

  res.status(200).json({
    success    : true,
    message    : `Maintenance mode ${config.maintenance.isEnabled ? "enabled" : "disabled"}`,
    maintenance: config.maintenance,
  });
});

// ═══════════════════════════════════════════════════════════

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  deleteUser,
  toggleUserStatus,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
  getSiteConfig,
  updateBranding,
  updateAbout,
  updatePrivacy,
  updateContact,
  updateSocial,
  updateSeo,
  addCertificate,
  updateCertificate,
  deleteCertificate,
  toggleMaintenance,
};
