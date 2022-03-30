const { fetchItems } = require('../models/item-models');

exports.getItems = (req, res, next) => {
  const { category_id } = req.params;
  fetchItems(category_id)
    .then((items) => {
      res.status(200).send({ items });
    })
    .catch(next);
};
