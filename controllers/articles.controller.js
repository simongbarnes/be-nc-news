const {
  selectArticleById,
  selectArticles,
  updateArticle,
} = require("../models/articles.model.js");
const { checkTopicExists } = require("../models/topics.model");

function getArticles(req, res, next) {
  const { topic, sort_by, order } = req.query;

  checkTopicExists(req.query)
    .then((args) => {
      return selectArticles(args);
    })
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

module.exports = { getArticleById, getArticles, patchArticle };
