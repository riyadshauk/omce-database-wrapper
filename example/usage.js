const omce_api = require('./omce-api'); // your API's path, written to be deployed on the OMCe back-end
const omce_database_wrapper = require('../dist/omce_database_wrapper'); // run `$ npm run build` to generate

omce_database_wrapper(omce_api, {
  dbName: 'omce-project',
  dbURL: 'mongodb://127.0.0.1:27017',
  port: 4000,
});