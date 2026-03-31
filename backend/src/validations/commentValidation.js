const { body, param, query } = require("express-validator");

const createCommentValidation = [
  body("postId").isMongoId(),
  body("content").trim().isLength({ min: 1, max: 300 }),
];

const deleteCommentValidation = [param("commentId").isMongoId()];
const postCommentsValidation = [
  param("postId").isMongoId(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
];

module.exports = {
  createCommentValidation,
  deleteCommentValidation,
  postCommentsValidation,
};

