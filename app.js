const express = require('express');
const { getEndpoints } = require('./controllers/endpoints.controller');
const getTopics = require('./controllers/topics.controller')
const app = express();

app.get('/api', getEndpoints);

app.get('/api/topics', getTopics);

app.all("/*", (req, res, next) => {
	res.status(404).send({message: "Invalid path"})
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send('Server Error');
  });

module.exports = app;