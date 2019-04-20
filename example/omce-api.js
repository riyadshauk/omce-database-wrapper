/**
 * The ExpressJS namespace.
 * @external ExpressApplicationObject
 * @see {@link http://expressjs.com/3x/api.html#app}
 */


const runQuery = async (res, queryWrapper) => {
  try {
    const result = await queryWrapper();
    console.log('runQuery result:', result);
    res.status(result.statusCode).send(result.result);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode).send(err.error);
  }
};

/**
 * A simple rest API
 * @param {any} service An Express.Application object.
 */
const api = (service) => {
  service.post('/users', (req, res) => {
    const queryWrapper = () => req.oracleMobile.database.insert(
      'users',
      [
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
          Name: 'User Three',
          email: 'user.three@example.com'
        },
      ],
      { extraFields: 'none', primaryKeys: 'code' });
    runQuery(res, queryWrapper);
  });
  service.get('/users', (req, res) => {
    const queryWrapper = () => req.oracleMobile.database.getAll(
      'users', { fields: 'id,Name,email' });
    runQuery(res, queryWrapper);
  });
  service.post('/movies', async (req, res) => {
    const queryWrapper = () => req.oracleMobile.database.insert(
      'movies',
      [
        {
          id: 1,
          name: 'Peter Rabbit',
          rating: '6.6',
        },
        {
          id: 2,
          name: 'Pacific Rim Uprising',
          rating: '5.7',
        },
        {
          id: 3,
          name: 'Black Panther',
          rating: '7.5',
        },
        {
          id: 4,
          name: 'Avengers: Infinity War',
          rating: '8.7',
        },
        {
          id: 5,
          name: 'Jurassic World: Fallen Kingdom',
          rating: '6.6',
        },
        {
          id: 6,
          name: 'Oceans 8',
          rating: '6.4',
        },
      ],
      { extraFields: 'none', primaryKeys: 'id' });
    runQuery(res, queryWrapper);
  });
  service.get('/movies', (req, res) => {
    const queryWrapper = () => req.oracleMobile.database.getAll(
      'movies', { fields: 'id,name,rating' });
    runQuery(res, queryWrapper);
  });
  service.delete('/movies/:id', (req, res) => {
    const queryWrapper = () => req.oracleMobile.database.delete(
      'movies', req.params.id);
    runQuery(res, queryWrapper);
  });
  service.get('/users/:id', (req, res) => {
    console.log('req.params.id:', req.params.id)
    const queryWrapper = () => req.oracleMobile.database.get(
      'users', req.params.id);
    runQuery(res, queryWrapper);
  });
  service.put('/movies/:id', (req, res) => {
    const rating = req.body.rating;
    const queryWrapper = () => req.oracleMobile.database.merge(
      'movies',
      [
        {
          id: Number(req.params.id),
          rating,
        }
      ],
      { extraFields: 'none', primaryKeys: 'id' });
    runQuery(res, queryWrapper);
  });
}

module.exports = api;
