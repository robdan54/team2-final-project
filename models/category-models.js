const db = require('../db/connection');

exports.fetchCategories = () => db.query('SELECT * FROM categories;')
  .then((result) => result.rows);
