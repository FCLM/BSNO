/**
 * Created by dylancross on 1/03/17.
 */
var bookshelf = require('../bookshelf');

var model = bookshelf.Model.extend({
    tableName: 'outfitFacility',
    idAttribute: 'id',
    hasTimestamps: false
});

module.exports = model;