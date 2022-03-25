const jwt = require('jsonwebtoken');
const { fetchDonors, postDonor, verifyDonorInfo } = require('../models/donor-models');
const config = require('../config/auth.config');

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

exports.signInDonor = (req, res, next) => {
  verifyDonorInfo(req.body).then(({ donator_id, valid }) => {
    if (valid) {
      const token = jwt.sign({ donator_id }, config.secret, { expiresIn: 86400 }); // 24 hour token
      res.status(202).send({ donator_id, accessToken: token });
    }
  }).catch(next);
};
