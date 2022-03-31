const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data');

process.env.NODE_ENV = 'test';

jest.setTimeout(100000);

beforeEach(() => seed(testData));

afterAll(() => db.end());

// DONOR TESTS
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
              lat: expect.any(Number),
              lng: expect.any(Number),
            }),
          );
          expect(bcrypt.compareSync(testUser.password, donor.password)).toBe(
            true,
          );
        });
    });
    test('should not allow a user to signup with the same email', () => {
      const testUser1 = {
        username: 'TestUserForTesting',
        password: 'TestPasswordForTesting',
        address: '1 test street, test town, testingshire, TE57 1NG',
        email_address: 'testEmail@testing.test',
      };
      const testUser2 = {
        username: 'TestUserName2',
        password: 'TestPasswordForadditionalTesting',
        address: '2 test street, test town, testingshire, TE57 1NG',
        email_address: 'testEmail@testing.test',
      };
      return request(app).post('/api/donors').send(testUser1).then(() => request(app).post('/api/donors').send(testUser2).expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('bad request - email address already in use');
        })
        .then(() => request(app).get('/api/donors').then(({ body: { donors } }) => {
          expect(donors).toHaveLength(6);
        })));
    });
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

describe('/api/donors/:donator_id', () => {
  describe('GET', () => {
    test('should respond with a single donator object if given a valid token', () => request(app)
      .post('/api/donors/signin')
      .send({
        email_address: 'testemail1',
        password: 'Testuserpassword1',
      }).then(({ body: { accessToken } }) => request(app).get('/api/donors/1').set({ 'x-access-token': accessToken }).expect(200)
        .then(({ body: { donor } }) => expect(donor).toEqual({
          donator_id: 1,
          username: 'TestUser1',
          email_address: 'testemail1',
          address: '1 roady road, Walmley, A111AA',
          lat: 53.804235,
          lng: -1.550362,
        }))));
    test('should respond 404 donator not found when given an incorrect id', () => request(app).get('/api/donors/99999').expect(404).then(({ body: { msg } }) => {
      expect(msg).toBe('404 - Donator Not Found');
    }));
    test('should respond 400 Invalid Donator Id if given an invalid Id format', () => request(app).get('/api/donors/notAnId').expect(400).then(({ body: { msg } }) => {
      expect(msg).toBe('400 - Invalid Donator Id');
    }));
    test('should respond 401 - Unathorized Token if given a token not signed with the correct secret', () => request(app).get('/api/donors/1').set({ 'x-access-token': 'NotAnAuthorizedToken' }).expect(401)
      .then(({ body }) => {
        expect(body).toEqual({ msg: '401 - Unauthorized Token' });
      }));
    test('should respond 403 - No Access Token Provided if not given a token on request', () => request(app).get('/api/donors/1').expect(403).then(({ body }) => {
      expect(body).toEqual({ msg: 'No Access Token Provided' });
    }));
    test('should respond 403 - Token and User Id do not match if given a valid token but for a different user', () => request(app)
      .post('/api/donors/signin')
      .send({
        email_address: 'testemail1',
        password: 'Testuserpassword1',
      }).then(({ body: { accessToken } }) => request(app).get('/api/donors/2').set({ 'x-access-token': accessToken }).expect(403)
        .then(({ body }) => expect(body).toEqual({ msg: 'Token and User Id do not match' }))));
  });
});

// CHARITY TESTS
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
    test('should not allow a charity to signup with the same email', () => {
      const testCharity2 = {
        charity_name: 'OtherCharity',
        address: '2 test street, test town, testingshire, TE57 1NG',
        charity_website: 'www.iamaSecondcharity.com',
        password: 'TestPasswordYetAnotherTestPassword',
        email_address: 'testEmail@testing.test',
      };
      return request(app).post('/api/charities').send(testCharity).then(() => request(app).post('/api/charities').send(testCharity2).expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('bad request - email address already in use');
        })
        .then(() => request(app).get('/api/charities').then(({ body: { charities } }) => {
          expect(charities).toHaveLength(6);
        })));
    });
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

describe('/api/charities/:charity_id', () => {
  describe('GET', () => {
    test('should respond with a single charity object if given a valid access token', () => request(app).get('/api/charities/1').expect(200).then(({ body }) => {
      expect(body.charity).toEqual({
        charity_id: 1,
        charity_name: 'Charity 1',
        address: '1 charity road, location1, A666AA',
        charity_website: 'testcharitywebsite1',
        email_address: 'testEmail1',
        lat: 53.804235,
        lng: -1.550362,
      });
    }));
    test('should respond 404 - Charity not found if given an id that does not exist', () => request(app).get('/api/charities/999999').expect(404).then(({ body: { msg } }) => {
      expect(msg).toBe('404 - Charity Not Found');
    }));
    test('should respond 400 - Invalid Charity Id if given an invalid id format', () => request(app).get('/api/charities/notAnId').expect(400).then(({ body: { msg } }) => {
      expect(msg).toBe('400 - Invalid Charity Id');
    }));
  });
  describe('DELETE', () => {
    test('Status (204), responds with an empty response body', () => request(app)
      .delete('/api/charities/1')
      .expect(204));
  });
});

