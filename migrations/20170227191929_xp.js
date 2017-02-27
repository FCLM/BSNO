
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('xp', function (table) {
            table.string('character_id');
            table.string('experience_id');
            table.timestamp('timestamp');
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
