/* eslint-disable prefer-promise-reject-errors */
const axios = require('axios');
const dotenv = require('dotenv');
const db = require('../db/connection');

exports.convertToLatLng = (address) => {
  const encAddress = encodeURIComponent(address);
  return axios.get(`https://api.myptv.com/geocoding/v1/locations/by-text?searchText=${encAddress}&apiKey=${dotenv.config().parsed.API_KEY}`).then(({ data }) => data.locations[0].referencePosition);
};

exports.doesUserEmailExist = (email, role) => db.query(`SELECT * FROM ${role} WHERE email_address = $1`, [email]).then(({ rows }) => {
  if (rows.length !== 0) return Promise.reject({ status: 400, msg: 'bad request - email address already in use' });
  return rows;
});

exports.checkCharityRequestExists = (request_id) => db
  .query('SELECT * FROM charity_reqs WHERE request_id = $1;', [request_id])
  .then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: 'Not found - request ID doesn\'t exist' });
    }
    return rows;
  });

exports.checkDonorDonationExists = (donation_id) => db
  .query('SELECT * FROM donator_items WHERE donation_id = $1;', [donation_id])
  .then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: 'Not found - donation ID doesn\'t exist' });
    }
    return rows;
  });

exports.checkDonorExists = (donator_id) => db
  .query('SELECT * FROM donators_users WHERE donator_id = $1;', [donator_id])
  .then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: 'Not found - donator ID doesn\'t exist' });
    }
    return rows;
  });

exports.checkCharityIdExists = (charity_id) => db
  .query('SELECT * FROM charities_users WHERE charity_id = $1;', [charity_id])
  .then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: 'Not found - charity Id doesn\'t exist' });
    }
    return rows;
  });
