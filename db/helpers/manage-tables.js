const db = require('../connection');

const createTables = async () => {
  const categoriesTablePromise = db.query(`
  CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    categoryName VARCHAR NOT NULL UNIQUE
  );`);
  const charityUsersTablePromise = db.query(`
  CREATE TABLE charities_users (
    charity_id SERIAL PRIMARY KEY,
    charityName VARCHAR NOT NULL,
    address VARCHAR NOT NULL,
    charityWebsite VARCHAR NOT NULL,
    charityUsername VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    emailAddress VARCHAR NOT NULL
  );`);
  const donatorUsersTablePromise = db.query(`
  CREATE TABLE donators_users (
    donator_id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    emailAddress VARCHAR NOT NULL,
    address VARCHAR NOT NULL
  );`);
  await Promise.all([categoriesTablePromise, charityUsersTablePromise, donatorUsersTablePromise]);
  const itemsTablePromise = db.query(`
  CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    categoryName VARCHAR NOT NULL REFERENCES categories(categoryName),
    itemName VARCHAR NOT NULL
  );`);
  await Promise.all([itemsTablePromise]);
  await db.query(`
  CREATE TABLE charity_reqs (
    request_id SERIAL PRIMARY KEY,
    charity_id INT NOT NULL REFERENCES charities_users(charity_id),
    categoryName VARCHAR NOT NULL REFERENCES categories(categoryName),
    item_id INT NOT NULL REFERENCES items(item_id),
    quantityRequired INT NOT NULL,
    urgent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  );`);
  await db.query(`
  CREATE TABLE donator_items (
    donation_id SERIAL PRIMARY KEY,
    donator_id INT NOT NULL REFERENCES donators_users(donator_id),
    categoryName VARCHAR NOT NULL REFERENCES categories(categoryName),
    item_id INT NOT NULL REFERENCES items(item_id),
    quantityAvailable INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`);
};

const dropTables = async () => {
  await db.query('DROP TABLE IF EXISTS donator_items;');
  await db.query('DROP TABLE IF EXISTS charity_reqs;');
  await db.query('DROP TABLE IF EXISTS items;');
  await db.query('DROP TABLE IF EXISTS donators_users;');
  await db.query('DROP TABLE IF EXISTS charities_users;');
  await db.query('DROP TABLE IF EXISTS categories;');
};

module.exports = { createTables, dropTables };
