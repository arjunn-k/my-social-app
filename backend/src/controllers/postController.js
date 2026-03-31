const Comment = require("../models/Comment");
const Follow = require("../models/Follow");
const Notification = require("../models/Notification");
const Post = require("../models/Post");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { deleteImage, uploadImage } = require("../utils/imageUploader");
const { getPagination } = require("../utils/pagination");

const populatePostQuery = (query) =>
  query.populate("author", "username displayName profilePicture");

const normalizePost = (post, currentUserId) => {
  const json = post.toJSON();
  json.isLiked = currentUserId
    ? json.likes.some((id) => id.toString() === currentUserId.toString())
    : false;
  delete json.likes;
  return json;
};

const createPost = asyncHandler(async (req, res) => {
  const { content = "" } = req.body;

  if (!content.trim() && !req.file) {
    throw new ApiError(422, "A post must contain text or an image");
  }

  const image = req.file
    ? await uploadImage({
        file: req.file,
        folder: "social-app/posts",
        req,
      })
    : null;

  const post = await Post.create({
    author: req.user._id,
    content,
    image,
  });

  await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

  const populatedPost = await populatePostQuery(Post.findById(post._id));

  res.status(201).json({
    message: "Post created successfully",
    post: normalizePost(populatedPost, req.user._id),
  });
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own posts");
  }

  if (typeof req.body.content === "string") {
    post.content = req.body.content;
  }

  if (!post.content.trim() && !post.image?.url && !req.file) {
    throw new ApiError(422, "A post must contain text or an image");
  }

  if (req.file) {
    const previousImage = post.image;
    post.image = await uploadImage({
      file: req.file,
      folder: "social-app/posts",
      req,
    });

    if (previousImage?.publicId) {
      await deleteImage(previousImage);
    }
  }

  await post.save();
  const populatedPost = await populatePostQuery(Post.findById(post._id));

  res.json({
    message: "Post updated successfully",
    post: normalizePost(populatedPost, req.user._id),
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own posts");
  }

  if (post.image?.publicId) {
    await deleteImage(post.image);
  }

  await Promise.all([
    Post.deleteOne({ _id: post._id }),
    Comment.deleteMany({ post: post._id }),
    Notification.deleteMany({ post: post._id }),
    User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } }),
  ]);

  res.json({ message: "Post deleted successfully" });
});

const getFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: safeLimit, page: safePage } = getPagination(page, limit);

  const following = await Follow.find({ follower: req.user._id }).distinct("following");
  const authorIds = [...following, req.user._id];

  const [posts, total] = await Promise.all([
    populatePostQuery(
      Post.find({ author: { $in: authorIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
    ),
    Post.countDocuments({ author: { $in: authorIds } }),
  ]);

  res.json({
    posts: posts.map((post) => normalizePost(post, req.user._id)),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      hasMore: skip + posts.length < total,
    },
  });
});

const getUserPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: safeLimit, page: safePage } = getPagination(page, limit);

  const user = await User.findOne({ username: req.params.username.toLowerCase() });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const [posts, total] = await Promise.all([
    populatePostQuery(
      Post.find({ author: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
    ),
    Post.countDocuments({ author: user._id }),
  ]);

  res.json({
    posts: posts.map((post) => normalizePost(post, req.user?._id)),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      hasMore: skip + posts.length < total,
    },
  });
});

const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const alreadyLiked = post.likes.some(
    (likeUserId) => likeUserId.toString() === req.user._id.toString()
  );

  if (alreadyLiked) {
    post.likes = post.likes.filter(
      (likeUserId) => likeUserId.toString() !== req.user._id.toString()
    );
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    post.likes.push(req.user._id);
    post.likesCount += 1;

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        actor: req.user._id,
        type: "like",
        post: post._id,
      });
    }
  }

  await post.save();
  const populatedPost = await populatePostQuery(Post.findById(post._id));

  res.json({
    message: alreadyLiked ? "Post unliked" : "Post liked",
    post: normalizePost(populatedPost, req.user._id),
  });
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await populatePostQuery(Post.findById(req.params.postId));

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  res.json({
    post: normalizePost(post, req.user?._id),
  });
});

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getFeed,
  getUserPosts,
  toggleLike,
  getPostById,
};

