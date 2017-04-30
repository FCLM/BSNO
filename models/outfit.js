const bookshelf = require('../bookshelf');

const model = bookshelf.Model.extend({
    tableName: 'outfit',
    idAttribute: 'outfit_id',
    hasTimestamps: true
});

module.exports = model;