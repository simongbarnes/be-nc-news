const { getArticleById, getArticles, patchArticle } = require('../controllers/articles.controller');
const { getCommentsbyArticleId, postCommentByArticleId } = require('../controllers/comments.controller');
const articleRouter = require('express').Router();

articleRouter
.route("/")
.get(getArticles);

articleRouter
.route("/:article_id")
.get(getArticleById)
.patch(patchArticle);

articleRouter
.route("/:article_id/comments")
.get(getCommentsbyArticleId)
.post(postCommentByArticleId);

module.exports = articleRouter;