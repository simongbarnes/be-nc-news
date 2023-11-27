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
} = require("../db/seeds/utils");

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
        expect(response.body.topics.length).toBe(4);
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
  test("should return  articles in an array of objects with correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
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
  test("should return first 10 articles when limit and p queries not included", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(10);
        expect(response.body.articles[0].article_id).toBe(3);
      });
  });
  test("should return first 5 articles when limit = 5 and p query not included", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(5);
        expect(response.body.articles[0].article_id).toBe(3);
      });
  });
  test("should return first 5 articles when limit = 5 and p = 1", () => {
    return request(app)
      .get("/api/articles?limit=5&p=1")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(5);
        expect(response.body.articles[0].article_id).toBe(3);
      });
  });
  test("should return second 4 articles when limit = 4 and p = 2", () => {
    return request(app)
      .get("/api/articles?limit=4&p=2")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(4);
        expect(response.body.articles[0].article_id).toBe(13);
      });
  });
  test("should return last 3 articles when limit = 5 and p = 3", () => {
    return request(app)
      .get("/api/articles?limit=5&p=3")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(3);
        expect(response.body.articles[0].article_id).toBe(8);
      });
  });
  test("should send status 400 when passed a limit containing any non-numeric characters", () => {
    return request(app)
      .get("/api/articles?limit=x10")
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Limit not valid");
      });
  });
  test("should send status 400 when passed a p query containing any non-numeric characters", () => {
    return request(app)
      .get("/api/articles?p=z2")
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Page(p) not valid");
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
  test("should return most recent articles first when passed no sort_by or order queries", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("should return articles in descending order of title when passed query sort_by='title' and there is no order query", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("title", {
          descending: true,
        });
      });
  });
  test("should return articles in descending order of author when passed query sort_by='author' and order='desc", () => {
    return request(app)
      .get("/api/articles?sort_by=author&&order=desc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("author", {
          descending: true,
        });
      });
  });
  test("should return articles in ascending order of created_at when passed query sort_by='created_at' and order='asc", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&&order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("created_at", {
          descending: false,
        });
      });
  });
  test("should return articles in descending order of votes when passed query sort_by='votes'and order='desc", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&&order=desc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("votes", {
          descending: true,
        });
      });
  });
  test("should return articles in descending order of comment_count when passed query sort_by='comment_count'and order='desc'", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&&order=desc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("comment_count", {
          descending: true,
        });
      });
  });
  test("should return error 400 when passed a sort_by query for an ineligible column", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid-sort")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid sort_by query");
      });
  });
  test("should return error 400 when passed an invalid order query", () => {
    return request(app)
      .get("/api/articles?order=invalid-order")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid order query");
      });
  });
  test("should return articles in ascending order of title when passed queries topic=mitch sort_by=title and order asc", () => {
    return request(app)
      .get("/api/articles?topic=mitch&&sort_by=title&&order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("title", {
          descending: false,
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
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("/api/users/:username", () => {
  test("should return a matching user object with correct properties when passed an existing username", () => {
    return request(app)
      .get("/api/users/icellusedkars")
      .expect(200)
      .then((response) => {
        expect(response.body.user).toMatchObject({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String),
        });
        expect(response.body.user.username).toBe("icellusedkars");
      });
  });
  test("should return 404 when passed a username that is correctly formatted but does not exist", () => {
    return request(app)
      .get("/api/users/thisuserdoesnotexist")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("User not found");
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("should return an array of comments for the specified article with correct length and properties", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then((response) => {
        response.body.comments.forEach((comment) => {
          expect(response.body.comments.length).toBe(2);
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            body: expect.any(String),
            article_id: expect.any(Number),
            author: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String),
          });
          response.body.comments.forEach((comment) => {
            expect(comment.article_id).toBe(3);
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
  test("should return an array of the first 10 comments when passed an article with more than 10 comments and no limit or page query", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
          expect(response.body.comments.length).toBe(10);
          expect(response.body.comments[0].comment_id).toBe(5)
          response.body.comments.forEach((comment) => {
            expect(comment.article_id).toBe(1);
          });
      });
  });
  test("should return an array of the first 5 comments when passed an article with more than 5 comments and limit = 5 and p = 1", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=1")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(5);
        expect(response.body.comments[0].comment_id).toBe(5)
        response.body.comments.forEach((comment) => {
          expect(comment.article_id).toBe(1);
        });
      });
  });
  test("should return an array of the second 5 comments when passed an article with more than 5 comments and limit = 5 and p = 2", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=2")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(5);
        expect(response.body.comments[0].comment_id).toBe(8)
        response.body.comments.forEach((comment) => {
          expect(comment.article_id).toBe(1);
        });
      });
  });
  test("should send status 400 when passed a limit containing any non-numeric characters", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=x5&p=2")
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Limit not valid");
      });
  });
  test("should send status 400 when passed a p query containing any non-numeric characters", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=z2")
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Page(p) not valid");
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
          created_at: expect.any(String),
        });
        expect(comment.author).toBe("icellusedkars");
        expect(comment.body).toBe("This article is the best.");
      });
  });
  test("should respond with status 201 when passed unnecessary properties and ignore the unnecessary properties", () => {
    return request(app)
      .post("/api/articles/5/comments")
      .send({
        username: "icellusedkars",
        body: "This article is the best.",
        unnecessary: "property",
      })
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          body: expect.any(String),
          article_id: expect.any(Number),
          author: expect.any(String),
          votes: expect.any(Number),
          created_at: expect.any(String),
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
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(1);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("cats");
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
  test("send status 400 when queried with an invalid topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch;not_a_real_topic5678")
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Topic not valid");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("should return specified comment with updated votes when votes increased", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({ inc_votes: 23 })
      .expect(200)
      .then((response) => {
        expect(response.body.comment.comment_id).toBe(3);
        expect(response.body.comment.votes).toBe(123);
        expect(response.body.comment).toMatchObject({
          body: expect.any(String),
          author: expect.any(String),
          created_at: expect.any(String),
          article_id: expect.any(Number),
        });
      });
  });
  test("should return specified comment with updated votes when votes decreased", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: -20 })
      .expect(200)
      .then((response) => {
        expect(response.body.comment.comment_id).toBe(1);
        expect(response.body.comment.votes).toBe(-4);
        expect(response.body.comment).toMatchObject({
          body: expect.any(String),
          author: expect.any(String),
          created_at: expect.any(String),
          article_id: expect.any(Number),
        });
      });
  });
  test("should return specified article with unchanged votes when votes is zero", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 0 })
      .expect(200)
      .then((response) => {
        expect(response.body.comment.comment_id).toBe(1);
        expect(response.body.comment.votes).toBe(16);
        expect(response.body.comment).toMatchObject({
          body: expect.any(String),
          author: expect.any(String),
          created_at: expect.any(String),
          article_id: expect.any(Number),
        });
      });
  });
  test("should return 404 when passed an ID that is correctly formatted but does not exist", () => {
    return request(app)
      .patch("/api/comments/99999")
      .send({ inc_votes: 10 })
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Item not found");
      });
  });
  test("should return 400 when passed an ID that is incorrectly formatted", () => {
    return request(app)
      .patch("/api/comments/mistake")
      .send({ inc_votes: 10 })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
  test("should return 400 when passed invalid value", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: "rubbish" })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Bad request");
      });
  });
  test("should return 400 when passed no update data", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({})
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Bad request");
      });
  });
});

