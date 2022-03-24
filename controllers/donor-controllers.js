const { fetchDonors, fetchCharities } = require('../models/donor-models');

exports.getDonors = (req, res, next) => {
  fetchDonors()
    .then((donors) => {
      res.status(200).send({ donors });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCharities = (req, res, next) => {
  fetchCharities()
    .then((charities) => {
      res.status(200).send({ charities });
    })
    .catch((err) => {
      next(err);
    });
};
