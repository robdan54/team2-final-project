const bcrypt = require('bcrypt');
const db = require('../db/connection');

// returns a list of all charities

exports.fetchCharities = () => db.query('SELECT charity_id, charity_name, address, charity_website, email_address FROM charities_users;').then((result) => result.rows);

// posts a new charity with an encrypted password

exports.postCharity = async (charity) => {
  const {
    charity_name, address, charity_website, password, email_address,
  } = charity;

  const { rows: [charityRow] } = await db.query(`INSERT INTO charities_users
              (charity_name, address, charity_website, password, email_address)
          VALUES
              ($1, $2, $3, $4, $5)
  
          RETURNING *;
          `, [charity_name, address, charity_website, bcrypt.hashSync(password, 2), email_address]);
  // eslint-disable-next-line prefer-promise-reject-errors
  if (!charityRow) return Promise.reject({ status: 400, msg: 'invalid credentials' }).catch(console.log);

  return charityRow;
};

// checks if a username and password matches that of the database

exports.verifyCharityInfo = async ({ email_address, password }) => {
  const { rows: [validUser] } = await db.query(`
      SELECT charity_id, password FROM charities_users WHERE email_address = $1;
  `, [email_address]);

  // eslint-disable-next-line prefer-promise-reject-errors
  if (!validUser) return Promise.reject({ status: 400, msg: 'invalid username' });

  const valid = await bcrypt.compare(password, validUser.password);

  return { charity_id: validUser.charity_id, valid };
};
