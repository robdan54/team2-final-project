/** @format */

const mongoose = require('mongoose');
const db = require('./connection');
const {
	dropDatabase,
	createCollections,
} = require('./helpers/manage-collections');

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
	const { Category, Charity, CharityRequirement, DonatorItem, Donator, Item } =
		await createCollections();
	//console.log(Category);

	//  creates the 'Charities' collection using the CharityUserScheme defined in create collections

	// await Category.insertMany(categoriesData);

  await Charity.create(charitiesUserData);

	// await CharityRequirement.insertMany(charityReqsData);

	// donatorItemsData.forEach((donatorItems) => {
	// 	DonatorItem.create(donatorItems, (err, instanceDonorItems) => {
	// 		console.log(instanceDonorItems);
	// 	});
	// });

	// donatorUsersData.forEach((donor) => {
	// 	Donator.create(donor, (err, instanceDonor) => {
	// 		console.log(instanceDonor);
	// 	});
	// });

	// itemsData.forEach((item) => {
	// 	Item.create(item, (err, instanceItem) => {
	// 		console.log(instanceItem);
	// 	});
	// });
};

module.exports = seed;

//  creates a instance of the charity model (a document (record) in a collection)

// const testInstance = new Charity({
// 	charityName: 'Charity 1',
// 	address: '1 charity road, location1, A666AA',
// 	charityWebsite: 'testcharitywebsite1',
// 	charityusername: 'CharityUser1',
// 	password: 'TestCharityPassword1',
// 	emailAddress: 'testEmail1',
// });

// //  saves the document (record) to the Charities collection (table) defined by the model in line 25

// testInstance.save(() => {
// 	db.close();
// });
