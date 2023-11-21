const db = require('../db/connection');

function selectUsers () {
    return db.query('SELECT * FROM users;')
    .then((result) => {
       return result.rows;
    })
}

function selectUserByUsername(username) {
    return db.query('SELECT * FROM users WHERE username = $1;', [username])
    .then((result) => {
       return result.rows[0];
    })
}

module.exports = { selectUsers, selectUserByUsername };