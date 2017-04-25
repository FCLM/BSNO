/**
 * Created by Dylan on 27-Feb-17.
 */
// Files
const bookshelf = require('./bookshelf.js');

// Models
const mDeaths         = require('./models/deaths');
const mEvent          = require('./models/event');
const mOutfit         = require('./models/outfit');
const mFacility       = require('./models/facility');
const mPlayer         = require('./models/player');
const mXP             = require('./models/xp');

//  ********************
//  * Insert Functions *
//  ********************

/**
 * Insert facility into facility database
 *
 * var obj = {
 *      (string)    facility_id
 *      (string)    outfit_id
 *      (boolean)   capture       [True if capture, false if defense]
 *      (integer)   event_id
 * }
 */
function facilityInsert(obj) {
    mFacility.forge(obj).save().then(function (result) {

    }).catch(function (error) {
        console.error('facilityInsert ' + error);
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

    }).catch(function (error) {
        console.error('xpInsert ' + error);
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
 * Retrieve a specific facility facility (no ids for events) from the facility table
 */
function facilityRetrieve(id, callback) {
    new mFacility()
        .query('where', 'facility_id', '=', id)
        .fetch().then(function (data) {
            callback(data.attributes);
    }).catch(function (err) {
        console.error('facilityRetrieve ' + err);
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
        INNER JOIN(SELECT outfit_id AS fac_id, SUM(capture=1) AS capture, SUM(capture=0) AS defense FROM facility GROUP BY fac_id) AS f
            ON _id = fac_id
 * TODO: Return only the ones that happened for an event id
 */
function facilityGetFacilities(callback) {
    bookshelf.knex.raw(
        "SELECT outfit_id AS _id, alias AS _alias, name AS _name, f.capture, f.defense FROM outfit INNER JOIN(SELECT outfit_id AS fac_id, SUM(capture=1) AS capture, SUM(capture=0) AS defense FROM facility GROUP BY fac_id) AS f ON _id = fac_id")
        .then(function (data) {
            //console.log(data);
            callback(data);
        }).catch(function (err){
            console.error('facilityGetFacilities ' + err);
            callback(-1);
        })
}

// Inserts
exports.facilityInsert              = facilityInsert;
exports.xpInsert                    = xpInsert;
exports.deathsInsert                = deathsInsert;
exports.eventCreate                 = eventCreate;
// Retrieve
exports.outfitRetrieve              = outfitRetrieve;
exports.facilityRetrieve            = facilityRetrieve;
exports.xpRetrieve                  = xpRetrieve;
exports.playerRetrieve              = playerRetrieve;
exports.deathsRetrieve              = deathsRetrieve;
exports.playerGetLoggedIn           = playerGetLoggedIn;
exports.playerGetParticipantsKDH    = playerGetParticipantsKDH;
exports.xpGetEventByID              = xpGetEventByID;
exports.facilityGetFacilities       = facilityGetFacilities;

// Test area (temp)
/*playerGetParticipantsKDH(15, function (data) {
    console.log(data);
});*/