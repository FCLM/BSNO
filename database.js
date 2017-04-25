/**
 * Created by Dylan on 27-Feb-17.
 */
// Files
const bookshelf = require('./bookshelf.js');

// Models
const mDeaths         = require('./models/deaths');
const mEvent          = require('./models/event');
const mFacility       = require('./models/facility');
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


// Inserts
exports.facilityInsert              = facilityInsert;
exports.xpInsert                    = xpInsert;
exports.deathsInsert                = deathsInsert;
exports.eventCreate                 = eventCreate;
