const express = require("express");
const app = express();
const { getEndpoints } = require("./controllers/endpoints.controller");
const getTopics = require("./controllers/topics.controller");
const getCommentsbyArticleId = require("./controllers/comments.controller");

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id/comments", getCommentsbyArticleId);

app.all("/*", (req, res, next) => {
  res.status(404).send({ message: "Invalid path" });
});

  app.use((err, req, res, next) => {
    if (err.code === "22P02") {
      res.status(400).send({ message: "Bad request" });
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
