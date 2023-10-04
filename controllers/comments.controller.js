const deleteComment = require("../models/comments.model");

function removeComment(req, res, next) {
  const { comment_id } = req.params;
  return deleteComment(comment_id)
    .then(() => res.status(204).send())
    .catch(err => next(err));
}

module.exports = removeComment;
