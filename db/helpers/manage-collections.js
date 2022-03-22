const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const db = require('../connection');

const { Schema } = mongoose;

const dropDatabase = async () => {
  await db.dropDatabase(() => {
    console.log('dropped database');
  });
};

const createCollections = async () => {
  const CharityUserSchema = new Schema(
    {
      _id: Number,
      charityName: String,
      address: String,
      charityWebsite: String,
      charityUsername: String,
      password: String,
      emailAddress: String,
    },
    { _id: false },
  );
  CharityUserSchema.plugin(AutoIncrement);

  const CategorySchema = new Schema({
    categoryName: String,
  });

  const DonatorUserSchema = new Schema({
    // _id: db.donators.find().Count() + 1 ,
    username: String,
    password: String,
    emailAddress: String,
    addressLine1: String,
    addressLine2: String,
    postCode: String,
  });
  const ItemSchema = new Schema({
    itemName: String,
    categoryName: { type: String, ref: 'Category' }, //  model name Category
  });
  const CharityRequirementSchema = new Schema({
    charity_id_number: { type: Schema.Types.ObjectId, ref: 'Charity' }, //  model name Charity
    category: { type: String, ref: 'Category' }, //  model name Category
    itemName: String,
    quantityRequired: Number,
  });
  const DonatorItemSchema = new Schema({
    donator_ID_number: { type: Schema.Types.ObjectId, ref: 'Donator' }, //  model name Donator
    category: { type: String, ref: 'Category' }, //  model name Category
    itemName: String,
    quantityAvailable: Number,
  });

  const Charity = mongoose.model('Charity', CharityUserSchema);
  const Category = mongoose.model('Category', CategorySchema);
  const CharityRequirement = mongoose.model(
    'CharityRequirement',
    CharityRequirementSchema,
  );

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
