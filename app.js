// Cors module
const cors = require('cors');
const express = require('express');

// Donor controller functions
const {
  getDonors,
  sendDonor,
  signInDonor,
  deleteDonorDonation,
} = require('./controllers/donor-controllers');

// Charity controller functions
const {
  getCharities,
  sendCharity,
  signInCharity,
  getCharityRequirements,
  sendCharityRequirement,
  updateCharityRequirement,
  deleteCharityRequest,
} = require('./controllers/charity-controllers');

// Error handling controllers
const {
  handlesCustomErrors,
  handlesPsqlErrors,
  handles500Errors,
} = require('./controllers/error-controller');

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

// donor requirements

app.delete('/api/donations/:donation_id', deleteDonorDonation);

// charity routes

app.get('/api/charities', getCharities);
app.post('/api/charities', sendCharity);
app.post('/api/charities/signin', signInCharity);

// Charities requirements
app.get('/api/:charity_id/requirements', getCharityRequirements);
app.post('/api/:charity_id/requirements', sendCharityRequirement);
app.patch('/api/:charity_id/requirements', updateCharityRequirement);
app.delete('/api/requirements/:request_id', deleteCharityRequest);

// Error handling

app.all('/*', (req, res) => {
  res.status(404).send({ msg: 'Path not found' });
});

app.use(handlesCustomErrors);
app.use(handlesPsqlErrors);
app.use(handles500Errors);

module.exports = app;
