const { selectArticleById, selectArticles } = require('../models/articles.model.js');

function getArticles(req, res, next) {
    selectArticles()
    .then((articles) => res.status(200).send({articles}))
    .catch(next);
};

function getArticleById(req, res, next) {
    selectArticleById(req.params)
    .then((article) => res.status(200).send({article}))
    .catch((err) => {
        next(err);
    });
}

module.exports = { getArticleById, getArticles };