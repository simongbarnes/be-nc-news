const { removeComment, patchComment } = require('../controllers/comments.controller');
const commentRouter = require('express').Router();

commentRouter
.route("/:comment_id")
.patch(patchComment)
.delete(removeComment);

module.exports = commentRouter;