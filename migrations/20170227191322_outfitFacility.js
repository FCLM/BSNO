
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('facility', function (table) {
            table.string('facility_id');
            table.string('outfit_id');
            table.boolean('capture');
            table.integer('event_id');
        })
    ])
};

exports.down = function(knex, Promise) {
    knex.schema.dropTable('facility');
};
