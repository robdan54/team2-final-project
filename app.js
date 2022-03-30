// CORS MODULE
const cors = require('cors');
// EXPRESS MODULE
const express = require('express');

// DONOR CONTROLLER FUNCTIONS
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

// CHARITY CONTROLLER FUNCTIONS
const {
  getCharities,
  sendCharity,
  signInCharity,
  getCharityRequirements,
  sendCharityRequirement,
  updateCharityRequirement,
  deleteCharityRequest,
  getCharityById,
  deleteCharityById,
} = require('./controllers/charity-controllers');

// ERROR HANDLING FUNCTIONS
const {
  handlesCustomErrors,
  handlesPsqlErrors,
  handles500Errors,
} = require('./controllers/error-controller');

const { getApi } = require('./controllers/api-controllers');

const app = express();

// MIDDLEWARE FUNCTIONS

app.use(cors());

app.use(express.json());

// ENDPOINTS

// ALL ENDPOINTS
app.get('/api', getApi);

// DONOR ENDPOINTS
app.get('/api/donors', getDonors);
app.get('/api/donors/:donator_id', getDonorById);
app.post('/api/donors', sendDonor);
app.post('/api/donors/signin', signInDonor);

// CHARITY ENDPOINTS
app.get('/api/charities', getCharities);
app.post('/api/charities', sendCharity);
app.post('/api/charities/signin', signInCharity);
app.get('/api/charities/:charity_id', getCharityById);
app.delete('/api/charities/:charity_id',deleteCharityById);

// DONOR DONATION ENDPOINTS
app.get('/api/:donator_id/donations', getDonorDonations);
app.post('/api/:donator_id/donations', sendDonation);
app.patch('/api/:donator_id/donations', updateDonations);
app.delete('/api/donations/:donation_id', deleteDonorDonation);

// CHARITY REQUIREMENT ENDPOINTS
app.get('/api/:charity_id/requirements', getCharityRequirements);
app.post('/api/:charity_id/requirements', sendCharityRequirement);
app.patch('/api/:charity_id/requirements', updateCharityRequirement);
app.delete('/api/requirements/:request_id', deleteCharityRequest);

// ERROR HANDLING
app.all('/*', (req, res) => {
  res.status(404).send({ msg: 'Path not found' });
});

app.use(handlesCustomErrors);
app.use(handlesPsqlErrors);
app.use(handles500Errors);

module.exports = app;
