const fs = require('fs/promises');

exports.fetchEndpoints = async () => {
  const endpoints = await fs.readFile('../endpoints.json', 'utf-8');
  return JSON.parse(endpoints);
};
