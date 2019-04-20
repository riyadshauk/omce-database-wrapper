import { MongoClient } from 'mongodb';
import databaseWrapper from './databaseWrapper';

interface Request extends Express.Request {
  oracleMobile: any;
}

/**
 * 
 * @todo use seqeulize to support .sql method, then also implement the other methods
 * 
 * @param dbName 
 * @param dbURL 
 */

export const init = (dbName: string, dbURL: string) => async (req: Request, res: any, next: Function) => {
  try {
    const client = await MongoClient.connect(dbURL, { useNewUrlParser: true });
    console.log('Connected successfully to db');
    const database = client.db(dbName);
    if (Object.prototype.hasOwnProperty.call(req, 'oracleMobile')) {
      req.oracleMobile.database = databaseWrapper(database);
      req.oracleMobile.mongoClient = client;
    } else {
      req.oracleMobile = {
        database: databaseWrapper(database),
        mongoClient: client,
      }
    }
    next();
  } catch (err) {
    next(err.stack);
  }
};

export const close = (req: Request, res: any, next: Function) => {
  console.log('Now closing database connection.');
  req.oracleMobile.mongoClient.close();
  next();
};