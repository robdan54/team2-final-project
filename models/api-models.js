const fs = require('fs/promises');

// gets a list of all endpoints and gives a description of their functionality

exports.fetchEndpoints = async () => {
  const endpoints = await fs.readFile('endpoints.json', 'utf-8');
  return JSON.parse(endpoints);
};
