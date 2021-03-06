/* eslint-disable prefer-promise-reject-errors */
const bcrypt = require('bcrypt');
const db = require('../db/connection');
const { convertToLatLng } = require('./utils');

// gets a list of all donors

exports.fetchDonors = () => db.query('SELECT username, donator_id FROM donators_users;').then((result) => result.rows);

// posts a new donor with an encrypted password

exports.postDonor = async (donor) => {
  const {
    username, password, email_address, address,
  } = donor;

  const latLng = await convertToLatLng(address);

  const { rows: [donorRow] } = await db.query(`INSERT INTO donators_users
            (username, password, email_address, address, lat, lng)
        VALUES
            ($1, $2, $3, $4, $5, $6)

        RETURNING *;
        `, [username, bcrypt.hashSync(password, 2), email_address, address, latLng.latitude, latLng.longitude]);
  return donorRow;
};

// checks if the username and password given matches those stored and gives an authorization token

exports.verifyDonorInfo = async ({ email_address, password }) => {
  const { rows: [validUser] } = await db.query(`
      SELECT donator_id, password FROM donators_users WHERE email_address = $1;
  `, [email_address]);

  // eslint-disable-next-line prefer-promise-reject-errors
  if (!validUser) return Promise.reject({ status: 400, msg: 'invalid username' });

  const valid = await bcrypt.compare(password, validUser.password);

  return { donator_id: validUser.donator_id, valid };
};

exports.removeDonorDonation = (donation_id) => db.query('DELETE FROM donator_items WHERE donation_id = $1;', [donation_id]);

exports.fetchDonorById = (donator_id) => db.query('SELECT donator_id, username, email_address, address, lat, lng FROM donators_users WHERE donator_id = $1', [donator_id]).then(({ rows }) => {
  if (rows.length !== 1) return Promise.reject({ status: 404, msg: '404 - Donator Not Found' });
  return rows[0];
});

// POST A DONATION

exports.postDonation = (donator_id, donation) => {
  const {
    category_name, item_id, quantity_available, charity_id, urgent,
  } = donation;

  return db.query('INSERT INTO donator_items (donator_id, category_name, item_id, quantity_available, charity_id, urgent) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;', [donator_id, category_name, item_id, quantity_available, charity_id, urgent])
    .then((result) => result.rows[0]);
};

// PATCH A DONATION

exports.patchDonations = (donator_id, requirement) => {
  const { donation_id, quantity_available } = requirement;

  return db.query('UPDATE donator_items SET quantity_available = quantity_available + $1 WHERE donation_id = $2 RETURNING *', [quantity_available, donation_id])
    .then((result) => result.rows[0]);
};

exports.removeDonorDonation = (donation_id) => db.query('DELETE FROM donator_items where donation_id = $1;', [donation_id]);

exports.fetchDonorDonations = (donator_id) => db
  .query('SELECT donator_id, donation_id, donator_items.category_name, donator_items.item_id, donator_items.charity_id, quantity_available, created_at, item_name, charity_name, urgent FROM donator_items JOIN items ON donator_items.item_id = items.item_id JOIN charities_users ON donator_items.charity_id = charities_users.charity_id WHERE donator_id = $1;', [donator_id])
  .then((results) => results.rows);
