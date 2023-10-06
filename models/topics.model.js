const db = require("../db/connection");

function selectTopics() {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
}

function checkTopicExists(topic) {
  if(!topic){
    return new Promise((resolve, reject) => {
      return resolve("")})
  }
  return db
    .query("SELECT * FROM topics WHERE slug = $1;", [topic])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Topic does not exist" });
      } else {
        return rows[0].slug;
      }
    })
    
}

module.exports = {selectTopics, checkTopicExists};
