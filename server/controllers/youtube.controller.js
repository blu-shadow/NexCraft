// ═══════════════════════════════════════════════════════════
//                 YOUTUBE CONTROLLER
// ═══════════════════════════════════════════════════════════
const asyncHandler             = require("express-async-handler");
const { YoutubeVideo, YoutubeChannel } = require("../models/YoutubeVideo.model");
const { deleteFromCloudinary } = require("../config/cloudinary");

// ═══════════════════════════════════════════════════════════

// @desc    Get all published videos
// @route   GET /api/youtube/videos
// @access  Public
const getAllVideos = asyncHandler(async (req, res) => {
  const page     = parseInt(req.query.page)  || 1;
  const limit    = parseInt(req.query.limit) || 12;
  const skip     = (page - 1) * limit;

  const filter = { isPublished: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    filter.$or = [
      { title      : { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
      { tags       : { $in: [req.query.search.toLowerCase()] } },
    ];
  }

  const [videos, total] = await Promise.all([
    YoutubeVideo.find(filter)
      .populate("addedBy", "name")
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    YoutubeVideo.countDocuments(filter),
  ]);

  res.status(200).json({
    success   : true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    videos,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get single video
// @route   GET /api/youtube/videos/:id
// @access  Public
const getSingleVideo = asyncHandler(async (req, res) => {
  const video = await YoutubeVideo.findOne({
    _id        : req.params.id,
    isPublished: true,
  });

  if (!video) {
    res.status(404);
    throw new Error("Video not found");
  }

  res.status(200).json({ success: true, video });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get featured videos
// @route   GET /api/youtube/videos/featured
// @access  Public
const getFeaturedVideos = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;

  const videos = await YoutubeVideo.find({ isPublished: true, isFeatured: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(limit);

  res.status(200).json({ success: true, videos });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get videos by category
// @route   GET /api/youtube/videos/category/:category
// @access  Public
const getVideosByCategory = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip  = (page - 1) * limit;

  const filter = { isPublished: true, category: req.params.category };

  const [videos, total] = await Promise.all([
    YoutubeVideo.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    YoutubeVideo.countDocuments(filter),
  ]);

  res.status(200).json({
    success   : true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    videos,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Add new YouTube video link
// @route   POST /api/youtube/videos
// @access  Admin
const addVideo = asyncHandler(async (req, res) => {
  const { title, description, youtubeUrl, category, tags, isFeatured, sortOrder } = req.body;

  if (!title || !youtubeUrl) {
    res.status(400);
    throw new Error("Title and YouTube URL are required");
  }

  // Duplicate URL check
  const urlPattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/;
  const match      = youtubeUrl.match(urlPattern);

  if (!match) {
    res.status(400);
    throw new Error("Invalid YouTube URL format");
  }

  const videoId = match[1];
  const exists  = await YoutubeVideo.findOne({ videoId });
  if (exists) {
    res.status(400);
    throw new Error("This YouTube video has already been added");
  }

  const video = await YoutubeVideo.create({
    title,
    description : description || "",
    youtubeUrl,
    category    : category   || "other",
    tags        : tags ? JSON.parse(tags) : [],
    isFeatured  : isFeatured === "true" || isFeatured === true,
    sortOrder   : sortOrder || 0,
    addedBy     : req.admin._id,
  });

  res.status(201).json({
    success: true,
    message: "Video added successfully",
    video,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update video
// @route   PUT /api/youtube/videos/:id
// @access  Admin
const updateVideo = asyncHandler(async (req, res) => {
  const video = await YoutubeVideo.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error("Video not found");
  }

  const { title, description, youtubeUrl, category, tags, isFeatured, isPublished, sortOrder } = req.body;

  if (title)                           video.title       = title;
  if (description !== undefined)       video.description = description;
  if (youtubeUrl)                      video.youtubeUrl  = youtubeUrl;
  if (category)                        video.category    = category;
  if (tags)                            video.tags        = JSON.parse(tags);
  if (isFeatured  !== undefined)       video.isFeatured  = isFeatured === "true" || isFeatured === true;
  if (isPublished !== undefined)       video.isPublished = isPublished === "true" || isPublished === true;
  if (sortOrder   !== undefined)       video.sortOrder   = parseInt(sortOrder);

  await video.save();

  res.status(200).json({
    success: true,
    message: "Video updated successfully",
    video,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Delete video
// @route   DELETE /api/youtube/videos/:id
// @access  Admin
const deleteVideo = asyncHandler(async (req, res) => {
  const video = await YoutubeVideo.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error("Video not found");
  }

  await YoutubeVideo.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Video deleted successfully",
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Reorder videos
// @route   PUT /api/youtube/videos/reorder
// @access  Admin
const reorderVideos = asyncHandler(async (req, res) => {
  const { orderedIds } = req.body; // Array of { id, sortOrder }

  if (!Array.isArray(orderedIds)) {
    res.status(400);
    throw new Error("orderedIds must be an array");
  }

  const updates = orderedIds.map(({ id, sortOrder }) =>
    YoutubeVideo.findByIdAndUpdate(id, { sortOrder }, { new: true })
  );

  await Promise.all(updates);

  res.status(200).json({
    success: true,
    message: "Videos reordered successfully",
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get channel info
// @route   GET /api/youtube/channel
// @access  Public
const getChannelInfo = asyncHandler(async (req, res) => {
  let channel = await YoutubeChannel.findOne({ singletonKey: "channel" });

  if (!channel) {
    channel = await YoutubeChannel.create({ singletonKey: "channel" });
  }

  res.status(200).json({ success: true, channel });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update channel info
// @route   PUT /api/youtube/channel
// @access  Admin
const updateChannelInfo = asyncHandler(async (req, res) => {
  const {
    channelName,
    channelUrl,
    channelHandle,
    description,
    subscriberCount,
    subscribeUrl,
  } = req.body;

  let channel = await YoutubeChannel.findOne({ singletonKey: "channel" });

  if (!channel) {
    channel = new YoutubeChannel({ singletonKey: "channel" });
  }

  if (channelName)      channel.channelName     = channelName;
  if (channelUrl)       channel.channelUrl      = channelUrl;
  if (channelHandle)    channel.channelHandle   = channelHandle;
  if (description)      channel.description     = description;
  if (subscriberCount)  channel.subscriberCount = subscriberCount;
  if (subscribeUrl)     channel.subscribeUrl    = subscribeUrl;

  // Channel logo upload
  if (req.file) {
    if (channel.channelLogo?.publicId) {
      await deleteFromCloudinary(channel.channelLogo.publicId, "image");
    }
    channel.channelLogo = {
      url      : req.file.path,
      publicId : req.file.filename,
    };
  }

  await channel.save();

  res.status(200).json({
    success: true,
    message: "Channel info updated successfully",
    channel,
  });
});

// ═══════════════════════════════════════════════════════════

module.exports = {
  getAllVideos,
  getSingleVideo,
  getFeaturedVideos,
  getVideosByCategory,
  addVideo,
  updateVideo,
  deleteVideo,
  reorderVideos,
  getChannelInfo,
  updateChannelInfo,
};
