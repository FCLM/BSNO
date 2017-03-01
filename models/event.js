/**
 * Created by dylancross on 1/03/17.
 */
var bookshelf = require('../bookshelf');

var model = bookshelf.Model.extend({
    tableName: 'event',
    idAttribute: 'id',
    hasTimestamps: true
});

module.exports = model;