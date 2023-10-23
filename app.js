const express = require("express");
const { getEndpoints } = require("./controllers/endpoints.controller");
const getTopics = require("./controllers/topics.controller");
const { getArticleById, getArticles, patchArticle } = require("./controllers/articles.controller");
const {getCommentsbyArticleId, postCommentByArticleId, removeComment} = require("./controllers/comments.controller");
const getUsers = require("./controllers/users.controller");
const cors = require('cors');

const app = express();

app.use(cors());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get('/api/articles', getArticles);

app.get('/api/users', getUsers);

app.get("/api/articles/:article_id/comments", getCommentsbyArticleId);

app.use(express.json());

app.patch("/api/articles/:article_id", patchArticle)

app.post("/api/articles/:article_id/comments", postCommentByArticleId)

app.delete('/api/comments/:comment_id', removeComment);

app.all("/*", (req, res, next) => {
  res.status(404).send({ message: "Invalid path" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ message: "Bad request" });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "23502") {
    res.status(400).send({ message: "Bad request" });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "23503") {
    res.status(404).send({ message: "Not found" });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.status && err.message){
  res.status(err.status).send({message: err.message});
  } else next(err);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Server Error");
});

module.exports = app;