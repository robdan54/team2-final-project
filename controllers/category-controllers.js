const { fetchCategories } = require('../models/category-models');

exports.getCategories = (req, res, next) => {
  const { category_id } = req.params;
  fetchCategories(category_id)
    .then((categories) => {
      res.status(200).send({ categories });
    })
    .catch(next);
};
