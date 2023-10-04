const createCommentByArticleId = require('../models/comments.model')

function postCommentByArticleId(req, res, next) {
    const postedComment = req.body;
    const {article_id} = req.params;

    return createCommentByArticleId(article_id, postedComment)
        .then((comment) => res.status(201).send({comment}))
        .catch(err => next(err))
}

module.exports = postCommentByArticleId;