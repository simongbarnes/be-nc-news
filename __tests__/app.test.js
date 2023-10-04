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
describe("PATCH /api/articles/:article_id", () => {
  test("should return specified article with updated votes when votes increased", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({inc_votes: 23})
      .expect(201)
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
      .send({inc_votes: -20})
      .expect(201)
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
      .send({inc_votes: 0})
      .expect(201)
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
      .send({inc_votes: 10})
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Item not found");
      });
  });
  test("should return 400 when passed an ID that is incorrectly formatted", () => {
    return request(app)
      .patch("/api/articles/mistake")
      .send({inc_votes: 10})
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
  test("should return 400 when passed invalid key", () => {
    return request(app)
        .patch("/api/articles/2")
        .send({ invalid_key: 10 })
        .expect(400)
        .then(({body}) => {
            const {message} = body;
            expect(message).toBe("Bad request")
        })
})
test("should return 400 when passed invalid value", () => {
  return request(app)
      .patch("/api/articles/2")
      .send({inc_votes: "rubbish"})
      .expect(400)
      .then(({body}) => {
          const {message} = body;
          expect(message).toBe("Bad request")
      })
})
test("should return 400 when passed no request body", () => {
    return request(app)
        .patch("/api/articles/2")
        .send({})
        .expect(400)
        .then(({body}) => {
            const {message} = body;
            expect(message).toBe("Bad request")
        })
})
});