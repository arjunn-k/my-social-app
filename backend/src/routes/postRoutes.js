const express = require("express");
const {
  createPost,
  updatePost,
  deletePost,
  getFeed,
  getUserPosts,
  toggleLike,
  getPostById,
} = require("../controllers/postController");
const { optionalAuth, protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");
const {
  createPostValidation,
  updatePostValidation,
  postIdValidation,
  postFeedValidation,
} = require("../validations/postValidation");
const { usernameValidation } = require("../validations/userValidation");

const router = express.Router();

router.get("/feed", protect, postFeedValidation, validate, getFeed);
router.get("/user/:username", optionalAuth, usernameValidation, validate, getUserPosts);
router.get("/:postId", optionalAuth, postIdValidation, validate, getPostById);
router.post("/", protect, upload.single("image"), createPostValidation, validate, createPost);
router.patch(
  "/:postId",
  protect,
  upload.single("image"),
  updatePostValidation,
  validate,
  updatePost
);
router.delete("/:postId", protect, postIdValidation, validate, deletePost);
router.post("/:postId/like", protect, postIdValidation, validate, toggleLike);

module.exports = router;

