const bookshelf = require('../bookshelf');

const model = bookshelf.Model.extend({
    tableName: 'outfit',
    idAttribute: 'id',
    hasTimestamps: true
});

module.exports = model;