const mongoose = require('mongoose');
const db = require('./db/connection');

const { Schema } = mongoose;

db.dropDatabase(() => {
  console.log("dropped database - I hope you know what you're doing");
});
// db.dropCollection('users', () => {
//   console.log('users collection dropped');
// });

const CharityUserSchema = new Schema({
  charityName: String,
  address: String,
  charityWebsite: String,
  charityUsername: String,
  password: String,
  emailAddress: String,
});

const User = mongoose.model('User', CharityUserSchema);

const testInstance = new User({
  username: 'Testuser1',
  password: 'Testuserpassword',
  emailAddress: 'testemail',
  PostCode: 'B111BB',
});

testInstance.save(() => {
  db.close();
});
