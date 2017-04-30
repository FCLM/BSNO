
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('outfit', function (table) {
            table.string('outfit_id').unique().primary();
            table.string('name');
            table.string('alias');
            table.integer('faction');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        })
    ])
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('outfit')
    ])
};
