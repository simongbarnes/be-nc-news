const selectArticleById = require('../models/articles.model.js');

const selectCommentsbyArticleId = require('../models/comments.model.js');

function getCommentsbyArticleId(req, res, next) {
    selectCommentsbyArticleId(req.params)
    .then((comments) => res.status(200).send({comments}))
    .catch(next);
};






module.exports = getCommentsbyArticleId;