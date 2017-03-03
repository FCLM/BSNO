
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('event', function (table) {
            table.increments('id');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
