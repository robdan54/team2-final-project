const cors = require('cors');
const express = require('express');
const { getDonors } = require('./controllers/donor-controllers');

const app = express();

app.use(cors());

app.use(express.json());

app.get('/api/donors', getDonors);

module.exports = app;
