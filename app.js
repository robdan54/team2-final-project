const cors = require('cors');
const express = require('express');
const { getDonors, sendDonor, signInDonor } = require('./controllers/donor-controllers');
const { getCharities, sendCharity, signInCharity } = require('./controllers/charity-controllers');
const { handlesCustomErrors, handlesPsqlErrors, handles500Errors } = require('./controllers/error-controller');
const { getApi } = require('./controllers/api-controllers');

const app = express();

// middleware functions

app.use(cors());

app.use(express.json());

// routes

app.get('/api', getApi);

// donor routes

app.get('/api/donors', getDonors);
app.post('/api/donors', sendDonor);
app.post('/api/donors/signin', signInDonor);

// charity routes

app.get('/api/charities', getCharities);
app.post('/api/charities', sendCharity);
app.post('/api/charities/signin', signInCharity);

// error handling

app.all('/*', (req, res) => {
  res.status(404).send({ msg: 'Path not found' });
});

app.use(handlesCustomErrors);
app.use(handlesPsqlErrors);
app.use(handles500Errors);

module.exports = app;
