const {selectCommentsbyArticleId, createCommentByArticleId, deleteComment, updateComment} = require('../models/comments.model')

function removeComment(req, res, next) {
  const { comment_id } = req.params;
  return deleteComment(comment_id)
    .then(() => res.status(204).send())
    .catch(err => next(err));
}

function postCommentByArticleId(req, res, next) {
    const postedComment = req.body;
    const {article_id} = req.params;

    return createCommentByArticleId(article_id, postedComment)
        .then((comment) => res.status(201).send({comment}))
        .catch(err => next(err))
}

function getCommentsbyArticleId(req, res, next) {
    selectCommentsbyArticleId(req.params, req.query)
    .then((comments) => res.status(200).send({comments}))
    .catch(next);
};

function patchComment(req, res, next) {
    const changes = req.body;
    const { comment_id } = req.params;
  
    return updateComment(comment_id, changes)
      .then((comment) => res.status(200).send({ comment }))
      .catch((err) => next(err));
  }

module.exports = {getCommentsbyArticleId, postCommentByArticleId, removeComment, patchComment};