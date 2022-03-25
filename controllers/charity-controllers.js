const { fetchCharities, postCharity } = require('../models/charity-models');

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
  postCharity(body).then((charity) => {
    res.status(201).send({ charity });
  }).catch(next);
};
