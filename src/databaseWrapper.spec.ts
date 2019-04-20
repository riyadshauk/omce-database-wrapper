import { assert, expect } from 'chai';
import { MongoClient, Db } from 'mongodb';
import * as _ from 'lodash';
import databaseWrapper, { api as apiType } from './databaseWrapper';

/**
 * If `assert.deepEqual(result.items, expected.items)` fails,
 * these asserts give more granular AssertionError messages.
 * @param resultItems result.items array of documents
 * @param expectedItems expected.items array of documents
 */
function deepEqualAssert(resultItems: any[], expectedItems: any[]) {
  resultItems.forEach((resItem: any, idx: number) => {
    const expItem = expectedItems[idx];
    const resultItemKeys = Object.keys(resItem);
    assert.equal(resultItemKeys.length, Object.keys(expItem).length);
    resultItemKeys.forEach((prop) => {
      if (prop === '_id') {
        return; // @todo don't rely on _id checking, as that's internal to Mongo, etc?
      }
      assert.isTrue(_.isEqual(resItem[prop], expItem[prop]));
    });
  });
};

describe('Basic oracleMobile.database methods (.insert, .get, .getAll, .delete, .merge – no .sql supported)', function () {
  let client: MongoClient;
  let api: apiType;
  const users = [
    {
      id: 1,
      Name: 'User One',
      email: 'user.one@example.com',
    },
    {
      id: 2,
      Name: 'User Two',
      email: 'user.two@example.com',
    },
    {
      id: 3,
      Name: 'User Three',
      email: 'user.three@example.com',
    },
  ];

  async function getAllUsersWithOptions(options?: { fields: string }, runChecks = true): Promise<{ items: any[] }> {
    // @ts-ignore
    options = options === undefined ? {} : options;
    const { result } = await api.getAll(
      'users', options, undefined,
    );
    const expected: { items: { [key: string]: any }[] } = { items: [] };
    users.forEach((doc, idx) => {
      if (options === undefined || options.fields === undefined) {
        expected.items[idx] = doc;
      } else {
        const fields = options.fields.split(',');
        expected.items[idx] = {};
        fields.forEach((field: string) => expected.items[idx][field] = (doc as any)[field]);
      }
    });
    if (runChecks) {
      deepEqualAssert(result.items, expected.items);
    } else {
      return new Promise((resolve, reject) => {
        resolve(result);
      });
    }
  }

  beforeEach(async () => {
    const dbName = 'omce-project-test';
    const dbURL = 'mongodb://127.0.0.1:27017';
    try {
      client = await MongoClient.connect(dbURL, { useNewUrlParser: true });
      const database = client.db(dbName);
      await database.dropDatabase();
      api = databaseWrapper(database);
      await api.insert(
        'users',
        users,
        undefined,
        undefined);
    } catch (err) {
      console.error(err.stack);
    }
  });

  /**
   * This is required in order for Mocha to exit the process that runs these tests.
   */
  afterEach(async () => await client.close());

  it('insert', async function () {
    const { result } = await api.insert(
      'users',
      [
        {
          id: 4,
          Name: 'User Four',
          email: 'user.four@example.com',
        },
        {
          id: 5,
          Name: 'User Five',
          email: 'user.five@example.com',
        },
        {
          id: 6,
          Name: 'User Six',
          email: 'user.six@example.com',
        },
      ],
      undefined,
      undefined);
    const expected = { items: [{ id: 4 }, { id: 5 }, { id: 6 }] };
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
  });

  it('getAll', async function () {
    await getAllUsersWithOptions();
    await getAllUsersWithOptions({ fields: 'Name,email' });
  });

  /**
   * Only implement get by id for now, not using multiple primary keys
   */
  it('get', async function () {
    async function getUserAndAssertById(id: string) {
      const { result } = await api.get(
        'users', id, undefined, undefined,
      );
      const expected = { items: [users[Number(id) - 1]] };
      deepEqualAssert(result.items, expected.items);
    }
    await getUserAndAssertById('2');
    await getUserAndAssertById('3');
  });

  /**
   * Only implement delete by id for now, not using multiple primary keys
   */
  it('delete', async function () {
    const { result } = await api.delete(
      'users', '2', undefined, undefined,
    );
    const expected = { items: [{ id: 2 }] };
    deepEqualAssert(result.items, expected.items);

    const getAllRet = await getAllUsersWithOptions(undefined, false);
    const expectedGetAll = {
      items: [
        {
          _id: '5cb68388ffc3bf71719b0a2a',
          id: 1,
          Name: 'User One',
          email: 'user.one@example.com'
        },
        {
          _id: '5cb68388ffc3bf71719b0a2c',
          id: 3,
          Name: 'User Three',
          email: 'user.three@example.com'
        },
      ],
    };
    deepEqualAssert(getAllRet.items, expectedGetAll.items);
  });

  /**
   * @todo
   */
  it('merge', async function () {
    async function mergeUserById(docs: any[], id?: number) {
      const { result } = await api.merge(
        'users',
        docs,
        { primaryKeys: 'id' });
      // hard-coded for now is fine in test case
      const expected = id === undefined ? { items: [{ id, }] } : { items: [{ id: 4 }, { id: 5 }] };
      deepEqualAssert(result.items, expected.items);
    }
    await mergeUserById([{
      id: 3,
      Name: 'User Three Merged',
      email: 'user.three@example.com'
    }], 3);
    let getAllRet = await getAllUsersWithOptions();
    let expectedGetAll = {
      items: [
        {
          id: 1,
          Name: 'User One',
          email: 'user.one@example.com'
        },
        {
          id: 2,
          Name: 'User Two',
          email: 'user.two@example.com'
        },
        {
          id: 3,
          Name: 'User Three Merged',
          email: 'user.three@example.com'
        },
      ],
    };
    deepEqualAssert(getAllRet.items, expectedGetAll.items);

    const docs = [
      {
        id: 4,
        Name: 'User Four',
        email: 'user.four@example.com'
      },
      {
        id: 5,
        Name: 'User Five',
        email: 'user.five@example.com'
      }
    ];
    await mergeUserById(docs);
    getAllRet = await getAllUsersWithOptions();
    expectedGetAll = {
      items: [
        {
          id: 1,
          Name: 'User One',
          email: 'user.one@example.com'
        },
        {
          id: 2,
          Name: 'User Two',
          email: 'user.two@example.com'
        },
        {
          id: 3,
          Name: 'User Three Merged',
          email: 'user.three@example.com'
        },
        ...docs,
      ],
    };
    deepEqualAssert(getAllRet.items, expectedGetAll.items);
  });
});