const devData = require('../data/development-data/index');
const seed = require('./seed');
const db = require('../connection');

const runSeed = () => seed(devData).then(() => db.end());

runSeed();

//  remember to change to devData
