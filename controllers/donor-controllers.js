const { fetchDonors } = require('../models/donor-models');

exports.getDonors = (req, res, next) => {
  fetchDonors()
    .then((donors) => {
      res.status(200).send({ donors });
    })
    .catch((err) => {
      next(err);
    });
};
