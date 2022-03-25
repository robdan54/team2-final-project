const { fetchCharities } = require('../models/charity-models');

exports.getCharities = (req, res, next) => {
  fetchCharities()
    .then((charities) => {
      res.status(200).send({ charities });
    })
    .catch((err) => {
      next(err);
    });
};
