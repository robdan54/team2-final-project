const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data');

process.env.NODE_ENV = 'test';

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

      return request(app)
        .post('/api/donors')
        .send(testUser)
        .then(() => request(app)
          .get('/api/donors')
          .then((response) => {
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

      return request(app)
        .post('/api/donors')
        .send(testUser)
        .expect(201)
        .then(({ body: { donor } }) => {
          expect(donor).toEqual(
            expect.objectContaining({
              donator_id: 6,
              username: 'TestUserForTesting',
              address: '1 test street, test town, testingshire, TE57 1NG',
              email_address: 'testEmail@testing.test',
            }),
          );
          expect(bcrypt.compareSync(testUser.password, donor.password)).toBe(
            true,
          );
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
              lat: expect.any(Number),
              lng: expect.any(Number),
            }),
          );
        });
      }));
    test('lat/lng queries should work and return an array of charities', () => request(app)
      .get('/api/charities?lat=53.70754277823678&lng=-1.6484416213022532')
      .expect(200)
      .then((response) => {
        response.body.charities.forEach((charity) => {
          expect(charity).toEqual(
            expect.objectContaining({
              charity_id: expect.any(Number),
              charity_name: expect.any(String),
              address: expect.any(String),
              charity_website: expect.any(String),
              email_address: expect.any(String),
              lat: expect.any(Number),
              lng: expect.any(Number),
              distance: expect.any(Number),
            }),
          );
        });
      }));
    test('by default, results should be ordered by distance ascending', () => request(app)
      .get('/api/charities')
      .expect(200)
      .then((response) => {
        expect(response.body.charities).toBeSortedBy('distance', { ascending: true });
      }));
    test('results should be limited to a particular distance from original location', () => request(app)
      .get('/api/charities?range=1000')
      .expect(200)
      .then((response) => {
        response.body.charities.forEach((charity) => {
          expect(charity.distance).toBeLessThan(1001);
        });
      }));
  });
  describe('POST', () => {
    const testCharity = {
      charity_name: 'CharityTestName',
      address: '1 test street, test town, testingshire, TE57 1NG',
      charity_website: 'www.iamacharity.com',
      password: 'TestPasswordForTesting',
      email_address: 'testEmail@testing.test',
    };
    test('adds a charity to the database', () => request(app)
      .post('/api/charities')
      .send(testCharity)
      .then(() => request(app)
        .get('/api/charities')
        .then((response) => {
          expect(response.body.charities).toHaveLength(6);
        })));
    test('status(201), responds with the new charity object', () => request(app)
      .post('/api/charities')
      .send(testCharity)
      .expect(201)
      .then(({ body: { charity } }) => {
        expect(charity).toEqual(
          expect.objectContaining({
            charity_id: 6,
            charity_name: 'CharityTestName',
            address: '1 test street, test town, testingshire, TE57 1NG',
            charity_website: 'www.iamacharity.com',
            email_address: 'testEmail@testing.test',
          }),
        );

        expect(
          bcrypt.compareSync(testCharity.password, charity.password),
        ).toBe(true);
      }));
  });
});

describe('/api/donors/signin', () => {
  describe('POST', () => {
    test('should not be able to signin without a password and username', () => request(app)
      .post('/api/donors/signin')
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: 'please provide a username and password',
        });
      }));
    test('should respond with a JSON webToken', () => request(app)
      .post('/api/donors/signin')
      .send({
        email_address: 'testemail1',
        password: 'Testuserpassword1',
      })
      .expect(202)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            accessToken: expect.any(String),
          }),
        );
      }));
    test('should not token with invalid passwords', () => request(app)
      .post('/api/donors/signin')
      .send({
        email_address: 'testemail1',
        password: 'invalidpassword',
      })
      .expect(401)
      .then(({ body }) => {
        expect(body).toEqual({ msg: 'invalid password' });
        expect(body).toEqual(
          expect.not.objectContaining({ accessToken: expect.any(String) }),
        );
      }));
    test('should respond with a message when the email address is incorrect', () => request(app).post('/api/donors/signin').send({
      email_address: 'not an email address',
      password: 'Testuserpassword1',
    }).expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: 'invalid username' });
      }));
  });
});

describe('/api/charities/signin', () => {
  describe('POST', () => {
    test('should not be able to signin without a password and username', () => request(app)
      .post('/api/charities/signin')
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: 'please provide an email address and password' });
      }));
    test('should respond with a JSON webToken', () => request(app)
      .post('/api/charities/signin')
      .send({
        email_address: 'testEmail1',
        password: 'TestCharityPassword1',
      })
      .expect(202)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            accessToken: expect.any(String),
          }),
        );
      }));
    test('should not token with invalid passwords', () => request(app)
      .post('/api/charities/signin')
      .send({
        email_address: 'testEmail1',
        password: 'invalidpassword',
      })
      .expect(401)
      .then(({ body }) => {
        expect(body).toEqual({ msg: 'invalid password' });
        expect(body).toEqual(expect.not.objectContaining({ accessToken: expect.any(String) }));
      }));
    test('should respond with a message when the username is incorrect', () => request(app).post('/api/charities/signin').send({
      email_address: 'not-an-email',
      password: 'TestCharityPassword1',
    }).expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: 'invalid username' });
      }));
  });
});

// Charity Id requirements
describe('/api/:charity_id/requirements', () => {
  describe('GET', () => {
    test('Status (200), responds with an array of charity requirements', () => request(app)
      .get('/api/4/requirements')
      .expect(200)
      .then((response) => {
        expect(response.body.charityRequirements).toBeInstanceOf(Array);
        expect(response.body.charityRequirements).toEqual([{
          category_name: 'food',
          charity_id: 4,
          created_at: expect.any(String),
          item_id: 2,
          quantity_required: 200,
          request_id: 6,
          urgent: false,
        }]);
      }));
  });
});

describe('POST', () => {
  const testRequest = {
    category_name: 'food',
    item_id: '1',
    quantity_required: '200',
  };
  test('Status (201), adds a foodbank\'s requirement to the database', () => request(app)
    .post('/api/1/requirements')
    .send(testRequest)
    .then((response) => {
      expect(response.body.charityRequirementObject).toBeInstanceOf(Object);
      expect(response.body.charityRequirementObject).toEqual(expect.objectContaining({
        category_name: 'food',
        charity_id: 1,
        created_at: expect.any(String),
        item_id: 1,
        quantity_required: 200,
        request_id: expect.any(Number),
        urgent: false,
      }));
    }));
});
