import * as express from 'express';
import { init, close } from './oracleMobile';
import * as cors from 'cors';

const omce_database_wrapper = (omce_api: (app: Express.Application) => undefined, config = {
  dbName: 'omce-project',
  dbURL: 'mongodb://127.0.0.1:27017',
  port: 4000,
}) => {
  const { dbName, dbURL, port } = config;
  const app = express();
  app.use(cors());
  app.use(init(dbName, dbURL));
  omce_api(app);
  app.use(close);
  app.listen(port, () => console.log(`Server listening on port ${port}!`));
};

/**
 * This is the only publicly accessbile API of this project
 * (ie: const wrapper = require('omce-database-wrapper')).
 */
module.exports = omce_database_wrapper;