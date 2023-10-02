const app = require("../app");
const request = require("supertest");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api/invalid-endpoint", () => {
  test("should send status 404 when passed an invalid endpoint", () => {
    return request(app)
      .get("/api/invalid-endpoint")
      .expect(404)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Not found");
      });
  });
});

describe("/api/topics", () => {
  describe('/api/topics', () => {
    test ('should return all topics in an array of objects', () => {
        return request(app).get('/api/topics').expect(200)
        .then((response) => {
            expect(response.body.topics.length).toBe(3);
            response.body.topics.forEach((topic) => {
                expect(topic).toMatchObject({
                    slug: expect.any(String),
                    description: expect.any(String)
                });
              });
        })
    })
})
});
