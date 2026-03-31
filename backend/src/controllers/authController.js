const User = require("../models/User");
const Notification = require("../models/Notification");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { generateToken } = require("../utils/token");

const buildAuthResponse = (user) => ({
  message: "Authentication successful",
  token: generateToken(user._id),
  user,
});

const register = asyncHandler(async (req, res) => {
  const { username, email, password, displayName } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with that email or username already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
    displayName: displayName || username,
  });

  res.status(201).json({
    message: "Account created successfully",
    token: generateToken(user._id),
    user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  user.password = undefined;

  res.json(buildAuthResponse(user));
});

const logout = asyncHandler(async (req, res) => {
  res.json({ message: "Logged out successfully. Remove the token on the client." });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const unreadNotifications = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  res.json({
    user: req.user,
    unreadNotifications,
  });
});

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
};

