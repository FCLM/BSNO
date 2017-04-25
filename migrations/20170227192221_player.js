
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('player', function (table) {
            table.string('character_id').unique().primary();
            table.string('name');
            table.string('outfit_id');
            table.integer('faction');
            table.boolean('logged_in');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        })
    ])
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('player')
    ])
};
