const express = require("express");
const {
  getProfile,
  updateProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getNotifications,
  markNotificationsRead,
} = require("../controllers/userController");
const { optionalAuth, protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");
const {
  searchUsersValidation,
  updateProfileValidation,
  userIdValidation,
  usernameValidation,
} = require("../validations/userValidation");

const router = express.Router();

router.get("/search", searchUsersValidation, validate, searchUsers);
router.get("/me/notifications", protect, getNotifications);
router.patch("/me/notifications/read", protect, markNotificationsRead);
router.patch(
  "/me",
  protect,
  upload.single("profilePicture"),
  updateProfileValidation,
  validate,
  updateProfile
);
router.post("/:userId/follow", protect, userIdValidation, validate, followUser);
router.delete("/:userId/follow", protect, userIdValidation, validate, unfollowUser);
router.get("/:username", optionalAuth, usernameValidation, validate, getProfile);

module.exports = router;

