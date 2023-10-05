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

function selectCommentsbyArticleId(articleId) {
  return db
    .query(
      "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;",
      [articleId.article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Article not found",
        });
      } else {
        return rows;
      }
    })
}

module.exports = {selectCommentsbyArticleId, createCommentByArticleId};