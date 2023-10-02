const express = require('express');
const app = express();
const getTopics = require('./controllers/topics.controller')

app.get('/api/topics', getTopics);

app.all("/*", (req, res, next) => {
	res.status(404).send({message: "Not found"})
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send('Server Error');
  });

module.exports = app;