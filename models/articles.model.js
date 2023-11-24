const db = require("../db/connection");
const { selectTopicSlugs } = require("./topics.model");

async function selectArticles({
  topic,
  sort_by = "created_at",
  order = "DESC",
}) {
  const queryArgs = [];

  const sortByGreenList = [
    "title",
    "author",
    "created_at",
    "votes",
    "comment_count",
  ];
  const orderGreenList = ["ASC", "DESC"];

  order = order.toUpperCase();

  if (topic) {
    try {
      const slugs = await selectTopicSlugs();
      const topicGreenList = slugs.map((slug) => {
        return slug.slug;
      });
      if (!topicGreenList.includes(topic)) {
        return Promise.reject({ status: 400, message: "Topic not valid" });
      }
    } catch (err) {
      next(err);
      return;
    }
  }

  if (!sortByGreenList.includes(sort_by)) {
    return Promise.reject({ status: 400, message: "Invalid sort_by query" });
  }

  if (!orderGreenList.includes(order)) {
    return Promise.reject({ status: 400, message: "Invalid order query" });
  }

  let queryStr =
    "SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.comment_id)::INT comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id";

  if (topic) {
    queryStr += ` WHERE articles.topic = '${topic}'`;
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

function createArticle(article) {
  const { username, title, body, topic, articleImageUrl } = article;

  if (typeof username !== "string" || username.length < 1) {
    return Promise.reject({ status: 400, message: "Author missing or invalid" });
  }

  if (typeof topic !== "string" || topic.length < 1) {
    return Promise.reject({ status: 400, message: "Topic missing or invalid" });
  }

  if (typeof title !== "string" || title.length < 1) {
    return Promise.reject({ status: 400, message: "Title missing or invalid" });
  }

  if (typeof body !== "string" || body.length < 1) {
    return Promise.reject({ status: 400, message: "Article content missing or invalid" });
  }

  if (articleImageUrl === undefined) {
    return Promise.reject({ status: 400, message: "Image missing or invalid" });
  }

  return db
    .query(
      "INSERT INTO articles (title, author, body, topic, article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
      [title, username, body, topic, articleImageUrl]
    )
    .then(({ rows }) => rows[0]);
}

module.exports = {
  selectArticleById,
  selectArticles,
  updateArticle,
  createArticle,
};
