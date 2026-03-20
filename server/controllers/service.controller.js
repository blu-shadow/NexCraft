// ═══════════════════════════════════════════════════════════
//                 SERVICE CONTROLLER
// ═══════════════════════════════════════════════════════════
const asyncHandler             = require("express-async-handler");
const Service                  = require("../models/Service.model");
const { deleteFromCloudinary } = require("../config/cloudinary");

// ═══════════════════════════════════════════════════════════

// @desc    Get all active services
// @route   GET /api/services
// @access  Public
const getAllServices = asyncHandler(async (req, res) => {
  const filter = { isActive: true };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    filter.$or = [
      { title           : { $regex: req.query.search, $options: "i" } },
      { shortDescription: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const services = await Service.find(filter)
    .select("-fullDescription")
    .sort({ sortOrder: 1, createdAt: -1 });

  res.status(200).json({
    success : true,
    total   : services.length,
    services,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get single service by slug
// @route   GET /api/services/:slug
// @access  Public
const getSingleService = asyncHandler(async (req, res) => {
  const service = await Service.findOne({
    slug    : req.params.slug,
    isActive: true,
  }).populate("createdBy", "name");

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  res.status(200).json({ success: true, service });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get featured services (for Home page)
// @route   GET /api/services/featured
// @access  Public
const getFeaturedServices = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;

  const services = await Service.find({ isActive: true, isFeatured: true })
    .select("-fullDescription")
    .sort({ sortOrder: 1 })
    .limit(limit);

  res.status(200).json({ success: true, services });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public
const getServicesByCategory = asyncHandler(async (req, res) => {
  const services = await Service.find({
    isActive: true,
    category: req.params.category,
  })
    .select("-fullDescription")
    .sort({ sortOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    total  : services.length,
    services,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Create service
// @route   POST /api/services
// @access  Admin
const createService = asyncHandler(async (req, res) => {
  const {
    title,
    shortDescription,
    fullDescription,
    category,
    icon,
    features,
    pricing,
    deliveryTime,
    isFeatured,
    sortOrder,
  } = req.body;

  if (!title || !shortDescription || !fullDescription || !category) {
    res.status(400);
    throw new Error("Title, short description, full description, and category are required");
  }

  const serviceData = {
    title,
    shortDescription,
    fullDescription,
    category,
    icon        : icon         || "🛠️",
    features    : features     ? JSON.parse(features)  : [],
    pricing     : pricing      ? JSON.parse(pricing)   : {},
    deliveryTime: deliveryTime || "",
    isFeatured  : isFeatured   === "true",
    sortOrder   : parseInt(sortOrder) || 0,
    createdBy   : req.admin._id,
  };

  if (req.file) {
    serviceData.image = {
      url      : req.file.path,
      publicId : req.file.filename,
    };
  }

  const service = await Service.create(serviceData);

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    service,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Admin
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  const {
    title,
    shortDescription,
    fullDescription,
    category,
    icon,
    features,
    pricing,
    deliveryTime,
    isFeatured,
    sortOrder,
  } = req.body;

  if (title)            service.title            = title;
  if (shortDescription) service.shortDescription = shortDescription;
  if (fullDescription)  service.fullDescription  = fullDescription;
  if (category)         service.category         = category;
  if (icon)             service.icon             = icon;
  if (features)         service.features         = JSON.parse(features);
  if (pricing)          service.pricing          = JSON.parse(pricing);
  if (deliveryTime)     service.deliveryTime     = deliveryTime;
  if (isFeatured !== undefined) service.isFeatured = isFeatured === "true";
  if (sortOrder  !== undefined) service.sortOrder  = parseInt(sortOrder);

  service.updatedBy = req.admin._id;

  if (req.file) {
    if (service.image?.publicId) {
      await deleteFromCloudinary(service.image.publicId, "image");
    }
    service.image = {
      url      : req.file.path,
      publicId : req.file.filename,
    };
  }

  await service.save();

  res.status(200).json({
    success: true,
    message: "Service updated successfully",
    service,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Admin
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  if (service.image?.publicId) {
    await deleteFromCloudinary(service.image.publicId, "image");
  }

  await Service.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Service deleted successfully",
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Reorder services
// @route   PUT /api/services/reorder
// @access  Admin
const reorderServices = asyncHandler(async (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    res.status(400);
    throw new Error("orderedIds must be an array");
  }

  const updates = orderedIds.map(({ id, sortOrder }) =>
    Service.findByIdAndUpdate(id, { sortOrder }, { new: true })
  );

  await Promise.all(updates);

  res.status(200).json({
    success: true,
    message: "Services reordered successfully",
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Toggle service active / inactive
// @route   PATCH /api/services/:id/toggle
// @access  Admin
const toggleServiceStatus = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  service.isActive  = !service.isActive;
  service.updatedBy = req.admin._id;
  await service.save();

  res.status(200).json({
    success : true,
    message : `Service ${service.isActive ? "activated" : "deactivated"} successfully`,
    isActive: service.isActive,
  });
});

// ═══════════════════════════════════════════════════════════

module.exports = {
  getAllServices,
  getSingleService,
  getFeaturedServices,
  getServicesByCategory,
  createService,
  updateService,
  deleteService,
  reorderServices,
  toggleServiceStatus,
};
