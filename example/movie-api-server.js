const omce_api = require('../../ash_sky'); // your API's path, written to be deployed on the OMCe back-end
const omce_database_wrapper = require('../dist/omce_database_wrapper'); // run `$ npm run build` to generate

omce_database_wrapper(omce_api, {
  dbName: 'movie-app',
  dbURL: 'mongodb://127.0.0.1:27017',
  port: 4000,
});