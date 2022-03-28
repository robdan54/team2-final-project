const { fetchEndpoints } = require('../models/api-models');

// handles the get api endpoint

exports.getApi = (req, res, next) => {
  fetchEndpoints()
    .then((endpoints) => {
      res.status(200).send({ endpoints });
    })
    .catch((err) => {
      next(err);
    });
};
