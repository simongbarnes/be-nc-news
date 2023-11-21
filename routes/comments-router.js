const { removeComment } = require('../controllers/comments.controller');
const commentRouter = require('express').Router();

commentRouter
.route("/:comment_id")
.delete(removeComment);

module.exports = commentRouter;