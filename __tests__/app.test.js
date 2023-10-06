const app = require("../app");
const request = require("supertest");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const endpointsData = require("../endpoints.json");
const {
  convertTimestampToDate,
  createRef,
  formatComments,
} = require('../db/seeds/utils');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api/invalid-endpoint", () => {
  test("should send status 404 when passed an invalid endpoint", () => {
    return request(app)
      .get("/api/invalid-endpoint")
      .expect(404)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Invalid path");
      });
  });
});

describe("/api/topics", () => {
  test("should return all topics in an array of objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        expect(response.body.topics.length).toBe(3);
        response.body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("/api", () => {
  test("should return a JSON object containing a list of all valid endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(response.body.endpointsData).toEqual(endpointsData);
      });
  });
});

describe("/api/articles", () => {
  test("should return all articles in an array of objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(13);
        response.body.articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
        });
      });
  });
  test("should include a count of comments associated with the article", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles[0].article_id).toBe(3);
        expect(response.body.articles[0].comment_count).toBe(2);
      });
  });
  test("should not include body property on articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        response.body.articles.forEach((article) => {
          expect(article).not.toMatchObject({
            body: expect.any(String),
          });
        });
      });
  });
  test("should return most recent articles first", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("should return an object", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(typeof article).toBe("object");
      });
  });
  test("should return specified article with correct values", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body.article.article_id).toBe(1);
        expect(response.body.article).toMatchObject({
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("should return 404 when passed an ID that is correctly formatted but does not exist", () => {
    return request(app)
      .get("/api/articles/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Item not found");
      });
  });
  test("should return 400 when passed an ID that is incorrectly formatted", () => {
    return request(app)
      .get("/api/articles/mistake")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
});

describe("/api/users", () => {
  test("should return all users in an array of objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        expect(response.body.users.length).toBe(4);
        response.body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String)
          });
        });
      });
  });
});
      
describe("/api/articles/:article_id/comments", () => {
  test("should return an array of comments for the specified article with correct length and properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        response.body.comments.forEach((comment) => {
          expect(response.body.comments.length).toBe(11);
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            body: expect.any(String),
            article_id: expect.any(Number),
            author: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String),
          });
          response.body.comments.forEach((comment) => {
            expect(comment.article_id).toBe(1);
          });
        });
      });
  });
  test("should return most recent comments first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("should return 404 when passed an ID that is correctly formatted but does not exist", () => {
    return request(app)
      .get("/api/articles/99999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });
  test("should return 400 when passed an ID that is incorrectly formatted", () => {
    return request(app)
      .get("/api/articles/xyz/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("should respond with status 201 and an accurate representation of the posted comment as an object", () => {
    return request(app)
      .post("/api/articles/5/comments")
      .send({ username: "icellusedkars", body: "This article is the best." })
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          body: expect.any(String),
          article_id: expect.any(Number),
          author: expect.any(String),
          votes: expect.any(Number),
          created_at: expect.any(String)
        });
        expect(comment.author).toBe("icellusedkars");
        expect(comment.body).toBe("This article is the best.");
      });
  });
  test("should respond with status 201 when passed unnecessary properties and ignore the unnecessary properties", () => {
    return request(app)
      .post("/api/articles/5/comments")
      .send({ username: "icellusedkars", body: "This article is the best.", unnecessary: "property" })
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          body: expect.any(String),
          article_id: expect.any(Number),
          author: expect.any(String),
          votes: expect.any(Number),
          created_at: expect.any(String)
        });
        expect(comment.author).toBe("icellusedkars");
        expect(comment.body).toBe("This article is the best.");
      });
  });
  test("should respond with status 404 when passed a comment for an article that does not exist", () => {
    return request(app)
      .post("/api/articles/99999/comments")
      .send({ username: "icellusedkars", body: "This article is the best." })
      .expect(404)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Not found");
      });
  });
  test("should return 400 when passed an article ID that is incorrectly formatted giving invalid path", () => {
    return request(app)
      .post("/api/articles/mistake/comments")
      .send({ username: "icellusedkars", body: "This article is the best." })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
  test("should respond with status 400 when passed a comment with no username", () => {
    return request(app)
      .post("/api/articles/5/comments")
      .send({ body: "Nice article." })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Author missing");
      });
  });
  test("should respond with status 400 when passed a comment with no body", () => {
    return request(app)
      .post("/api/articles/5/comments")
      .send({ username: "icellusedkars" })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Comment missing");
      });
  });
  test("should respond with status 404 when passed a comment for an author that does not exist", () => {
    return request(app)
      .post("/api/articles/5/comments")
      .send({ username: "fluffy_sheep", body: "This article is the best." })
      .expect(404)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Not found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("should return specified article with updated votes when votes increased", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({ inc_votes: 23 })
      .expect(200)
      .then((response) => {
        expect(response.body.article.article_id).toBe(3);
        expect(response.body.article.votes).toBe(23);
        expect(response.body.article).toMatchObject({
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          article_img_url: expect.any(String),
        });
      });
  });
  test("should return specified article with updated votes when votes decreased", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -20 })
      .expect(200)
      .then((response) => {
        expect(response.body.article.article_id).toBe(1);
        expect(response.body.article.votes).toBe(80);
        expect(response.body.article).toMatchObject({
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          article_img_url: expect.any(String),
        });
      });
  });
  test("should return specified article with unchanged votes when votes is zero", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 0 })
      .expect(200)
      .then((response) => {
        expect(response.body.article.article_id).toBe(1);
        expect(response.body.article.votes).toBe(100);
        expect(response.body.article).toMatchObject({
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          article_img_url: expect.any(String),
        });
      });
  });
  test("should return 404 when passed an ID that is correctly formatted but does not exist", () => {
    return request(app)
      .patch("/api/articles/99999")
      .send({ inc_votes: 10 })
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Item not found");
      });
  });
  test("should return 400 when passed an ID that is incorrectly formatted", () => {
    return request(app)
      .patch("/api/articles/mistake")
      .send({ inc_votes: 10 })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
  test("should return 400 when passed invalid value", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({ inc_votes: "rubbish" })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Bad request");
      });
  });
  test("should return 400 when passed no update data", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({})
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("should delete a specified comment and respond with 204 and no content", () => {
    return request(app)
      .delete("/api/comments/6")
      .expect(204)
      .then(({ body }) => {
        expect(body).toBeEmptyObject();
      });
  });
  test("should return 404 when passed an ID that is correctly formatted but does not exist", () => {
    return request(app)
      .delete("/api/comments/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Item not found");
      });
  });
  test("should return 400 when passed an ID that is incorrectly formatted", () => {
    return request(app)
      .delete("/api/comments/mistake")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
});
describe("/api/articles", () => {
  test("should filter articles by a specified topic when passed that topic in a query", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(12);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("send status 200 and no results when queried with a valid topic which has no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(0);
      });
  });
  test("send status 404 when passed a topic that does not exist", () => {
    return request(app)
      .get("/api/articles?topic=not_a_real_topic5678")
      .expect(404)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Topic does not exist");
      });
  });
});