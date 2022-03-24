const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data');
// const { response } = require('../app')

beforeEach(() => seed(testData));

afterAll(() => db.end());

describe('/api/donors', () => {
    describe('GET', () => {
        test('status(200), responds with an array of donors', () => {
            return request(app)
          .get("/api/donors")
          .expect(200)
          .then((response) => {
            expect(response.body.donors).toHaveLength(5);
            response.body.donors.forEach((donor) => {
              expect(donor).toEqual(
                expect.objectContaining({
                  donator_id: expect.any(Number),
                  username: expect.any(String),
                })
              );
            });
          });
        });
    });
});