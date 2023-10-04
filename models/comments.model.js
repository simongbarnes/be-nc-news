const db = require("../db/connection");

function selectCommentById(commentId) {
  return db
    .query("SELECT * FROM comments WHERE comment_id = $1;", [commentId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Item not found" });
      }
    });
}

function deleteComment(commentId) {
  return selectCommentById(commentId).
  then(() => {
    return db.query("DELETE FROM comments WHERE comment_id = $1;", [commentId])
  });
}

module.exports = deleteComment;
