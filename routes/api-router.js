const apiRouter = require('express').Router();
const { getEndpoints } = require("../controllers/endpoints.controller");
const articleRouter = require("./articles-router");

apiRouter.get("/", getEndpoints);

apiRouter.use("/articles", articleRouter);

module.exports = apiRouter;