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
 *
 * var obj = {
 *      (string)    facility_id
 *      (string)    outfit_id
 *      (boolean)   capture       [True if capture, false if defense]
 *      (integer)   event_id
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
function eventCreate(callback) {
    mEvent.forge().save().then(function (result) {
        callback(result.get('id'));
    }).catch(function (error) {
        console.error('eventCreate ' + error);
        callback(-1);
    });
}

//  ******************
//  * Read Functions *
//  ******************

/**
 * Check if a player exists in the database
 * makes callback true if it does
 */
function playerExists(id, callback) {
    new mPlayer()
        .where('character_id', id)
        .fetch()
        .then(function (data) {
            if (data === null) { callback(false); }
            else { callback(true); }
    }).catch(function (err) {
        console.error('playerExists ' + id + ' ' + err);
        callback(false);
    });
}

/**
 * check if an outfit exists in the database
 * makes callback true if it does
 */
function outfitExists(id, callback) {
    new mOutfit()
        .where('outfit_id', id)
        .fetch()
        .then(function (data) {
            if (data === null) { callback(false); }
            else { callback(true); }
    }).catch(function (err) {
        console.error('outfitExists ' + id + ' ' + err);
        callback(false);
    });
}

/**
 * Updates the login status of the provided character to the provided boolean
 * Does not really check if the player exists, should be part of a different query than sent directly from websocket
 */
function playerLoginStatusUpdate(id, logged_in) {
    new mPlayer({'character_id' : id})
        .fetch().save({'logged_in' : logged_in})
        .then(function () {
            console.log('updated login status for ' + id);
    }).catch(function (err) {
        console.error('playerLoginStatusUpdate ' + err);
    })
}

/**
 * Retrieve a specific outfit from the outfit table
 */
function outfitRetrieve(id, callback) {
    new mOutfit()
        .query('where', 'outfit_id', '=', id)
        .fetch().then(function (data) {
            callback(data.attributes);
    }).catch(function (err) {
        console.error('outfitRetrieve ' + err);
        callback(0);
    })
}

/**
 * Retrieve a specific outfitFacility facility (no ids for events) from the outfitFacility table
 */
function outfitFacilityRetrieve(id, callback) {
    new mOutfitFacility()
        .query('where', 'facility_id', '=', id)
        .fetch().then(function (data) {
            callback(data.attributes);
    }).catch(function (err) {
        console.error('outfitFacilityRetrieve ' + err);
    })
}

/**
 * Retrieve a specific xp event (no ids for events) from the xp table
 */
function xpRetrieve(id, callback) {
    new mXP()
        .query('where', 'experience_id', '=', id)
        .fetch().then(function (data) {
            callback(data);
    }).catch(function (err) {
        console.error('xpRetrieve ' + err);
    })
}

/**
 * Retrieve a specific player from the player table
 */
function playerRetrieve(id, callback) {
    new mPlayer()
        .query('where', 'character_id', '=', id)
        .fetch().then(function (data) {
            callback(data);
    }).catch(function (err) {
        console.error('playerRetrieve ' + err);
    })
}

/**
 * Retrieve a specific attacker_character_id's kill events from the deaths table
 */
function deathsRetrieve(id, callback) {
    new mDeaths()
        .query('where', 'attacker_character_id', '=', id)
        .fetch().then(function (data) {
            callback(data);
    }).catch(function (err) {
        console.error('playerRetrieve ' + err);
    })
}

//  ***********************
//  * Front End Functions *
//  ***********************

/**
 * Gets the current number of logged in players (characters with logged_in == 1 in the player table)
 * Will return -1 if there is an error
 *
 * Raw SQL for getting the online players in case you need to check
 *
 * SELECT COUNT(character_id) AS online FROM player WHERE logged_in=1;
 */
function playerGetLoggedIn(callback) {
    new mPlayer()
        .query('where', 'logged_in', '=', 1)
        .count('character_id')
        .then(function (data) {
            //console.log(data);
            callback(data);
    }).catch(function (err) {
        console.error('playerCountLoggedIn' + err);
        callback(-1);
    })
}

/**
 * Counts the xp events of a certain type per player
 * Will return an array or -1 on error
 *
 * Raw SQL using {1} in place of an {id}:
 * SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=1 GROUP BY character_id;
 *
 * SELECT character_id, COUNT(character_id)
 FROM xp
 INNER JOIN player
 ON player.character_id=xp.character_id
 WHERE experience_id=1
 GROUP BY character_id
 */
function xpGetEventByID(id, callback) {
    bookshelf.knex('xp').select(bookshelf.knex.raw('character_id, COUNT(character_id) AS xpEvent')).where('experience_id', '=', id).groupBy('character_id').then(function (data) {
        //console.log(data);
        callback(data);
    }).catch(function (err) {
        console.error('xpGetEventsByID ' + id + ' ' + err);
        callback(-1);
    })
}
/**
 * Return the kills/deaths/headshots of all characters for an event
 * select all ids that were involved in the event,
 * count kills & headshots, deaths
 * join the player data (name, outfit_id) for that character
 * return it
 * Raw SQL for testing:
     SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, death.d, kill.k, hs.headshotKills, death.event_id FROM player
        INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o
            ON player.outfit_id = o_id
         INNER JOIN (SELECT loser_character_id AS death_id, event_id, COUNT (loser_character_id) AS d FROM deaths GROUP BY death_id) AS death
            ON character_id = death_id
        INNER JOIN (SELECT attacker_character_id AS attack_id, COUNT (attacker_character_id) as k FROM deaths GROUP BY attack_id) AS kill
            ON character_id = attack_id
        INNER JOIN (SELECT attacker_character_id AS hs_id, COUNT (is_headshot) as headshotKills FROM deaths GROUP BY hs_id) AS hs
            ON character_id = hs_id
 * TODO: Return only the ones that happened for an event id
 */
function playerGetParticipantsKDH(event_id, callback) {
    bookshelf.knex.raw(
        "SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, death.d, kill.k, hs.headshotKills, death.event_id FROM player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o ON player.outfit_id = o_id INNER JOIN (SELECT loser_character_id AS death_id, event_id, COUNT (loser_character_id) AS d FROM deaths GROUP BY death_id) AS death ON character_id = death_id INNER JOIN (SELECT attacker_character_id AS attack_id, COUNT (attacker_character_id) as k FROM deaths GROUP BY attack_id) AS kill ON character_id = attack_id INNER JOIN (SELECT attacker_character_id AS hs_id, COUNT (is_headshot) as headshotKills FROM deaths GROUP BY hs_id) AS hs ON character_id = hs_id")
        .then(function (data) {
            //console.log(data);
            callback(data);
        }).catch(function (err) {
            console.log('playerGetParticipantsKDH ' + err);
            callback(-1);
        })
}

/**
 * Return the outfits that had facility captures or defenses for an event
 * Raw SQL for testing:
     SELECT outfit_id AS _id, alias AS _alias, name AS _name, f.capture, f.defense FROM outfit
        INNER JOIN(SELECT outfit_id AS fac_id, SUM(capture=1) AS capture, SUM(capture=0) AS defense FROM outfitFacility GROUP BY fac_id) AS f
            ON _id = fac_id
 * TODO: Return only the ones that happened for an event id
 */
function outfitFacilityGetFacilities(event_id, callback) {
    bookshelf.knex.raw(
        "SELECT outfit_id AS _id, alias AS _alias, name AS _name, f.capture, f.defense FROM outfit INNER JOIN(SELECT outfit_id AS fac_id, SUM(capture=1) AS capture, SUM(capture=0) AS defense FROM outfitFacility GROUP BY fac_id) AS f ON _id = fac_id")
        .then(function (data) {
            //console.log(data);
            callback(data);
        }).catch(function (err){
            console.error('outfitFacilityGetFacilities ' + err);
            callback(-1);
        })
}

// Inserts
exports.outfitInsert                = outfitInsert;
exports.outfitFacilityInsert        = outfitFacilityInsert;
exports.xpInsert                    = xpInsert;
exports.playerInsert                = playerInsert;
exports.deathsInsert                = deathsInsert;
exports.eventCreate                 = eventCreate;
// Check existences
exports.playerExists                = playerExists;
exports.outfitExists                = outfitExists;
// Update
exports.playerLoginStatusUpdate     = playerLoginStatusUpdate;
// Retrieve
exports.outfitRetrieve              = outfitRetrieve;
exports.outfitFacilityRetrieve      = outfitFacilityRetrieve;
exports.xpRetrieve                  = xpRetrieve;
exports.playerRetrieve              = playerRetrieve;
exports.deathsRetrieve              = deathsRetrieve;
exports.playerGetLoggedIn           = playerGetLoggedIn;
exports.playerGetParticipantsKDH    = playerGetParticipantsKDH;
exports.xpGetEventByID              = xpGetEventByID;
exports.outfitFacilityGetFacilities = outfitFacilityGetFacilities;

// Test area (temp)
/*playerGetParticipantsKDH(15, function (data) {
    console.log(data);
});*/