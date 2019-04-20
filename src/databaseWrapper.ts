import { Db, InsertWriteOpResult, FilterQuery, Cursor, DeleteWriteOpResultObject, UpdateWriteOpResult, BulkWriteResult } from 'mongodb';

export type api = {
  getAll: (collection: string, options?: { fields: string }, httpOptions?: any) => Promise<{ result: any, statusCode: number }>,
  get: (collection: string, keys: string, options?: any, httpOptions?: any) => Promise<{ result: any, statusCode: number }>,
  insert: (collection: string, docs: any[], options?: any, httpOptions?: any) => Promise<{ result: any, statusCode: number }>,
  delete: (collection: string, keys: string, options?: any, httpOptions?: any) => Promise<{ result: any, statusCode: number }>,
  merge: (collection: string, docs: any[], options?: any, httpOptions?: any) => Promise<{ result: any, statusCode: number }>,
};

/**
 * @see https://docs.oracle.com/en/cloud/paas/mobile-suite/develop/calling-apis-custom-code.html#GUID-8E7C28B5-316A-415B-9382-43E250F05D28
 * @note "Note that if a table’s row key is the system-defined id column
 * (instead of user-defined primary keys), then the response shows the id
 * values for the new rows. For example:..."
 */
export default (db: Db): api => {
  const getAll = (collection: string, options?: { fields: string }, httpOptions?: any) =>
    new Promise(async (resolve, reject) => {
      try {
        const query = {};
        const projection = {};
        if (options.fields !== undefined) {
          options.fields.split(',').forEach(field => (projection as any)[field] = 1);
        }
        const cursor: Cursor<any> = await db.collection(collection).find(query, projection);
        const items = await cursor.toArray();
        resolve({
          result: {
            items: items.map(doc => {
              const ret = {};
              Object.keys(doc).forEach((field: string) => {
                if (projection.hasOwnProperty(field) || Object.keys(projection).length === 0) {
                  (ret as any)[field] = doc[field];
                }
              });
              return ret;
            }),
          },
          statusCode: 200,
        });
      } catch (err) {
        reject({
          error: err.stack,
          statusCode: 500,
        });
      }
    });

  const get = async (collection: string, keys: string, options?: any, httpOptions?: any) =>
    new Promise(async (resolve, reject) => {
      try {
        let cursor: Cursor<any>;
        if (keys.split(',').length === 1 && !Number.isNaN(Number(keys))) {
          cursor = await db.collection(collection).find({ id: Number(keys) });
        } else {
          cursor = await db.collection(collection).find();
        }
        const items = await cursor.toArray();
        resolve({
          result: { items },
          statusCode: 200,
        });
      } catch (err) {
        reject({
          result: err.stack,
          statusCode: 500,
        });
      }
    });
  const insert = (collection: string, docs: any[], options?: any, httpOptions?: any) =>
    new Promise(async (resolve, reject) => {
      try {
        const result: InsertWriteOpResult = await db.collection(collection).insertMany(docs);
        resolve({
          result: { items: result.ops.map((doc: any) => ({ id: doc.id })) },
          statusCode: 201,
        });
      } catch (err) {
        reject({
          error: err.stack,
          statusCode: 500,
        });
      }
    });
  const deleteFunc = (collection: string, keys: string, options?: any, httpOptions?: any) =>
    new Promise(async (resolve, reject) => {
      if (Number.isNaN(Number(keys))) {
        return reject({
          error: 'We only support deleting on primary key of field `id` at this time',
          statusCode: 500,
        });
      }
      const id = Number(keys);
      try {
        await db.collection(collection).deleteOne({ id });
        resolve({
          result: { items: [{ id, }] },
          statusCode: 200,
        });
      } catch (err) {
        reject({
          error: err.stack,
          statusCode: 500,
        });
      }
    });
  // runQuery(async () => await db.collection(collection).deleteOne(keys), 200, 500);
  /**
   * @todo
   * @param collection 
   * @param docs 
   * @param doc 
   * @see https://docs.mongodb.com/manual/reference/method/Bulk.find.upsert/
   * @see https://docs.oracle.com/en/cloud/paas/mobile-suite/develop/calling-apis-custom-code.html#GUID-2C168764-ADF5-4F82-B8B1-09E240E2771A
   */
  const merge = (collection: string, docs: any[], options?: any, httpOptions?: any) =>
    new Promise((resolve, reject) => {
      try {
        const ret: { items: any[] } = { items: [] };
        docs.forEach(async (doc) => {
          const bulk = db.collection(collection).initializeOrderedBulkOp();
          bulk.find({ id: doc.id }).upsert().replaceOne(doc);
          const result: BulkWriteResult = await bulk.execute();
          ret.items.push({id: doc.id});
        });
        resolve({
          result: ret,
          statusCode: 200,
        });
      } catch (err) {
        reject({
          error: err.stack,
          statusCode: 500,
        });
      }
    });
  /**
   * @note SQL is not currently supported by this library. I do not plan on supporting the
   * notion of querying a NoSQL-based DB with SQL (unless it's actually performant / makes sense).
   * If it's not performant, it shouldn't be a problem, since using the other five methods in
   * this library is quite easy and intuitive. If you want SQL, I recommend not relying on
   * the oracleMobile.database API...
   * IMO, Just go for a native SQL database (and not the one living in OMCe – which feels like a
   * NoSQL DB, but God knows what it actually is under the hood).
   */
  const sql = (sql: string, args: any, options?: any, httpOptions?: any) =>
    new Promise((resolve, reject) =>
      reject({
        error: new Error('This library does not support SQL queries. Why even use SQL in an underlying NoSQL DB?!'),
        statusCode: 501,
      }),
    );
  return {
    getAll,
    get,
    insert,
    delete: deleteFunc,
    merge,
    sql,
  };
};