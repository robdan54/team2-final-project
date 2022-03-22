const mongoose = require('mongoose');
const db = require('../connection');

const { Schema } = mongoose;

const dropDatabase = async () => {
  await db.dropDatabase(() => {
    console.log('dropped database');
  });
};

const createSchemas = async () => {
  const CharityUserSchema = new Schema({
    charityName: String,
    address: String,
    charityWebsite: String,
    charityUsername: String,
    password: String,
    emailAddress: String,
  });
  const CategorySchema = new Schema({
    categoryName: String,
  });
  const CharityRequirementSchema = new Schema({
    charity_id_number: { type: Schema.Types.ObjectId, ref: 'Charity' }, //  model name Charity
    category: { type: Schema.Types.ObjectId, ref: 'Category' }, //  model name Category
    itemName: String,
    quantityRequired: Number,
  });
  const DonatorItemSchema = new Schema({
    donator_ID_number: { type: Schema.Types.ObjectId, ref: 'Donator' }, //  model name Donator
    category: { type: Schema.Types.ObjectId, ref: 'Category' }, //  model name Category
    itemName: String,
    quantityAvailable: Number,
  });
  const DonatorUserSchema = new Schema({
    username: String,
    password: String,
    emailAddress: String,
    addressLine1: String,
    addressLine2: String,
    postCode: String,
  });
  const ItemSchema = new Schema({
    itemName: String,
    categoryName: { type: Schema.Types.ObjectId, ref: 'Category' }, //  model name Category
  });
  return {
    CharityUserSchema,
    CategorySchema,
    CharityRequirementSchema,
    DonatorItemSchema,
    DonatorUserSchema,
    ItemSchema,
  };
};

module.exports = { dropDatabase, createSchemas };
