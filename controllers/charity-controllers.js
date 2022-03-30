const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const {
  fetchCharities,
  postCharity,
  verifyCharityInfo,
  fetchCharityRequirements,
  postCharityRequirement,
  patchCharityRequirement,
  removeCharityRequest,
  fetchCharityById,
  fetchDonorPledges,
} = require('../models/charity-models');

const { doesUserEmailExist, checkCharityRequestExists } = require('../models/utils');

// handles the get charities endpoint

exports.getCharities = (req, res, next) => {
  const { lat, lng, range } = req.query;
  fetchCharities(lat, lng, range)
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

  doesUserEmailExist(body.email_address, 'charities_users').then(() => {
    postCharity(body)
      .then((charity) => {
        res.status(201).send({ charity });
      });
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

exports.sendCharityRequirement = (req, res, next) => {
  const { charity_id } = req.params;
  postCharityRequirement(charity_id, req.body)
    .then((charityRequirementObject) => {
      res.status(201).send({ charityRequirementObject });
    })
    .catch((err) => {
      next(err);
    });
};

exports.updateCharityRequirement = (req, res, next) => {
  const { charity_id } = req.params;
  patchCharityRequirement(charity_id, req.body)
    .then((charityRequirementObject) => {
      res.status(200).send({ charityRequirementObject });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteCharityRequest = (req, res, next) => {
  const { request_id } = req.params;
  checkCharityRequestExists(request_id)
    .then((removeCharityRequest(request_id)))
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};

exports.getCharityById = (req, res, next) => {
  const { charity_id } = req.params;
  if (!Number.parseInt(charity_id, 10)) res.status(400).send({ msg: '400 - Invalid Charity Id' });
  fetchCharityById(charity_id).then((charity) => res.status(200).send({ charity })).catch(next);
};

exports.getDonorPledges = (req, res, next) => {
  const { charity_id } = req.params;
  fetchDonorPledges(charity_id)
    .then((donorPledges) => {
      console.log(donorPledges);
      res.status(200).send({ donorPledges });
    })
    .catch(next);
};
