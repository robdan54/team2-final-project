const jwt = require('jsonwebtoken');

const {
  fetchDonors, postDonor, verifyDonorInfo, patchDonations, removeDonorDonation,
} = require('../models/donor-models');

const config = require('../config/auth.config');

const { doesUserEmailExist, checkDonorDonationExists } = require('../models/utils');

// handles the get donors endpoint

exports.getDonors = (req, res, next) => {
  fetchDonors()
    .then((donors) => {
      res.status(200).send({ donors });
    })
    .catch((err) => {
      next(err);
    });
};

// handles the send charity endpoint

exports.sendDonor = (req, res, next) => {
  const { body } = req;

  doesUserEmailExist(body.email_address, 'donators_users').then(() => {
    postDonor(body).then((donor) => {
      res.status(201).send({ donor });
    });
  }).catch(next);
};

// handles the sign in donor endpoint

exports.signInDonor = (req, res, next) => {
  if (!req.body.email_address && !req.body.password) res.status(400).send({ msg: 'please provide a username and password' });
  verifyDonorInfo(req.body).then(({ donator_id, valid }) => {
    if (valid) {
      const token = jwt.sign({ donator_id }, config.secret, { expiresIn: 86400 }); // 24 hour token
      res.status(202).send({ donator_id, accessToken: token });
    } else { res.status(401).send({ msg: 'invalid password' }); }
  }).catch(next);
};

// update the donations

exports.updateDonations = (req, res, next) => {
  patchDonations(req.body)
    .then((donatorDonationsObject) => {
      res.status(200).send({ donatorDonationsObject });
    })
    .catch((err) => {
      next(err);
    });
};
  
exports.deleteDonorDonation = (req, res, next) => {
  const { donation_id } = req.params;
  checkDonorDonationExists(donation_id)
    .then((removeDonorDonation(donation_id)))
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};

