const testData = require('../db/data/test-data');
const mongoose = require('mongoose')
const seed = require('../db/seed');
const db = require('../db/connection');

beforeEach(() => seed(testData));

afterAll(() => {
	db.close();
});


describe('Name of the group', () => {
  test('should ', () => {
    expect(true).toBe(true);
  });
});
