const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './dist/wrapper.js'),
  output: {
    filename: 'lib.js',
    path: path.resolve(__dirname),
    library: 'digital-assistant-flow-js',
    libraryTarget: 'commonjs2', // commonjs2 is a version of commonjs that works with Node.js (module.exports)
  },
};