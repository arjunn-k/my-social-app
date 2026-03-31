const { body, param, query } = require("express-validator");

const createPostValidation = [
  body("content").optional().trim().isLength({ max: 500 }),
];

const updatePostValidation = [
  param("postId").isMongoId(),
  body("content").optional().trim().isLength({ max: 500 }),
];

const postIdValidation = [param("postId").isMongoId()];

const postFeedValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
];

module.exports = {
  createPostValidation,
  updatePostValidation,
  postIdValidation,
  postFeedValidation,
};

