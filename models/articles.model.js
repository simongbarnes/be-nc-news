const db = require("../db/connection");

function selectArticles({ topic, sort_by = "created_at", order = "DESC" }) {
  const queryArgs = [];

  const sortByGreenList = ["title", "author", "created_at", "votes", "comment_count"];
  const orderGreenList = ["ASC", "DESC"];

  order = order.toUpperCase();

  if (!sortByGreenList.includes(sort_by)) {
      return Promise.reject({ status: 400, message: "Invalid sort_by query" });
  }

  if (!orderGreenList.includes(order)) {
      return Promise.reject({ status: 400, message: "Invalid order query" });
  }

  let queryStr =
    "SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.comment_id)::INT comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id";

  if (topic) {
    queryStr +=
      ` WHERE articles.topic = '${topic}'`;
  }

  queryStr += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order};`;

  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
}

function selectArticleById(articleId) {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [articleId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Item not found" });
      } else {
        return rows[0];
      }
    });
}

function updateArticle(articleId, changes) {
  return selectArticleById(articleId)
    .then(() => {
      return db.query(
        "UPDATE articles SET votes = votes + $2 WHERE article_id = $1 RETURNING *;",
        [articleId, changes.inc_votes]
      );
    })
    .then(({ rows }) => rows[0]);
}

module.exports = { selectArticleById, selectArticles, updateArticle };
