const db = require('../db/connection');

exports.fetchItems = (category_id) => db.query('SELECT * FROM categories JOIN items ON categories.category_name = items.category_name WHERE categories.category_id = $1;', [category_id])
  .then((result) => result.rows);
