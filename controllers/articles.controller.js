const { selectArticleById, selectArticles } = require('../models/articles.model.js');
const {checkTopicExists} = require("../models/topics.model");

// function getArticles(req, res, next) {
//     const {topic} = req.query;
//     selectArticles(topic)
//     .then((articles) => res.status(200).send({articles}))
//     .catch(next);
// };

function getArticles(req, res, next) {
    const {topic} = req.query;

    if (topic){
        const topicPromise = checkTopicExists(topic)
        .then((slug) => {return slug})
        .catch(next)

        const articlesPromise = selectArticles(topic)
        .then((articles) => res.status(200).send({articles}))
        .catch((err) => next(err))

        Promise.all([topicPromise, articlesPromise])
        .then((promises) => console.log(promises[0]))

    }else{
        selectArticles(topic)
        .then((articles) => res.status(200).send({articles}))
        .catch((err) => next(err));
    }



};

// function getArticles(req, res, next) {
//     const {topic} = req.query;
//     checkTopicExists(topic)
//     .then((topic) => selectArticle(topic))
//     .then((articles) => res.status(200).send({articles}))
//     .catch((err) => next(err));
// };

function getArticleById(req, res, next) {
    selectArticleById(req.params)
    .then((article) => res.status(200).send({article}))
    .catch((err) => {
        next(err);
    });
}

module.exports = { getArticleById, getArticles };