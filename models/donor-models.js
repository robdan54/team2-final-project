const db = require('../db/connection');

exports.fetchDonors = () => db.query('SELECT username, donator_id FROM donators_users;').then((result) => result.rows);
