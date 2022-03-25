const bcrypt = require('bcrypt');
const db = require('../db/connection');

exports.fetchDonors = () => db.query('SELECT username, donator_id FROM donators_users;').then((result) => result.rows);

exports.postDonor = async (donor) => {
  const {
    username, password, email_address, address,
  } = donor;

  const { rows: [donorRow] } = await db.query(`INSERT INTO donators_users
            (username, password, email_address, address)
        VALUES
            ($1, $2, $3, $4)

        RETURNING *;
        `, [username, bcrypt.hashSync(password, 2), email_address, address]);
  return donorRow;
};

exports.verifyDonorInfo = async ({ username, password }) => {
  const { rows: [validUser] } = await db.query(`
      SELECT donator_id, password FROM donators_users WHERE username = $1;
  `, [username]);

  const valid = await bcrypt.compare(password, validUser.password);

  return { donator_id: validUser.donator_id, valid };
};
