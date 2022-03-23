const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose); // plugs mongoose

const db = require('../connection');

const { Schema } = mongoose;

const dropDatabase = async () => {
  await db.dropDatabase(() => {
    console.log('dropped database');
  });
};

const createCollections = async () => {
  const CharityUserSchema = new Schema({
    charity_user_id: Number,
    charityName: String,
    address: String,
    charityWebsite: String,
    charityUsername: String,
    password: String,
    emailAddress: String,
  });
  CharityUserSchema.plugin(AutoIncrement, { id: 'charityUserId', inc_field: 'charity_user_id' }); // adds the auto increment plugin to the schema

  const CategorySchema = new Schema({
    category_id: Number,
    categoryName: String,
  });
  CategorySchema.plugin(AutoIncrement, { id: 'categoryId', inc_field: 'category_id' });

  const DonatorUserSchema = new Schema({
    donator_id: Number,
    username: String,
    password: String,
    emailAddress: String,
    addressLine1: String,
    addressLine2: String,
    postCode: String,
  });
  DonatorUserSchema.plugin(AutoIncrement, { id: 'donatorUsersId', inc_field: 'donator_id' });

  const ItemSchema = new Schema({
    item_id: Number,
    itemName: String,
    categoryName: String,
  });
  ItemSchema.plugin(AutoIncrement, { id: 'itemId', inc_field: 'item_id' });

  const CharityRequirementSchema = new Schema({
    charity_requirement_id: Number,
    charity_user_id: Number,
    categoryName: String,
    itemName: String,
    quantityRequired: Number,
  });
  CharityRequirementSchema.plugin(AutoIncrement, { id: 'charityReqsId', inc_field: 'charity_requirement_id' });

  const DonatorItemSchema = new Schema({
    donator_item_id: Number,
    donator_id: Number,
    categoryName: String,
    itemName: String,
    quantityAvailable: Number,
  });
  DonatorItemSchema.plugin(AutoIncrement, { id: 'donatorItemId', inc_field: 'donator_item_id' });

  const Charity = mongoose.model('Charity', CharityUserSchema);
  const Category = mongoose.model('Category', CategorySchema);
  const CharityRequirement = mongoose.model('CharityRequirement', CharityRequirementSchema);
  const DonatorItem = mongoose.model('DonatorItem', DonatorItemSchema);
  const Donator = mongoose.model('Donator', DonatorUserSchema);
  const Item = mongoose.model('Item', ItemSchema);

  return {
    Charity,
    Category,
    CharityRequirement,
    DonatorItem,
    Donator,
    Item,
  };
};

module.exports = { dropDatabase, createCollections };
