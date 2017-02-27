/**
 * Created by Dylan on 27-Feb-17.
 */
// Modules

// Files
var bookshelf = require('./bookshelf.js');
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

}

/**
 * Insert character into tracked database
 *
 * var obj = {
 *      (string)    character_id
 *      (string)    outfit_id
 *      (timestamp) time
 * }
 */
function trackedInsert(obj) {

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

}

//  ******************
//  * Read Functions *
//  ******************
/**
 * Read outfit from outfit database
 */
function outfitRead() {

}

/**
 * Read facility from outfitFacility database
 */
function outfitFacilityRead() {

}

/**
 * Read facility from playerFacility database
 */
function playerFacilityRead() {

}

/**
 * Read xp event from xp database
 */
function xpRead() {

}

/**
 * Read character from tracked database
 */
function trackedRead() {

}

/**
 * Read kill/death event from deaths database
 */
function deathsRead() {

}

exports.outfitInsert = outfitInsert;
exports.outfitFacilityInsert = outfitFacilityInsert;
exports.playerFacilityInsert = playerFacilityInsert;
exports.xpInsert = xpInsert;
exports.trackedInsert = trackedInsert;
exports.deathsInsert = deathsInsert;
exports.outfitRead = outfitRead;
exports.outfitFacilityRead = outfitFacilityRead;
exports.playerFacilityRead = playerFacilityRead;
exports.xpRead = xpRead;
exports.trackedRead = trackedRead;
exports.deathsRead = deathsRead;

