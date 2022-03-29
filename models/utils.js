/* eslint-disable prefer-promise-reject-errors */
const axios = require('axios');
const dotenv = require('dotenv');
const db = require('../db/connection');

exports.convertToLatLng = (address) => {
  const encAddress = encodeURIComponent(address);
  return axios.get(`https://api.myptv.com/geocoding/v1/locations/by-text?searchText=${encAddress}&apiKey=${dotenv.config().parsed.API_KEY}`).then(({ data }) => data.locations[0].referencePosition);
};

exports.doesUserEmailExist = (email, role) => db.query(`SELECT * FROM ${role} WHERE email_address = $1`, [email]).then(({ rows }) => {
    console.log(rows)
  if (rows.length !== 0) return Promise.reject({ status: 400, msg: 'bad request - email address already in use' });
  return rows;
});
