const apiRouter = require('express').Router();
const { getEndpoints } = require("../controllers/endpoints.controller");

apiRouter.get('/', getEndpoints);

module.exports = apiRouter;