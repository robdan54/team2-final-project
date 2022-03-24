const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data');
const { any } = require('async');
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
describe('/api/charities', () => {
    describe('GET', () => {
        test('status(200), responds with an array of charities', () => {
            return request(app)
          .get("/api/charities")
          .expect(200)
          .then((response) => {
            expect(response.body.charities).toHaveLength(5);
            response.body.charities.forEach((charity) => {
              expect(charity).toEqual(
                expect.objectContaining({
                  charity_id: expect.any(Number),
                  charity_name: expect.any(String),
                  address: expect.any(String),
                  charity_website: expect.any(String),
                  email_address: expect.any(String),
                })
              );
            });
          });
        });
    });
    
});