const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Post = require("../models/Post");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getPagination } = require("../utils/pagination");

const createComment = asyncHandler(async (req, res) => {
  const { postId, content } = req.body;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    content,
  });

  await Promise.all([
    Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } }),
    comment.populate("author", "username displayName profilePicture"),
  ]);

  if (post.author.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: post.author,
      actor: req.user._id,
      type: "comment",
      post: post._id,
      comment: comment._id,
    });
  }

  res.status(201).json({
    message: "Comment added successfully",
    comment,
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const post = await Post.findById(comment.post);
  if (!post) {
    throw new ApiError(404, "Parent post not found");
  }

  const isCommentOwner = comment.author.toString() === req.user._id.toString();
  const isPostOwner = post.author.toString() === req.user._id.toString();

  if (!isCommentOwner && !isPostOwner) {
    throw new ApiError(403, "You cannot delete this comment");
  }

  await Promise.all([
    Comment.deleteOne({ _id: comment._id }),
    Notification.deleteMany({ comment: comment._id }),
    Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } }),
  ]);

  res.json({ message: "Comment deleted successfully" });
});

const getPostComments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: safeLimit, page: safePage } = getPagination(page, limit);

  const [comments, total] = await Promise.all([
    Comment.find({ post: req.params.postId })
      .populate("author", "username displayName profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Comment.countDocuments({ post: req.params.postId }),
  ]);

  res.json({
    comments,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      hasMore: skip + comments.length < total,
    },
  });
});

module.exports = {
  createComment,
  deleteComment,
  getPostComments,
};

