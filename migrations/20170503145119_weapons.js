
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('weapons', function (table) {
            table.string('item_id').unique().primary();
            table.string('category_id');
            table.string('name');
            table.string('description');
            table.string('image_id');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        })
    ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
      knex.dropTable('weapons')
  ])
};

example = {
    item_id: "1",
    item_category_id: "2",
    name: {
        en: "Mag-Cutter"
    },
    description: {
        en: "The New Conglomerate's Mag-Cutter features a powerful electromagnet capable of cutting through enemy body armor."
    },
    image_id: "963"
};