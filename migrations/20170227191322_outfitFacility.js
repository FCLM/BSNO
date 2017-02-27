
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('outfitFacility', function (table) {
            table.string('facility_id');
            table.string('outfit_id');
            table.boolean('capture');
            table.timestamp('time');
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
