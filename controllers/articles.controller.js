const selectArticles = require('../models/articles.model.js')

function getArticles(req, res, next) {
    selectArticles()
    .then((articles) => res.status(200).send({articles}))
    .catch(next);
};

module.exports = getArticles;