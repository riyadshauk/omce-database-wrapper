This is a WIP Express server to wrap around an OMCe REST API that leverages the `req.oracleMobile.database` object. It decorates `req` with its own `oracleMobile.database` interface, which is a wrapper over a mongodb database that can run on your local machine.