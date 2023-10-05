const {selectCommentsbyArticleId, createCommentByArticleId} = require('../models/comments.model')

function postCommentByArticleId(req, res, next) {
    const postedComment = req.body;
    const {article_id} = req.params;

    return createCommentByArticleId(article_id, postedComment)
        .then((comment) => res.status(201).send({comment}))
        .catch(err => next(err))
}

function getCommentsbyArticleId(req, res, next) {
    selectCommentsbyArticleId(req.params)
    .then((comments) => res.status(200).send({comments}))
    .catch(next);
};

module.exports = {getCommentsbyArticleId, postCommentByArticleId};
