const {
  selectArticleById,
  selectArticles,
  updateArticle,
  createArticle,
} = require("../models/articles.model.js");

function getArticles(req, res, next) {

  selectArticles(req.query)
  .then((articles) => {
    res.status(200).send({ articles });
  })
  .catch(next);
}

function getArticleById(req, res, next) {
  selectArticleById(req.params.article_id)
    .then((article) => res.status(200).send({ article }))
    .catch((err) => {
      next(err);
    });
}

function patchArticle(req, res, next) {
  const changes = req.body;
  const { article_id } = req.params;

  return updateArticle(article_id, changes)
    .then((article) => res.status(200).send({ article }))
    .catch((err) => next(err));
}

function addArticle(req, res, next) {
  const postedArticle = req.body;

  return createArticle(postedArticle)
    .then((article) => res.status(201).send({ article }))
    .catch((err) => next(err));
}

module.exports = { getArticleById, getArticles, patchArticle, addArticle };
