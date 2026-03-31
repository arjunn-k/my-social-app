const Follow = require("../models/Follow");
const Notification = require("../models/Notification");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { uploadImage, deleteImage } = require("../utils/imageUploader");
const { getPagination } = require("../utils/pagination");

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let isFollowing = false;

  if (req.user && req.user._id.toString() !== user._id.toString()) {
    const follow = await Follow.findOne({
      follower: req.user._id,
      following: user._id,
    });
    isFollowing = Boolean(follow);
  }

  res.json({
    user,
    isFollowing,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { username, bio, displayName } = req.body;

  if (username && username.toLowerCase() !== req.user.username) {
    const usernameInUse = await User.findOne({ username: username.toLowerCase() });
    if (usernameInUse) {
      throw new ApiError(409, "Username is already taken");
    }
    req.user.username = username.toLowerCase();
  }

  if (typeof bio === "string") {
    req.user.bio = bio;
  }

  if (typeof displayName === "string") {
    req.user.displayName = displayName;
  }

  if (req.file) {
    const previousImage = req.user.profilePicture;
    req.user.profilePicture = await uploadImage({
      file: req.file,
      folder: "social-app/profiles",
      req,
    });

    if (previousImage?.publicId) {
      await deleteImage(previousImage);
    }
  }

  await req.user.save();

  res.json({
    message: "Profile updated successfully",
    user: req.user,
  });
});

const searchUsers = asyncHandler(async (req, res) => {
  const { q = "", page = 1, limit = 10 } = req.query;
  const { skip, limit: safeLimit, page: safePage } = getPagination(page, limit);

  const filter = q
    ? {
        $or: [
          { username: { $regex: q, $options: "i" } },
          { displayName: { $regex: q, $options: "i" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("username displayName bio profilePicture followersCount followingCount postsCount createdAt")
      .sort({ followersCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    User.countDocuments(filter),
  ]);

  res.json({
    users,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      hasMore: skip + users.length < total,
    },
  });
});

const followUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.userId);

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (targetUser._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const existingFollow = await Follow.findOne({
    follower: req.user._id,
    following: targetUser._id,
  });

  if (existingFollow) {
    throw new ApiError(409, "You already follow this user");
  }

  await Follow.create({
    follower: req.user._id,
    following: targetUser._id,
  });

  await Promise.all([
    User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } }),
    User.findByIdAndUpdate(targetUser._id, { $inc: { followersCount: 1 } }),
  ]);

  if (targetUser._id.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: targetUser._id,
      actor: req.user._id,
      type: "follow",
    });
  }

  res.json({ message: `You are now following ${targetUser.username}` });
});

const unfollowUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.userId);

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const deleted = await Follow.findOneAndDelete({
    follower: req.user._id,
    following: targetUser._id,
  });

  if (!deleted) {
    throw new ApiError(404, "Follow relationship not found");
  }

  await Promise.all([
    User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } }),
    User.findByIdAndUpdate(targetUser._id, { $inc: { followersCount: -1 } }),
  ]);

  res.json({ message: `You unfollowed ${targetUser.username}` });
});

const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: safeLimit, page: safePage } = getPagination(page, limit);

  const [notifications, total] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .populate("actor", "username displayName profilePicture")
      .populate("post", "content image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Notification.countDocuments({ recipient: req.user._id }),
  ]);

  res.json({
    notifications,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      hasMore: skip + notifications.length < total,
    },
  });
});

const markNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { $set: { read: true } }
  );

  res.json({ message: "Notifications marked as read" });
});

module.exports = {
  getProfile,
  updateProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getNotifications,
  markNotificationsRead,
};

