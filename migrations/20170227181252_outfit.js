
exports.up = function(knex, Promise) {
  return Promise.all([
      knex.schema.createTable('outfit', function (table) {
          table.string('outfit_id').unique();
          table.string('name');
          table.string('alias');
          table.json('members');
          table.integer('faction');
          table.timestamps();
      })
  ])
};

exports.down = function(knex, Promise) {
  
};
