let bookshelf = require('../bookshelf');

let model = bookshelf.Model.extend({
  tableName: 'outfit',
  idAttribute: 'id',
  hasTimestamps: true
});

module.exports = model;