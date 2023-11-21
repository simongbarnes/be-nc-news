const express = require("express");
const apiRouter = require("./routes/api-router");
const getTopics = require("./controllers/topics.controller");
const {removeComment} = require("./controllers/comments.controller");
const getUsers = require("./controllers/users.controller");
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

app.get("/api/topics", getTopics);

app.get('/api/users', getUsers);

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