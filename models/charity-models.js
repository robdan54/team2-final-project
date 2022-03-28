const bcrypt = require('bcrypt');
const db = require('../db/connection');

// returns a list of all charities

exports.fetchCharities = () => db.query('SELECT charity_id, charity_name, address, charity_website, email_address FROM charities_users;').then((result) => result.rows);

// posts a new charity with an encrypted password

exports.postCharity = async (charity) => {
  const {
    charity_name, address, charity_website, charity_username, password, email_address,
  } = charity;

  const { rows: [charityRow] } = await db.query(`INSERT INTO charities_users
              (charity_name, address, charity_website, charity_username, password, email_address)
          VALUES
              ($1, $2, $3, $4, $5, $6)
  
          RETURNING *;
          `, [charity_name, address, charity_website, charity_username, bcrypt.hashSync(password, 2), email_address]);
  return charityRow;
};

// checks if a username and password matches that of the database

exports.verifyCharityInfo = async ({ username, password }) => {
  const { rows: [validUser] } = await db.query(`
      SELECT charity_id, password FROM charities_users WHERE username = $1;
  `, [username]);

  const valid = await bcrypt.compare(password, validUser.password);

  return { charity_id: validUser.charity_id, valid };
};
