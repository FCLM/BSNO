
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('deaths', function (table) {
            table.increments('id');
            table.string('attacker_character_id');
            table.string('attacker_loadout_id');
            table.string('attacker_vehicle_id');
            table.string('loser_character_id');
            table.string('loser_loadout_id');
            table.string('loser_vehicle_id');
            table.boolean('is_headshot');
            table.integer('event');
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
