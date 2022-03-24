const testData = require('../data/test-data/index');
const seed = require('./seed');
const db = require('../connection');

const runSeed = () => seed(testData).then(() => db.end());

runSeed();

//  remember to change to devData
