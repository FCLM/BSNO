/**
 * Created by Dylan on 27-Feb-17.
 */
var knexfile = require('./knexfile.js');

console.log('Using environment: ' + process.env.NODE_ENV || 'development');

var config = knexfile[process.env.NODE_ENV || 'development'];
var knex = require('knex')(config);

var bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;