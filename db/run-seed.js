// const devData = require() -- may need to bring in categories/items data later

//  not currently in use, when it comes to build devDatabase we will

const seed = require('./seed');
const db = require('./connection');

const runSeed = () => seed().then(() => db.close());

runSeed();
