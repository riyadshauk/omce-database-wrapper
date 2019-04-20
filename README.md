This is a simple Express server to wrap around an OMCe REST API that leverages the `req.oracleMobile.database` object. It decorates `req` with its own `oracleMobile.database` interface, which is a wrapper over a mongodb database that can run on your local machine.

# Disclaimer
This is a one-off API. Simple test for this API are passing, except for .merge and .sql.
Ignore any mention of `npm install`ing this package. You'll just need to `git clone` and
import to use, like in `example/usage.js`. Might throw it on NPM if it's working properly
(including having a SQL-based db-layer, rather than a Mongo/Nosql-based db-layer).

Feel free to revamp this mini project and submit a PR.

# Supported API
This library provides a simplified version of the database API that is [actually provided by OMCe](https://docs.oracle.com/en/cloud/paas/mobile-suite/develop/calling-apis-custom-code.html#GUID-8E7C28B5-316A-415B-9382-43E250F05D28):
```typescript
getAll: (collection: string, fields: { fields: string }) => Promise,
get: (collection: string, query: FilterQuery<any>) => Promise,
insert: (collection: string, docs: any[]) => Promise,
delete: (collection: string, filter: FilterQuery<any>) => Promise,
merge: (collection: string, docs: any[], doc: any) => Promise,
```

# Getting Started
```
$ npm install omce-database-wrapper
```

Please note: To use this library, you will need to [install and set up Mongodb](https://docs.mongodb.com/manual/tutorial/getting-started/).

To transpile (for now): `npm install && npm run build`

See the `example-usage.js` to see how to use this OMCe wrapper.

# Example Usage

```javascript
const omce_api = require('./example-omce-api'); // your API's path, written to be deployed on the OMCe back-end
const { omce_database_wrapper } = require('omce-database-wrapper');

omce_database_wrapper(omce_api, {
  dbName: 'omce-project',
  dbURL: 'mongodb://127.0.0.1:27017',
  port: 4000,
});
```

# To run the provided example
```bash
$ npm install omce-database-wrapper
$ cd ./node_modules/omce-database-wrapper
$ npm install
$ node example/usage.js
```