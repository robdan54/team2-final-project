const mongoose = require('mongoose');

const mongoDB = 'mongodb://127.0.0.1/test';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: String,
  password: String,
  emailAddress: String,
  PostCode: String,
});

const User = mongoose.model('User', UserSchema);

const testInstance = new User({
  username: 'Testuser',
  password: 'Testuserpassword',
  emailAddress: 'testemail',
  PostCode: 'B111BB',
});

testInstance.save();