// DONOR DONATION TESTS
describe('api/:donator_id/donations', () => {
  describe('GET', () => {
    test('Status (200), responds with an array of donator donations', () => request(app)
      .get('/api/4/donations')
      .expect(200)
      .then((response) => {
        response.body.donatorDonations.forEach((donatorDonation) => {
          expect(donatorDonation).toEqual(
            expect.objectContaining({
              donation_id: expect.any(Number),
              donator_id: expect.any(Number),
              category_name: expect.any(String),
              item_id: expect.any(Number),
              quantity_available: expect.any(Number),
              created_at: expect.any(String),
              item_name: expect.any(String),
              charity_name: expect.any(String),
              urgent: expect.any(Boolean),
            }),
          );
        });
      }));
    test('Status(404), responds with an error if donator_id doesn\'t exist', () => request(app)
      .get('/api/9999/donations')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('Not found - donator ID doesn\'t exist');
      }));
  });

  describe('POST', () => {
    const testRequest = {
      category_name: 'food',
      item_id: 1,
      quantity_available: 10,
      charity_id: 1,
      urgent: true,
    };
    test('Status (201), posts a new donation', () => request(app)
      .post('/api/1/donations')
      .send(testRequest).expect(201)
      .then((response) => {
        expect(response.body.donatorDonationObject).toBeInstanceOf(Object);
        expect(response.body.donatorDonationObject).toEqual(expect.objectContaining({
          donation_id: 11,
          donator_id: 1,
          category_name: 'food',
          item_id: 1,
          quantity_available: 10,
          created_at: expect.any(String),
          urgent: true,
        }));
      }));
  });

  describe('PATCH', () => {
    const testRequest = {
      donation_id: '1',
      quantity_available: '5',
    };
    test('status(200), update quantity of the donor donations', () => request(app)
      .patch('/api/1/donations')
      .send(testRequest).expect(200)
      .then((response) => {
        expect(response.body.donatorDonationsObject).toBeInstanceOf(Object);
        expect(response.body.donatorDonationsObject).toEqual(expect.objectContaining({
          quantity_available: 20,
          donation_id: 1,
          donator_id: 1,
          category_name: 'food',
          item_id: 2,
          created_at: expect.any(String),
        }));
      }));
  });

  describe('DELETE', () => {
    // eslint-disable-next-line jest/expect-expect
    test('Status(204), responds with an empty response body', () => request(app)
      .delete('/api/donations/1')
      .expect(204));
    test('status(404), responds with an error if donation_id doesn\'t exist', () => request(app)
      .delete('/api/donations/9999')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('Not found - donation ID doesn\'t exist');
      }));
  });
});

// CHARITY REQUIREMENTS TESTS
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
          item_name: expect.any(String),
        }]);
      }));
  });

  describe('POST', () => {
    const testRequest = {
      category_name: 'food',
      item_id: '1',
      quantity_required: '200',
      urgent: true,
    };
    test('Status (201), adds a foodbank\'s requirement to the database', () => request(app)
      .post('/api/1/requirements')
      .send(testRequest).expect(201)
      .then((response) => {
        expect(response.body.charityRequirementObject).toBeInstanceOf(Object);
        expect(response.body.charityRequirementObject).toEqual(expect.objectContaining({
          category_name: 'food',
          charity_id: 1,
          created_at: expect.any(String),
          item_id: 1,
          quantity_required: 200,
          request_id: expect.any(Number),
          urgent: true,
        }));
      }));
  });

  describe('PATCH', () => {
    const testRequest = {
      request_id: '1',
      quantity_required: '100',
    };
    test('Status(200), update quantity of the charity requirement', () => request(app)
      .patch('/api/1/requirements')
      .send(testRequest).expect(200)
      .then((response) => {
        expect(response.body.charityRequirementObject).toBeInstanceOf(Object);
        expect(response.body.charityRequirementObject).toEqual(expect.objectContaining({
          category_name: 'food',
          charity_id: 1,
          created_at: expect.any(String),
          item_id: 1,
          quantity_required: 120,
          request_id: 1,
          urgent: false,
        }));
      }));
  });

  describe('DELETE', () => {
    // eslint-disable-next-line jest/expect-expect
    test('Status(204), responds with an empty response body', () => request(app)
      .delete('/api/requirements/1')
      .expect(204));
    test('status(404), responds with an error if request_id doesn\'t exist', () => request(app)
      .delete('/api/requirements/9999')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('Not found - request ID doesn\'t exist');
      }));
  });
});
describe('/api/charities/donations/:charity_id', () => {
  describe('GET', () => {
    test('Status(200), responds with an array of donor pledges for the specified charity_id', () => request(app)
      .get('/api/charities/donations/1')
      .expect(200)
      .then((response) => {
        response.body.donorPledges.forEach((donorPledge) => {
          expect(donorPledge).toEqual(
            expect.objectContaining({
              donator_id: expect.any(Number),
              donation_id: expect.any(Number),
              username: expect.any(String),
              category_name: expect.any(String),
              item_id: expect.any(Number),
              item_name: expect.any(String),
              quantity_available: expect.any(Number),
            }),
          );
        });
      }));
  });
});
describe('/api/categories', () => {
  describe('GET', () => {
    test('status(200), responds with an array of categories', () => request(app)
      .get('/api/categories')
      .expect(200)
      .then((response) => {
        expect(response.body.categories).toHaveLength(6);
        response.body.categories.forEach((category) => {
          expect(category).toEqual(
            expect.objectContaining({
              category_id: expect.any(Number),
              category_name: expect.any(String),
            }),
          );
        });
      }));
  });
});

describe('/api/items/:category_id', () => {
  describe('GET', () => {
    test('status(200), responds with an array of items', () => request(app)
      .get('/api/items/1')
      .expect(200)
      .then((response) => {
        expect(response.body.items).toHaveLength(3);
        response.body.items.forEach((item) => {
          expect(item).toEqual(
            expect.objectContaining({
              category_id: expect.any(Number),
              category_name: expect.any(String),
              item_id: expect.any(Number),
              item_name: expect.any(String),
            }),
          );
        });
      }));
  });
});
