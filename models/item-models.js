const db = require('../db/connection');

exports.fetchItems = (category_id) => db.query('SELECT item_id, item_name, categories.category_id, items.category_name FROM items JOIN categories ON items.category_name = categories.category_name WHERE items.category_name = $1;', [category_id]);
