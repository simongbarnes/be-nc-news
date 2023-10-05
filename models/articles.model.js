const db = require("../db/connection");
const checkTopicExists = require("../models/topics.model");

function selectArticles(topic) {
  const queryValues = [];

  let queryStr =
    "SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.comment_id)::INT comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id";

  if (topic) {
    console.log("topic " + topic)

    queryStr += " WHERE articles.topic = $1 GROUP BY articles.article_id ORDER By articles.created_at DESC;";
    queryValues.push(topic);

    return checkTopicExists(topic)
    .then(() => {return db.query(queryStr, queryValues)})
    .then((result) => {return result.rows})
  }else{
    queryStr +=
    " GROUP BY articles.article_id ORDER By articles.created_at DESC;";
    return db.query(queryStr, queryValues).then((result) => {
      return result.rows;
  });
  }
}

function selectArticleById(articleId) {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [
      articleId.article_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Item not found" });
      } else {
        return rows[0];
      }
    });
}

module.exports = { selectArticleById, selectArticles };
