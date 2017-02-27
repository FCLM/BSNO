
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('xp', function (table) {
            table.string('character_id');
            table.string('experience_id');
            table.timestamp('time');
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
