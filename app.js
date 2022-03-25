const cors = require('cors');
const express = require('express');
const { getDonors, sendDonor } = require('./controllers/donor-controllers');
const { getCharities, sendCharity } = require('./controllers/charity-controllers');
const { handlesCustomErrors, handlesPsqlErrors, handles500Errors } = require('./controllers/error-controller');
const { getApi } = require('./controllers/api-controllers');

const app = express();

app.use(cors());

app.use(express.json());

app.get('/api', getApi);

app.get('/api/donors', getDonors);
app.post('/api/donors', sendDonor);

app.get('/api/charities', getCharities);
app.post('/api/charities', sendCharity);

app.all('/*', (req, res) => {
  res.status(404).send({ msg: 'Path not found' });
});

app.use(handlesCustomErrors);
app.use(handlesPsqlErrors);
app.use(handles500Errors);

module.exports = app;
