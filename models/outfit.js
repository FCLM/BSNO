var bookshelf = require('../bookshelf');

var model = bookshelf.Model.extend({
  tableName: 'outfit',
  idAttribute: 'id',
  hasTimestamps: true
});

module.exports = model;