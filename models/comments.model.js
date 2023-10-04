const db = require("../db/connection");

function createCommentByArticleId(articleId, comment) {
  const { username, body } = comment;

  if (username === undefined) {
    return Promise.reject({ status: 400, message: "Author missing" });
  }

  if (body === undefined) {
    return Promise.reject({ status: 400, message: "Comment missing" });
  }

  return db
    .query(
      "INSERT INTO comments (article_id, body, author) VALUES ($1, $3, $2) RETURNING *;",
      [articleId, username, body]
    )
    .then(({ rows }) => rows[0]);
}

module.exports = createCommentByArticleId;
