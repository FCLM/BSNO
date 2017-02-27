
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('playerFacility', function (table) {
            table.string('character_id');
            table.boolean('capture');
            table.string('facility_id');
            table.timestamp('timestamp');
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
