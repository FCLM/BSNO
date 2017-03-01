
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('tracked', function (table) {
            table.string('character_id');
            table.string('outfit_id');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
