/** @format */

const format = require('pg-format');

const bcrypt = require('bcrypt');
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
    'INSERT INTO categories (category_name) VALUES %L RETURNING *;',
    categoriesData.map(({ categoryName }) => [categoryName]),
  );

  const categoryPromise = db
    .query(insertCategoryQueryStr)
    .then((result) => result.rows);

  const insertCharityQueryStr = format(
    'INSERT INTO charities_users (charity_name, address, charity_website,  password, email_address ) VALUES %L RETURNING *;',
    charityUsersData.map(
      ({
        charityName,
        address,
        charityWebsite,
        password,
        emailAddress,
      }) => [
        charityName,
        address,
        charityWebsite,
        bcrypt.hashSync(password, 2),
        emailAddress,
      ],
    ),
  );
  const charityPromise = db
    .query(insertCharityQueryStr)
    .then((result) => result.row);

  const insertDonatorQueryStr = format(
    'INSERT INTO donators_users (username, password, email_address, address) VALUES %L RETURNING *;',
    donatorUsersData.map(({
      username, password, emailAddress, address,
    }) => [
      username,
      bcrypt.hashSync(password, 2),
      emailAddress,
      address,
    ]),
  );

  const donatorPromise = db
    .query(insertDonatorQueryStr)
    .then((result) => result.rows);

  await Promise.all([categoryPromise, charityPromise, donatorPromise]);

  const insertItemsQueryStr = format(
    'INSERT INTO items (category_name, item_name) VALUES %L RETURNING *;',
    itemsData.map(({ categoryName, itemName }) => [categoryName, itemName]),
  );

  const itemPromise = db.query(insertItemsQueryStr).then((result) => result.row);

  await Promise.all([itemPromise]);

  const insertRequestQueryStr = format(
    'INSERT INTO charity_reqs (charity_id, category_name, item_id, quantity_required) VALUES %L RETURNING *;',
    charityReqsData.map(({
      charity_id, categoryName, item_id, quantityRequired,
    }) => [charity_id, categoryName, item_id, quantityRequired]),
  );

  const requestPromise = db.query(insertRequestQueryStr).then((result) => result.rows);

  const insertDonationsQueryStr = format(
    'INSERT INTO donator_items (donator_id, category_name, item_id, quantity_available) VALUES %L RETURNING *;',
    donatorItemsData.map(({
      donator_id, categoryName, item_id, quantityAvailable,
    }) => [donator_id, categoryName, item_id, quantityAvailable]),
  );

  const donationsPromise = db.query(insertDonationsQueryStr).then((result) => result.rows);

  await Promise.all([requestPromise, donationsPromise]);
};

module.exports = seed;
