const request = require('supertest');
const { any } = require('async');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data');
// const { response } = require('../app')

beforeEach(() => seed(testData));

afterAll(() => db.end());

describe('/api/donors', () => {
  describe('GET', () => {
    test('status(200), responds with an array of donors', () => request(app)
      .get('/api/donors')
      .expect(200)
      .then((response) => {
        expect(response.body.donors).toHaveLength(5);
        response.body.donors.forEach((donor) => {
          expect(donor).toEqual(
            expect.objectContaining({
              donator_id: expect.any(Number),
              username: expect.any(String),
            }),
          );
        });
      }));
  });

  describe('POST', () => {
    test('add a donor to the database', () => {
      const testUser = {
        username: 'TestUserForTesting',
        password: 'TestPasswordForTesting',
        address: '1 test street, test town, testingshire, TE57 1NG',
        email_address: 'testEmail@testing.test',
      };

      return request(app).post('/api/donors').send(testUser).then(() => request(app).get('/api/donors').then((response) => {
        expect(response.body.donors).toHaveLength(6);
      }));
    });
    test('status(201), should respond with the new user object', () => {
      const testUser = {
        username: 'TestUserForTesting',
        password: 'TestPasswordForTesting',
        address: '1 test street, test town, testingshire, TE57 1NG',
        email_address: 'testEmail@testing.test',
      };

      return request(app).post('/api/donors').send(testUser).expect(201)
        .then(({ body: { donor } }) => {
          expect(donor).toEqual({
            donator_id: 6,
            username: 'TestUserForTesting',
            password: 'TestPasswordForTesting',
            address: '1 test street, test town, testingshire, TE57 1NG',
            email_address: 'testEmail@testing.test',
          });
        });
    });
  });
});
describe('/api/charities', () => {
  describe('GET', () => {
    test('status(200), responds with an array of charities', () => request(app)
      .get('/api/charities')
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
            }),
          );
        });
      }));
  });
  describe('POST', () => {
    const testCharity = {
      charity_name: 'CharityTestName',
      address: '1 test street, test town, testingshire, TE57 1NG',
      charity_website: 'www.iamacharity.com',
      charity_username: 'TestUserForTesting',
      password: 'TestPasswordForTesting',
      email_address: 'testEmail@testing.test',
    };
    test('adds a charity to the database', () => request(app).post('/api/charities').send(testCharity).then(() => request(app).get('/api/charities').then((response) => {
      expect(response.body.charities).toHaveLength(6);
    })));
    test('status(201), responds with the new charity object', () => request(app).post('/api/charities').send(testCharity).expect(201)
      .then(({ body: { charity } }) => {
        expect(charity).toEqual({
          charity_id: 6,
          charity_name: 'CharityTestName',
          address: '1 test street, test town, testingshire, TE57 1NG',
          charity_website: 'www.iamacharity.com',
          charity_username: 'TestUserForTesting',
          password: 'TestPasswordForTesting',
          email_address: 'testEmail@testing.test',
        });
      }));
  });
});
