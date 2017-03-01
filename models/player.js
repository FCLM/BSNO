/**
 * Created by dylancross on 1/03/17.
 */
var bookshelf = require('../bookshelf');

var model = bookshelf.Model.extend({
    tableName: 'player',
    idAttribute: 'id',
    hasTimestamps: true
});

module.exports = model;