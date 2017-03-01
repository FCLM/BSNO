/**
 * Created by Dylan on 27-Feb-17.
 */
// Modules

// Files
var bookshelf = require('./bookshelf.js');

// Models
var mDeaths         = require('./models/deaths');
var mEvent          = require('./models/event');
var mOutfit         = require('./models/outfit');
var mOutfitFacility = require('./models/outfitFacility');
var mPlayer         = require('./models/player');
var mXP             = require('./models/xp');

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
 *     (integer)    faction
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
  mOutfit.forge(obj).save().then(function (result) {
      var id = result.get('id');
      console.log('Added outfit: ', id);
  }).catch(function (error) {
      console.error('outfitInsert ' + error);
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
 * }
 */
function outfitFacilityInsert(obj) {
    mOutfitFacility.forge(obj).save().then(function (result) {
            var id = result.get('id');
            console.log('Added outfit Facility: ', id);
    }).catch(function (error) {
            console.error('outfitFacilityInsert ' + error);
    });
}

/**
 * Insert xp event into xp database
 *
 * var obj = {
 *      (string)    character_id
 *      (string)    experience_id
 *      (integer)   event_id
 * }
 */
function xpInsert(obj) {
    mXP.forge(obj).save().then(function (result) {
        var id = result.get('id');
        console.log('Added xp event: ', id);
    }).catch(function (error) {
        console.error('xpInsert ' + error);
    });
}

/**
 * Insert character into player database
 *
 * var obj = {
 *      (string)    character_id
 *      (string)    outfit_id
 *      (boolean)   logged_in
 * }
 */
function playerInsert(obj) {
    mPlayer.forge(obj).save().then(function (result) {
        var id = result.get('id');
        console.log('Added player: ', id);
    }).catch(function (error) {
        console.error('playerInsert ' + error);
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
        (boolean)   is_headshot
        (integer)   event_id
 * }
 */
function deathsInsert(obj) {
    mDeaths.forge(obj).save().then(function (result) {
        var id = result.get('id');
        console.log('Added death: ', id);
    }).catch(function (error) {
        console.error('deathsInsert ' + error);
    });
}

/**
 * Creates a new event (inserts a new event)
 */
function eventCreate() {
    mEvent.forge().save().then(function (result) {
        var id = result.get('id');
        console.log('Created event:', id);
        return id;
    }).catch(function (error) {
        console.error('eventCreate ' + error);
        return -1;
    });
}

//  ******************
//  * Read Functions *
//  ******************

/**
 * Check if a player exists in the database
 */
function playerExists(id) {
    new mPlayer().query('where', 'character_id', '==', id).fetchAll().then(function (data) {
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
    new mOutfit().query('where', 'outfit_id', '==', id).fetchAll().then(function (data) {
        if ((data) && (data.length > 0)) { return true; }
        return false;
    }).catch(function (err) {
        console.log('outfitExists ' + err);
        return false
    });
}

/**
 * Updates the login status of the provided character to the provided boolean
 * Does not really check if the player exists, should be part of a different query than sent directly from websocket
 */
function playerLoginStatusUpdate(id, logged_in) {
    new mPlayer.query('where', 'character_id', '==', id).fetchAll().then(function (data) {
        if ((data) && (data.length > 0)) {
            var obj = data[0];
            obj.logged_in = logged_in;
            new mOutfit(obj).where({id: data.id}).save(null, {method: 'update'}).then(function (result) {
                console.log('playerLoginStatusUpdate:', result.attributes.id);
            }).catch(function (error) {
                console.error(error);
            });
        }
    }).catch(function (err) {
        console.error('playerLoginStatusUpdate ' + err);
    })
}

// Inserts
exports.outfitInsert            = outfitInsert;
exports.outfitFacilityInsert    = outfitFacilityInsert;
exports.xpInsert                = xpInsert;
exports.playerInsert            = playerInsert;
exports.deathsInsert            = deathsInsert;
exports.eventCreate             = eventCreate;
// Check existences
exports.playerExists            = playerExists;
exports.outfitExists            = outfitExists;
// Update
exports.playerLoginStatusUpdate = playerLoginStatusUpdate;
