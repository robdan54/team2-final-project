/* eslint-disable prefer-promise-reject-errors */
const bcrypt = require('bcrypt');
const db = require('../db/connection');
const { convertToLatLng } = require('./utils');

exports.fetchCharities = (lat = 53.80754277823678, lng = -1.5484416213022532, range = 10000000000000000000) => db.query('SELECT charity_id, charity_name, address, charity_website, email_address, lat, lng, ROUND (( 6371000 * acos( cos( radians(lat) ) * cos( radians( $1) ) * cos( radians($2 ) - radians(lng) ) + sin( radians(lat) ) * sin( radians($1))))) AS distance FROM charities_users WHERE ROUND (( 6371000 * acos( cos( radians(lat) ) * cos( radians( $1) ) * cos( radians($2 ) - radians(lng) ) + sin( radians(lat) ) * sin( radians($1))))) < $3 ORDER BY distance;', [lat, lng, range]).then((result) => result.rows);

// posts a new charity with an encrypted password

exports.postCharity = async (charity) => {
  const {
    charity_name, address, charity_website, password, email_address,
  } = charity;

  const latLng = await convertToLatLng(address);

  const { rows: [charityRow] } = await db.query(`INSERT INTO charities_users
              (charity_name, address, charity_website, password, email_address, lat, lng)

          VALUES
              ($1, $2, $3, $4, $5, $6, $7)
  
          RETURNING *;
          `, [charity_name, address, charity_website, bcrypt.hashSync(password, 2), email_address, latLng.latitude, latLng.longitude]);

  // console.log(charityRow);

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

exports.fetchCharityRequirements = (charity_id) => db
  .query('SELECT * FROM charity_reqs WHERE charity_id = $1;', [charity_id])
  .then((result) => result.rows);

exports.postCharityRequirement = (charity_id, requirement) => {
  const { category_name, item_id, quantity_required } = requirement;

  return db.query('INSERT INTO charity_reqs (charity_id, category_name, item_id, quantity_required) VALUES ($1, $2, $3, $4) RETURNING *;', [charity_id, category_name, item_id, quantity_required])
    .then((result) => result.rows[0]);
};

exports.patchCharityRequirement = (charity_id, requirement) => {
  const { request_id, quantity_required } = requirement;

  return db.query('UPDATE charity_reqs SET quantity_required = quantity_required + $1 WHERE request_id = $2 RETURNING *;', [quantity_required, request_id])
    .then((result) => result.rows[0]);
};

exports.removeCharityRequest = (request_id) => db.query('DELETE FROM charity_reqs where request_id = $1;', [request_id]);

exports.fetchCharityById = (charity_id) => db.query('SELECT charity_id, charity_name, address, charity_website, email_address, lat, lng FROM charities_users WHERE charity_id = $1;', [charity_id]).then(({ rows }) => {
  if (rows.length !== 1) return Promise.reject({ status: 404, msg: '404 - Charity Not Found' });
  return rows[0];
});
