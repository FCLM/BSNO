/**
 * Created by dylancross on 1/03/17.
 */
const bookshelf = require('../bookshelf');
const model = bookshelf.Model.extend({
    tableName: 'facility',
    idAttribute: null,
    hasTimestamps: false
});

module.exports = model;