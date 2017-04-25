
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('xp', function (table) {
            table.string('character_id');
            table.string('experience_id');
            table.integer('event_id');
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
