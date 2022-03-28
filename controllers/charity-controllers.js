const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const {
  fetchCharities,
  postCharity,
  verifyCharityInfo,
  fetchCharityRequirements,
} = require('../models/charity-models');

exports.getCharities = (req, res, next) => {
  fetchCharities()
    .then((charities) => {
      res.status(200).send({ charities });
    })
    .catch((err) => {
      next(err);
    });
};

exports.sendCharity = (req, res, next) => {
  const { body } = req;
  postCharity(body)
    .then((charity) => {
      res.status(201).send({ charity });
    })
    .catch(next);
};

exports.signInCharity = (req, res, next) => {
  if (!req.body.username && !req.body.password)
    res.status(400).send({ msg: 'please provide a username and password' });
  verifyCharityInfo(req.body)
    .then(({ charity_id, valid }) => {
      if (valid) {
        const token = jwt.sign({ charity_id }, config.secret, {
          expiresIn: 86400,
        }); // 24 hour token
        res.status(202).send({ charity_id, accessToken: token });
      } else {
        res.status(401).send({ msg: 'invalid password' });
      }
    })
    .catch(next);
};

exports.getCharityRequirements = (req, res, next) => {
  const { charity_id } = req.params;
  fetchCharityRequirements(charity_id)
    .then((charityRequirements) => {
      res.status(200).send({ charityRequirements });
    })
    .catch((err) => {
      next(err);
    });
};