describe("POST /api/articles", () => {
  test("should respond with status 201 and an accurate representation of the posted article as an object when passed a valid article", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Why Wigan Athletic are the best club in the EFL",
        username: "icellusedkars",
        body: "Wigan Athletic are undoutably the best club in the EFL. They have withstood blow after blow in recent years but still they press on with optimism and belief. And let's not forget that time they won the FA Cup.",
        topic: "football",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE"
      })
      .expect(201)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: expect.any(Number),
          created_at: expect.any(String)
        });
        expect(article.title).toBe(
          "Why Wigan Athletic are the best club in the EFL"
        ),
          expect(article.topic).toBe("football"),
          expect(article.author).toBe("icellusedkars"),
          expect(article.body).toBe(
            "Wigan Athletic are undoutably the best club in the EFL. They have withstood blow after blow in recent years but still they press on with optimism and belief. And let's not forget that time they won the FA Cup."
          ),
          expect(article.comment_count).toBe(0),
          expect(article.votes).toBe(0),
          expect(article.article_img_url).toBe(
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE"
          );
      });
  });
  test("should respond with status 400 when passed an non-string username", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Why Wigan Athletic are the best club in the EFL",
        username: 999,
        body: "Wigan Athletic are undoutably the best club in the EFL. They have withstood blow after blow in recent years but still they press on with optimism and belief. And let's not forget that time they won the FA Cup.",
        topic: "football",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Author missing or invalid");
      });
  });
  test("should respond with status 400 when passed a zero length string username", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Why Wigan Athletic are the best club in the EFL",
        username: "",
        body: "Wigan Athletic are undoutably the best club in the EFL. They have withstood blow after blow in recent years but still they press on with optimism and belief. And let's not forget that time they won the FA Cup.",
        topic: "football",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Author missing or invalid");
      });
  });
  test("should respond with status 400 when passed no username", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Why Wigan Athletic are the best club in the EFL",
        body: "Wigan Athletic are undoubtably the best club in the EFL. They have withstood blow after blow in recent years but still they press on with optimism and belief. And let's not forget that time they won the FA Cup.",
        topic: "football",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Author missing or invalid");
      });
  });
  test("should respond with status 404 when passed a username for a user that doesn't exist", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Why Wigan Athletic are the best club in the EFL",
        username: "ThisUserDoesNotExist",
        body: "Wigan Athletic are undoubtably the best club in the EFL. They have withstood blow after blow in recent years but still they press on with optimism and belief. And let's not forget that time they won the FA Cup.",
        topic: "football",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(404)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Not found");
      });
  });
  test("should respond with status 400 when passed an non-string topic", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Why Wigan Athletic are the best club in the EFL",
        username: "icellusedkars",
        body: "Wigan Athletic are undoutably the best club in the EFL. They have withstood blow after blow in recent years but still they press on with optimism and belief. And let's not forget that time they won the FA Cup.",
        topic: 999,
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Topic missing or invalid");
      });
  });
  test("should respond with status 400 when passed a zero length string topic", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Why Wigan Athletic are the best club in the EFL",
        username: "icellusedkars",
        body: "Wigan Athletic are undoutably the best club in the EFL. They have withstood blow after blow in recent years but still they press on with optimism and belief. And let's not forget that time they won the FA Cup.",
        topic: "",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Topic missing or invalid");
      });
  });
  test("should respond with status 400 when passed no topic", () => {
    return request(app)
      .post("/api/articles")
      .send({
        username: "icellusedkars",
        title: "Why Wigan Athletic are the best club in the EFL",
        body: "Wigan Athletic are undoubtably the best club in the EFL. They have withstood blow after blow in recent years but still they press on with optimism and belief. And let's not forget that time they won the FA Cup.",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Topic missing or invalid");
      });
  });
  test("should respond with status 404 when passed a topic that doesn't exist", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Why Wigan Athletic are the best club in the EFL",
        username: "icellusedkars",
        body: "Wigan Athletic are undoubtably the best club in the EFL. They have withstood blow after blow in recent years but still they press on with optimism and belief. And let's not forget that time they won the FA Cup.",
        topic: "ThisTopicDoesNotExist",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(404)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Not found");
      });
  });

  test("should respond with status 400 when passed an non-string title", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: 999,
        username: "icellusedkars",
        body: "Wigan Athletic are undoutably the best club in the EFL. They have withstood blow after blow in recent years but still they press on with optimism and belief. And let's not forget that time they won the FA Cup.",
        topic: "football",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Title missing or invalid");
      });
  });
  test("should respond with status 400 when passed a zero length string title", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "",
        username: "icellusedkars",
        body: "Wigan Athletic are undoutably the best club in the EFL. They have withstood blow after blow in recent years but still they press on with optimism and belief. And let's not forget that time they won the FA Cup.",
        topic: "football",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Title missing or invalid");
      });
  });
  test("should respond with status 400 when passed no title", () => {
    return request(app)
      .post("/api/articles")
      .send({
        username: "icellusedkars",
        topic: "football",
        body: "Wigan Athletic are undoubtably the best club in the EFL. They have withstood blow after blow in recent years but still they press on with optimism and belief. And let's not forget that time they won the FA Cup.",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Title missing or invalid");
      });
  });

  test("should respond with status 400 when passed an non-string body", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Why Wigan Athletic are the best club in the EFL",
        username: "icellusedkars",
        body: 999,
        topic: "football",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Article content missing or invalid");
      });
  });
  test("should respond with status 400 when passed a zero length string body", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Why Wigan Athletic are the best club in the EFL",
        username: "icellusedkars",
        body: "",
        topic: "football",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Article content missing or invalid");
      });
  });
  test("should respond with status 400 when passed no body", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Why Wigan Athletic are the best club in the EFL",
        username: "icellusedkars",
        topic: "football",
        articleImageUrl:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ccfc.co.uk%2Fnews%2F2022%2Fjune%2Fgetting-to-know-wigan-athletic%2F&psig=AOvVaw0gXPkXOqYpm1_NMCDthuVl&ust=1700913023342000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKiiivbI3IIDFQAAAAAdAAAAABAE",
      })
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Article content missing or invalid");
      });
  });

});
