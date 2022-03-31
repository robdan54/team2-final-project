const jwt = require('jsonwebtoken');

const {
  fetchDonors,
  postDonor,
  verifyDonorInfo,
  patchDonations,
  removeDonorDonation,
  fetchDonorDonations,
  fetchDonorById,
  postDonation,
  removeDonorById
} = require('../models/donor-models');

const config = require('../config/auth.config');
const { verifyDonorToken } = require('../models/auth');
const { doesUserEmailExist, checkDonorDonationExists, checkDonorExists } = require('../models/utils');

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

exports.sendDonation = (req, res, next) => {
  const { donator_id } = req.params;
  postDonation(donator_id, req.body)
    .then((donatorDonationObject) => {
      res.status(201).send({ donatorDonationObject });
    })
    .catch((err) => {
      next(err);
    });
};

exports.updateDonations = (req, res, next) => {
  const { donator_id } = req.params;
  patchDonations(donator_id, req.body)
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

exports.getDonorById = (req, res, next) => {
  const { donator_id } = req.params;
  if (!Number.parseInt(donator_id, 10)) res.status(400).send({ msg: '400 - Invalid Donator Id' });
  fetchDonorById(donator_id).then((donor) => {
    verifyDonorToken(req).catch(next);
    return donor;
  }).then((donor) => res.status(200).send({ donor })).catch(next);
};

exports.getDonorDonations = (req, res, next) => {
  const { donator_id } = req.params;

  checkDonorExists(donator_id).then(() => fetchDonorDonations(donator_id))
    .then((response) => {
      res.status(200).send({ donatorDonations: response });
    })
    .catch(next);
};

exports.deleteDonorById = (req, res, next) => {
  const { donator_id } = req.params;
  checkDonorExists(donator_id)
    .then(() => {
      removeDonorById(donator_id);
    })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};