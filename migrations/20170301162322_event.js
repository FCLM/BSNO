
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('event', function (table) {
            table.increments('id');
            table.string('name');
            table.integer('start_pop');
            table.integer('end_pop');
            table.string('ending');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        })
    ])
};

exports.down = function(knex, Promise) {
    knex.schema.dropTable('event');
};
