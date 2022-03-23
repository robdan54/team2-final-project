/** @format */

const mongoose = require('mongoose');
const db = require('./connection');
const { dropDatabase, createCollections } = require('./helpers/manage-collections');

const seed = async ({
  categoriesData,
  charitiesUserData,
  charityReqsData,
  donatorItemsData,
  donatorUsersData,
  itemsData,
}) => {
  //  drops the data base before initializing

  await dropDatabase();

  //  defines a 'schema' for each table which is a template for a collection (table)

  const { Category, Charity, CharityRequirement, DonatorItem, Donator, Item } = await createCollections();

  //  creates the collections (tables) using the schemas defined in create collections function and is passed the relevant data as an argument

  await Charity.create(charitiesUserData);
  await Category.create(categoriesData);
  await CharityRequirement.create(charityReqsData);
  await DonatorItem.create(donatorItemsData);
  await Donator.create(donatorUsersData);
  await Item.create(itemsData);
};

module.exports = seed;
