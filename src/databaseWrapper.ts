import { Db, InsertWriteOpResult } from 'mongodb';
import { COPYFILE_EXCL } from 'constants';

export default (db: Db): {
  getAll: (collection: string, fields: { fields: string}, httpOptions: any) => Promise,
  insert: (collection: string, docs: any[]) => Promise<InsertWriteOpResult>,
} => {
  const getAll = async (collection: string, fields: { fields: string}, httpOptions: any) => {
    const query = {};
    const projection = {};
    fields.fields.split(',').forEach(field => projection[field] = 1);
    try {
      const cursor = await db.collection(collection).find(query, projection);
      const result = await cursor.toArray();
      console.log('result:', result);
      const ret = {
        result,
        statusCode: 201,
      }
      return new Promise((resolve, reject) => resolve(ret));
    } catch (err) {
      console.error(err.stack);
    }
  };
  const insert = async (collection: string, docs: any[]) => (
    db.collection(collection).insertMany(docs);
  );
  return {
    getAll,
    insert,
  };
};