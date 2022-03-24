const db = require('../db/connection');

exports.fetchDonors = () => db.query('SELECT username, donator_id FROM donators_users;').then((result) => result.rows);

exports.postDonor = async (donor) => {

    const {username, password, email_address, address} = donor

    const {rows: [donorRow]} = await db.query(
        `INSERT INTO donators_users
            (username, password, email_address, address)
        VALUES
            ($1, $2, $3, $4)

        RETURNING *;
        `, [username, password, email_address, address]
    )
    return donorRow
}

