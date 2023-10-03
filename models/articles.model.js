const db = require('../db/connection');

function selectArticles () {
    return db.query('SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.comment_id)::INT comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id ORDER By articles.created_at DESC;')
    .then((result) => {
       return result.rows;
    })
}

module.exports = selectArticles;