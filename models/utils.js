/* eslint-disable prefer-promise-reject-errors */
const axios = require('axios');
const dotenv = require('dotenv');
const db = require('../db/connection');

exports.convertToLatLng = (address) => {
  const encAddress = encodeURIComponent(address);
  return axios.get(`https://api.myptv.com/geocoding/v1/locations/by-text?searchText=${encAddress}&apiKey=${dotenv.config().parsed.API_KEY}`).then(({ data }) => data.locations[0].referencePosition);
};

exports.checkCharityRequestExists = (request_id, next) => db
  .query('SELECT * FROM charity_reqs WHERE request_id = $1;', [request_id])
  .then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: 'Not found - request ID doesn\'t exist' });
    }
    return rows;
  })
  .catch(next);
