const bookshelf = require('../bookshelf');

const model = bookshelf.Model.extend({
    tableName: 'outfit',
    hasTimestamps: true
});

module.exports = model;