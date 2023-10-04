const db = require("../db/connection");

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
    })
}

module.exports = selectArticleById;
