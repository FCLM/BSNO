
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('tracked', function (table) {
            table.string('character_id');
            table.string('outfit_id');
            table.timestamp('timestamp');
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
