import { MongoClient } from 'mongodb';
import databaseWrapper from './databaseWrapper';

// Connection URL
const url = 'mongodb://127.0.0.1:27017';

// Database Name
const dbName = 'omce-project';

const init = async (req, res, next) => {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    console.log('Connected successfully to db');
    const database = client.db(dbName);
    // console.log('database:', Object.keys(database));
    // console.log('client:', client);
    // @ts-ignore
    req.oracleMobile = {
      database: databaseWrapper(database),
      mongoClient: client,
    }
    next();
  } catch (err) {
    // console.error(err.stack);
    next(err.stack);
  }
};

const close = (req, res, next) => {
  req.oracleMobile.mongoClient.close();
  next();
};

module.exports = {
  init,
  close,
};