/**
 * Created by Dylan on 27-Feb-17.
 */
// Modules

// Files
var bookshelf = require('./bookshelf.js');

var mOutfit   = require('./models/outfit');

//  ********************
//  * Insert Functions *
//  ********************

/**
 * Insert outfit into outfit database
 * N.B. Only use to insert NEW outfits, if updating use outfitUpdate
 * function will fail if not unique
 *
 * var obj = {
 *     (string)     outfit_id
 *     (string)     name
 *     (string)     alias
 *     (JSON)       members**
 *     (integer)    faction
 * }
 *
 * var members** = {
 *    (string) Character ID
 *    (string) Name
 * }
 */
function outfitInsert(obj) {

  // before - knex insert
  // bookshelf.knex('outfit').insert(obj).then(function (data) {
  //
  // }).catch(function (err) {
  //   console.error('outfitInsert' + err);
  // });

  // ---------------------------------------------------------------------

  // after - bookshelf insert
  mOutfit.forge(obj)
    .save()
    .then(function (result) {
      var id = result.get('id');
      console.log('Added outfit:', id);
    })
    .catch(function (error) {
      console.error('outfitInsert' + error);
    });


  // ---------------------------------------------------------------------

  // example: bookshelf update
  // new mOutfit(obj)
  //   .where({id: id})
  //   .save(null, {method: 'update'})
  //   .then(function (result) {
  //     console.log('Updated Hero:', result.attributes.id);
  //   })
  //   .catch(function (error) {
  //     console.error(error);
  //   });

  // example: bookshelf query
  // new mOutfit()
  //   .query('where', 'condition', '>', '0')
  //   .fetchAll({ columns: ['id', 'name'] })
  //   .then(function(data) {
  //     console.log('success', data);
  //   })
  //   .catch(function(error) {
  //     console.log('error', error);
  //   })
}

/**
 * Insert facility into outfitFacility database
 * var obj = {
 *      (string)    facility_id
 *      (string)    outfit_id
 *      (boolean)   capture       [True if capture, false if defense]
 *      (timestamp) time
 * }
 */
function outfitFacilityInsert(obj) {
    bookshelf.knex('outfitFacility').insert(obj).then(function (data) {

    }).catch(function (err) {
        console.error('outfitFacilityInsert' + err);
    });
}

/**
 * Insert facility into playerFacility database
 *
 * var obj = {
 *      (string)    character_id
 *      (boolean)   capture       [True if capture, false if defense]
 *      (string)    facility_id
 *      (timestamp) time
 * }
 */
function playerFacilityInsert(obj) {
    bookshelf.knex('playerFacility').insert(obj).then(function (data) {

    }).catch(function (err) {
        console.error('playerFacilityInsert' + err);
    });
}

/**
 * Insert xp event into xp database
 *
 * var obj = {
 *      (string)    character_id
 *      (string)    experience_id
 *      (timestamp) time
 * }
 */
function xpInsert(obj) {
    bookshelf.knex('xp').insert(obj).then(function (data) {

    }).catch(function (err) {
        console.error('xpInsert' + err);
    });
}

/**
 * Insert character into player database
 *
 * var obj = {
 *      (string)    character_id
 *      (string)    outfit_id
 * }
 */
function playerInsert(obj) {
    bookshelf.knex('player').insert(obj).then(function (data) {

    }).catch(function (err) {
        console.error('playerInsert' + err);
    });
}

/**
 * Insert kill/death event into deaths database
 *
 * var obj = {
 *      (string)    attacker_character_id
        (string)    attacker_loadout_id
        (string)    attacker_vehicle_id
        (string)    loser_character_id
        (string)    loser_loadout_id
        (string)    loser_vehicle_id
        (boolean)   headshot
        (timestamp) time
 * }
 */
function deathsInsert(obj) {
    bookshelf.knex('deaths').insert(obj).then(function (data) {

    }).catch(function (err) {
        console.error('deathsInsert' + err);
    });
}

//  ******************
//  * Read Functions *
//  ******************

/**
 * Check if a player exists in the database
 */
function playerExists(id) {
    bookshelf.knex('player').where('character_id', id).select().then(function (data) {
        if ((data) && (data.length > 0)) { return true; }
        return false;
    }).catch(function (err) {
        console.log('playerExist' + err);
        return false
    });
}

/**
 * check if an outfit exists in the database
 */
function outfitExists(id) {
    bookshelf.knex('outfit').where('outfit_id', id).select().then(function (data) {
        if ((data) && (data.length > 0)) { return true; }
        return false;
    }).catch(function (err) {
        console.log('outfitExist' + err);
        return false
    });
}

// Inserts
exports.outfitInsert = outfitInsert;
exports.outfitFacilityInsert = outfitFacilityInsert;
exports.playerFacilityInsert = playerFacilityInsert;
exports.xpInsert = xpInsert;
exports.playerInsert = playerInsert;
exports.deathsInsert = deathsInsert;
// Check existences
exports.playerExists = playerExists;
exports.outfitExists = outfitExists;
