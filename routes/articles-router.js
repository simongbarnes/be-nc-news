const { getArticleById, getArticles, patchArticle, addArticle } = require('../controllers/articles.controller');
const { getCommentsbyArticleId, postCommentByArticleId } = require('../controllers/comments.controller');
const articleRouter = require('express').Router();

articleRouter
.route("/")
.get(getArticles)
.post(addArticle);

articleRouter
.route("/:article_id")
.get(getArticleById)
.patch(patchArticle);

articleRouter
.route("/:article_id/comments")
.get(getCommentsbyArticleId)
.post(postCommentByArticleId);

module.exports = articleRouter;