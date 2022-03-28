const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const { fetchCharities, postCharity, verifyCharityInfo } = require('../models/charity-models');

// handles the get charities endpoint

exports.getCharities = (req, res, next) => {
  const { lat, lng } = req.query;
  fetchCharities(lat, lng)
    .then((charities) => {
      res.status(200).send({ charities });
    })
    .catch((err) => {
      next(err);
    });
};

// handles the send charity endpoint

exports.sendCharity = (req, res, next) => {
  const { body } = req;
  postCharity(body).then((charity) => {
    res.status(201).send({ charity });
  }).catch(next);
};

// handles the sign-in endpoint

exports.signInCharity = (req, res, next) => {
  if (!req.body.email_address && !req.body.password) res.status(400).send({ msg: 'please provide an email address and password' });
  verifyCharityInfo(req.body).then(({ charity_id, valid }) => {
    if (valid) {
      const token = jwt.sign({ charity_id }, config.secret, { expiresIn: 86400 }); // 24 hour token
      res.status(202).send({ charity_id, accessToken: token });
    } else { res.status(401).send({ msg: 'invalid password' }); }
  }).catch(next);
};
