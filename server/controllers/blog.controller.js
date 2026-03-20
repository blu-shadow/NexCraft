// ═══════════════════════════════════════════════════════════
//                   BLOG CONTROLLER
// ═══════════════════════════════════════════════════════════
const asyncHandler             = require("express-async-handler");
const Blog                     = require("../models/Blog.model");
const { deleteFromCloudinary } = require("../config/cloudinary");

// ─────────────────────────────────────────
//   Helper: Build Filter Query
// ─────────────────────────────────────────
const buildFilter = (query, baseFilter = { status: "published" }) => {
  const filter = { ...baseFilter };

  if (query.category) filter.category = query.category;
  if (query.tag)      filter.tags     = { $in: [query.tag.toLowerCase()] };
  if (query.search) {
    filter.$or = [
      { title   : { $regex: query.search, $options: "i" } },
      { excerpt : { $regex: query.search, $options: "i" } },
      { tags    : { $in: [query.search.toLowerCase()] } },
    ];
  }
  return filter;
};

// ═══════════════════════════════════════════════════════════

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
const getAllBlogs = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 10;
  const skip   = (page - 1) * limit;
  const sortBy = req.query.sort === "popular" ? { views: -1 } : { createdAt: -1 };

  const filter = buildFilter(req.query);

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate("author", "name avatar")
      .select("-content -comments")
      .sort(sortBy)
      .skip(skip)
      .limit(limit),
    Blog.countDocuments(filter),
  ]);

  res.status(200).json({
    success   : true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    blogs,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getSingleBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({
    slug  : req.params.slug,
    status: "published",
  })
    .populate("author",           "name avatar")
    .populate("comments.user",    "name avatar");

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  // Increment view count
  await blog.incrementView();

  res.status(200).json({ success: true, blog });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get featured blogs
// @route   GET /api/blogs/featured
// @access  Public
const getFeaturedBlogs = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;

  const blogs = await Blog.find({ status: "published", isFeatured: true })
    .populate("author", "name avatar")
    .select("-content -comments")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({ success: true, blogs });
});

// ═══════════════════════════════════════════════════════════

// @desc    Get blogs by category
// @route   GET /api/blogs/category/:category
// @access  Public
const getBlogsByCategory = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const filter = { status: "published", category: req.params.category };

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate("author", "name avatar")
      .select("-content -comments")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Blog.countDocuments(filter),
  ]);

  res.status(200).json({
    success   : true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    blogs,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Admin
const createBlog = asyncHandler(async (req, res) => {
  const { title, content, excerpt, category, tags, status, isFeatured } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Title and content are required");
  }

  const blogData = {
    title,
    content,
    excerpt   : excerpt || content.substring(0, 200),
    category  : category || "other",
    tags      : tags ? JSON.parse(tags) : [],
    status    : status || "draft",
    isFeatured: isFeatured === "true",
    author    : req.admin._id,
  };

  // Thumbnail upload
  if (req.file) {
    blogData.thumbnail = {
      url      : req.file.path,
      publicId : req.file.filename,
    };
  }

  const blog = await Blog.create(blogData);

  res.status(201).json({
    success: true,
    message: "Blog created successfully",
    blog,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Admin
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  const { title, content, excerpt, category, tags, status, isFeatured } = req.body;

  if (title)     blog.title      = title;
  if (content)   blog.content    = content;
  if (excerpt)   blog.excerpt    = excerpt;
  if (category)  blog.category   = category;
  if (tags)      blog.tags       = JSON.parse(tags);
  if (status)    blog.status     = status;
  if (isFeatured !== undefined) blog.isFeatured = isFeatured === "true";

  // New thumbnail uploaded
  if (req.file) {
    // Delete old thumbnail
    if (blog.thumbnail?.publicId) {
      await deleteFromCloudinary(blog.thumbnail.publicId, "image");
    }
    blog.thumbnail = {
      url      : req.file.path,
      publicId : req.file.filename,
    };
  }

  await blog.save();

  res.status(200).json({
    success: true,
    message: "Blog updated successfully",
    blog,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Admin
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  // Delete thumbnail from Cloudinary
  if (blog.thumbnail?.publicId) {
    await deleteFromCloudinary(blog.thumbnail.publicId, "image");
  }

  // Delete video from Cloudinary
  if (blog.video?.publicId) {
    await deleteFromCloudinary(blog.video.publicId, "video");
  }

  await Blog.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Upload video to blog post
// @route   POST /api/blogs/:id/video
// @access  Admin
const uploadBlogVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a video file");
  }

  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  // Delete old video
  if (blog.video?.publicId) {
    await deleteFromCloudinary(blog.video.publicId, "video");
  }

  blog.video = {
    url      : req.file.path,
    publicId : req.file.filename,
  };

  await blog.save();

  res.status(200).json({
    success: true,
    message: "Video uploaded successfully",
    video  : blog.video,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Remove video from blog post
// @route   DELETE /api/blogs/:id/video
// @access  Admin
const deleteBlogVideo = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  if (!blog.video?.publicId) {
    res.status(400);
    throw new Error("No video to delete");
  }

  await deleteFromCloudinary(blog.video.publicId, "video");

  blog.video = { url: "", publicId: "", duration: 0 };
  await blog.save();

  res.status(200).json({
    success: true,
    message: "Video removed successfully",
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Add comment to blog
// @route   POST /api/blogs/:id/comments
// @access  Private (User)
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    res.status(400);
    throw new Error("Comment text is required");
  }

  const blog = await Blog.findById(req.params.id);

  if (!blog || blog.status !== "published") {
    res.status(404);
    throw new Error("Blog not found");
  }

  blog.comments.push({
    user  : req.user._id,
    name  : req.user.name,
    avatar: req.user.avatar?.url || "",
    text  : text.trim(),
  });

  await blog.save();

  res.status(201).json({
    success : true,
    message : "Comment added",
    comments: blog.comments,
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Delete a comment
// @route   DELETE /api/blogs/:id/comments/:commentId
// @access  Private (Owner or Admin)
const deleteComment = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  const comment = blog.comments.id(req.params.commentId);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  // Only comment owner or admin can delete
  const isOwner = comment.user.toString() === req.user?.id;
  const isAdmin = !!req.admin;

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  comment.deleteOne();
  await blog.save();

  res.status(200).json({
    success: true,
    message: "Comment deleted",
  });
});

// ═══════════════════════════════════════════════════════════

// @desc    Toggle like on blog
// @route   PUT /api/blogs/:id/like
// @access  Private (User)
const toggleLike = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog || blog.status !== "published") {
    res.status(404);
    throw new Error("Blog not found");
  }

  const userId    = req.user._id.toString();
  const alreadyLiked = blog.likes.some((id) => id.toString() === userId);

  if (alreadyLiked) {
    blog.likes = blog.likes.filter((id) => id.toString() !== userId);
  } else {
    blog.likes.push(req.user._id);
  }

  await blog.save();

  res.status(200).json({
    success  : true,
    liked    : !alreadyLiked,
    likeCount: blog.likes.length,
  });
});

// ═══════════════════════════════════════════════════════════

module.exports = {
  getAllBlogs,
  getSingleBlog,
  getFeaturedBlogs,
  getBlogsByCategory,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogVideo,
  deleteBlogVideo,
  addComment,
  deleteComment,
  toggleLike,
};
