const { body, query, param } = require("express-validator");

const updateProfileValidation = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-z0-9_.]+$/),
  body("displayName").optional().trim().isLength({ max: 50 }),
  body("bio").optional().trim().isLength({ max: 160 }),
];

const searchUsersValidation = [
  query("q").optional().trim().isLength({ max: 50 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
];

const userIdValidation = [param("userId").isMongoId()];
const usernameValidation = [param("username").trim().isLength({ min: 3, max: 30 })];

module.exports = {
  updateProfileValidation,
  searchUsersValidation,
  userIdValidation,
  usernameValidation,
};

