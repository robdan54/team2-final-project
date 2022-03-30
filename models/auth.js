/* eslint-disable prefer-promise-reject-errors */
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

exports.verifyDonorToken = (req) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return Promise.reject({ status: 403, msg: 'No Access Token Provided' });
  }
  return jwt.verify(token, config.secret, (err, decoded) => {
    if (err) return Promise.reject({ status: 401, msg: '401 - Unauthorized Token' });
    if (decoded.donator_id !== Number.parseInt(req.params.donator_id, 10)) return Promise.reject({ status: 403, msg: 'Token and User Id do not match' });
    return Promise.resolve(true);
  });

//   if (decoded.charity_id === Number.parseInt(req.params.charity_id, 10)) {
//     return Promise.resolve(true);
//   }
//   return Promise.reject({ status: 401, msg: 'Token and User Id do not match' });
};
