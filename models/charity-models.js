const bcrypt = require('bcrypt');
const db = require('../db/connection');

exports.fetchCharities = (lat = 53.80754277823678, lng = -1.5484416213022532) => db.query('SELECT charity_id, charity_name, address, charity_website, email_address, lat, lng, ROUND (( 6371000 * acos( cos( radians(lat) ) * cos( radians( $1) ) * cos( radians($2 ) - radians(lng) ) + sin( radians(lat) ) * sin( radians($1))))) AS distance FROM charities_users;', [lat, lng]).then((result) => result.rows);

exports.postCharity = async (charity) => {
  const {
    charity_name, address, charity_website, charity_username, password, email_address, lat, lng,
  } = charity;

  const { rows: [charityRow] } = await db.query(`INSERT INTO charities_users
              (charity_name, address, charity_website, charity_username, password, email_address, lat, lng)
          VALUES
              ($1, $2, $3, $4, $5, $6, $7, $8)
  
          RETURNING *;
          `, [charity_name, address, charity_website, charity_username, bcrypt.hashSync(password, 2), email_address, lat, lng]);
  return charityRow;
};

exports.verifyCharityInfo = async ({ username, password }) => {
  const { rows: [validUser] } = await db.query(`
      SELECT charity_id, password FROM charities_users WHERE username = $1;
  `, [username]);

  const valid = await bcrypt.compare(password, validUser.password);

  return { charity_id: validUser.charity_id, valid };
};
