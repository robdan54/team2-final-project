const mongoose = require('mongoose');
const db = require('./db/connection');

const { Schema } = mongoose;

//  drops database

db.dropDatabase(() => {
  console.log("dropped database - I hope you know what you're doing");
});

//  defines a 'schema' which is a template for a collection (table)

const CharityUserSchema = new Schema({
  charityName: String,
  address: String,
  charityWebsite: String,
  charityUsername: String,
  password: String,
  emailAddress: String,
});

//  creates the 'Charities' collection using the CharityUserScheme defined above

const Charity = mongoose.model('Charities', CharityUserSchema);

//  creates a instance of the charity model (a document (record) in a collection)

const testInstance = new Charity({
  charityName: 'Charity 1',
  address: '1 charity road, location1, A666AA',
  charityWebsite: 'testcharitywebsite1',
  charityusername: 'CharityUser1',
  password: 'TestCharityPassword1',
  emailAddress: 'testEmail1',
});

//  saves the document (record) to the Charities collection (table) defined by the model in line 25

testInstance.save(() => {
  db.close();
});
