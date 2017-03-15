/**
 * Created by Dylan on 27-Feb-17.
 */
const knexfile = require('./knexfile.js');

console.log('Using environment: ' + process.env.NODE_ENV || 'development');

const config = knexfile[process.env.NODE_ENV || 'development'];
const knex = require('knex')(config);

const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;