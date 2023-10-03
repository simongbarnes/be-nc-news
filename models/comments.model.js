const db = require('../db/connection');

function selectCommentsbyArticleId (articleId) {
    return db.query('SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;', [articleId.article_id])
    .then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, message: "Item not found" });
          } else {
            return rows;
          }
    })
}

module.exports = selectCommentsbyArticleId;