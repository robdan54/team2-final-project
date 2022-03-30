// Cors module
const cors = require('cors');
const express = require('express');

// Donor controller functions
const {
  getDonors,
  sendDonor,
  signInDonor,
  sendDonation,
  updateDonations,
  deleteDonorDonation,
  getDonorById,
  getDonorDonations,

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
  getCharityById,
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
app.get('/api/donors/:donator_id', getDonorById);
app.post('/api/donors', sendDonor);
app.post('/api/donors/signin', signInDonor);

// donor donations

app.get('/api/:donator_id/donations', getDonorDonations);
app.post('/api/:donor_id/donations', sendDonation);
app.patch('/api/:donor_id/donations', updateDonations);
app.delete('/api/donations/:donation_id', deleteDonorDonation);

// charity routes

app.get('/api/charities', getCharities);
app.get('/api/charities/:charity_id', getCharityById);
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
