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

// patch a donation

exports.patchDonations = (requirement) => {
  const { donation_id, quantity_available } = requirement;

  return db.query('UPDATE donator_items SET quantity_available = quantity_available + $1 WHERE donation_id = $2 RETURNING *', [quantity_available, donation_id])
    .then((result) => result.rows[0]);
};
