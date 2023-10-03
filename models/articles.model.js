const db = require('../db/connection');

function selectArticles () {
    return db.query('SELECT * FROM articles;')
    .then((result) => {
       return result.rows;
    })
}

module.exports = selectArticles;