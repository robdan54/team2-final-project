const { fetchDonors, postDonor } = require('../models/donor-models');

exports.getDonors = (req, res, next) => {
  fetchDonors()
    .then((donors) => {
      res.status(200).send({ donors });
    })
    .catch((err) => {
      next(err);
    });
};

exports.sendDonor = (req, res, next) => {
  const { body } = req;
  postDonor(body).then((donor) => {
    res.status(201).send({ donor });
  }).catch(next);
};
