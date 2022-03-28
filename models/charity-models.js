const bcrypt = require('bcrypt');
const db = require('../db/connection');
const { convertToLatLng } = require('./utils');


exports.fetchCharities = (lat = 53.80754277823678, lng = -1.5484416213022532, range = 5000) => db.query('SELECT charity_id, charity_name, address, charity_website, email_address, lat, lng, ROUND (( 6371000 * acos( cos( radians(lat) ) * cos( radians( $1) ) * cos( radians($2 ) - radians(lng) ) + sin( radians(lat) ) * sin( radians($1))))) AS distance FROM charities_users WHERE ROUND (( 6371000 * acos( cos( radians(lat) ) * cos( radians( $1) ) * cos( radians($2 ) - radians(lng) ) + sin( radians(lat) ) * sin( radians($1))))) < $3 ORDER BY distance;', [lat, lng, range]).then((result) => result.rows);


// posts a new charity with an encrypted password

exports.postCharity = async (charity) => {
  const {
    charity_name, address, charity_website, charity_username, password, email_address,
  } = charity;

  const latLng = await convertToLatLng(address);

  // console.log(latLng)

  const { rows: [charityRow] } = await db.query(`INSERT INTO charities_users
              (charity_name, address, charity_website, password, email_address, lat, lng)

          VALUES
              ($1, $2, $3, $4, $5, $6, $7)
  
          RETURNING *;
          `, [charity_name, address, charity_website, bcrypt.hashSync(password, 2), email_address, latLng.latitude, latLng.longitude]);

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

exports.fetchCharityRequirements = (charity_id) =>
  db
    .query('SELECT * FROM charity_reqs WHERE charity_id = $1;', [charity_id])
    .then((result) => result.rows);
