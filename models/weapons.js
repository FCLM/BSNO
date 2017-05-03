/**
 * Created by Dylan on 03-May-17.
 */
const bookshelf = require('../bookshelf');

const model = bookshelf.Model.extend({
    tableName: 'weapons',
    idAttribute: 'item_id',
    hasTimestamps: true
});

module.exports = model;