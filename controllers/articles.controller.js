const selectArticleById = require('../models/articles.model');

function getArticleById(req, res, next) {
    selectArticleById(req.params)
    .then((article) => res.status(200).send({article}))
    .catch(next);
}

module.exports = getArticleById;