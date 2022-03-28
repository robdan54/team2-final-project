const axios = require('axios');
const dotenv = require('dotenv');

exports.convertToLatLng = (address) => {
  const encAddress = encodeURIComponent(address);
  return axios.get(`https://api.myptv.com/geocoding/v1/locations/by-text?searchText=${encAddress}&apiKey=${dotenv.config().parsed.API_KEY}`).then(({ data }) => data.locations[0].referencePosition);
};
