const db = require('../db/connection');

exports.fetchCharities = () => db.query('SELECT charity_id, charity_name, address, charity_website, email_address FROM charities_users;').then((result) => result.rows);
