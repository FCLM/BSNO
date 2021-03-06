/**
 * Created by dylancross on 1/03/17.
 */
const bookshelf = require('../bookshelf');

const model = bookshelf.Model.extend({
    tableName: 'player',
    idAttribute: 'character_id',
    hasTimestamps: true
});

module.exports = model;