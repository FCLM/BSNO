
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('player', function (table) {
            table.increments('id');
            table.string('character_id');
            table.string('name');
            table.string('outfit_id');
            table.boolean('logged_in');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
