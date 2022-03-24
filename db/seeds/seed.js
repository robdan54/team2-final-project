/** @format */

const format = require('pg-format');

const { dropTables, createTables } = require('../helpers/manage-tables');

const db = require('../connection');

const seed = async ({
  categoriesData,
  charityUsersData,
  charityReqsData,
  itemsData,
  donatorItemsData,
  donatorUsersData,
}) => {
  await dropTables();
  await createTables();

  const insertCategoryQueryStr = format(
    'INSERT INTO categories (categoryName) VALUES %L RETURNING *;',
    categoriesData.map(({ categoryName }) => [categoryName]),
  );

  const categoryPromise = db
    .query(insertCategoryQueryStr)
    .then((result) => result.rows);

  const insertCharityQueryStr = format(
    'INSERT INTO charities_users (charityName, address, charityWebsite, charityusername, password, emailAddress ) VALUES %L RETURNING *;',
    charityUsersData.map(
      ({
        charityName,
        address,
        charityWebsite,
        charityusername,
        password,
        emailAddress,
      }) => [
        charityName,
        address,
        charityWebsite,
        charityusername,
        password,
        emailAddress,
      ],
    ),
  );
  const charityPromise = db
    .query(insertCharityQueryStr)
    .then((result) => result.row);

  const insertDonatorQueryStr = format(
    'INSERT INTO donators_users (username, password, emailAddress, address) VALUES %L RETURNING *;',
    donatorUsersData.map(({
      username, password, emailAddress, address,
    }) => [
      username,
      password,
      emailAddress,
      address,
    ]),
  );

  const donatorPromise = db
    .query(insertDonatorQueryStr)
    .then((result) => result.rows);

  await Promise.all([categoryPromise, charityPromise, donatorPromise]);

  const insertItemsQueryStr = format(
    'INSERT INTO items (categoryName, itemName) VALUES %L RETURNING *;',
    itemsData.map(({ categoryName, itemName }) => [categoryName, itemName]),
  );

  const itemPromise = db.query(insertItemsQueryStr).then((result) => result.row);

  await Promise.all([itemPromise]);

  const insertRequestQueryStr = format(
    'INSERT INTO charity_reqs (charity_id, categoryName, item_id, quantityRequired) VALUES %L RETURNING *;',
    charityReqsData.map(({
      charity_id, categoryName, item_id, quantityRequired,
    }) => [charity_id, categoryName, item_id, quantityRequired]),
  );

  const requestPromise = db.query(insertRequestQueryStr).then((result) => result.rows);

  const insertDonationsQueryStr = format(
    'INSERT INTO donator_items (donator_id, categoryName, item_id, quantityAvailable) VALUES %L RETURNING *;',
    donatorItemsData.map(({
      donator_id, categoryName, item_id, quantityAvailable,
    }) => [donator_id, categoryName, item_id, quantityAvailable]),
  );

  const donationsPromise = db.query(insertDonationsQueryStr).then((result) => result.rows);

  await Promise.all([requestPromise, donationsPromise]);

  db.query('SELECT * FROM categories').then((res) => { console.log(res.rows); });
  db.query('SELECT * FROM charities_users').then((res) => { console.log(res.rows); });
  db.query('SELECT * FROM donators_users').then((res) => { console.log(res.rows); });
  db.query('SELECT * FROM items').then((res) => { console.log(res.rows); });
  db.query('SELECT * FROM charity_reqs').then((res) => { console.log(res.rows); });
  db.query('SELECT * FROM donator_items').then((res) => { console.log(res.rows); });
};

module.exports = seed;
