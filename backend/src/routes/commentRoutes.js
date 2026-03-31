const express = require("express");
const {
  createComment,
  deleteComment,
  getPostComments,
} = require("../controllers/commentController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createCommentValidation,
  deleteCommentValidation,
  postCommentsValidation,
} = require("../validations/commentValidation");

const router = express.Router();

router.get("/post/:postId", postCommentsValidation, validate, getPostComments);
router.post("/", protect, createCommentValidation, validate, createComment);
router.delete("/:commentId", protect, deleteCommentValidation, validate, deleteComment);

module.exports = router;

