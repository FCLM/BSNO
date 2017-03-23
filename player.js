/**
 * Created by dylancross on 1/03/17.
 */
// Modules
const prequest  = require('prequest');
const cron      = require('cron');
// Files
const database  = require('./database.js');
const api_key   = require('./api_key.js');
const mPlayer   = require('./models/player.js');
const mOutfit   = require('./models/outfit.js');
const bookshelf = require('./bookshelf.js');

/**
 * Gets sent an ID and looks up whether that player is in the tracked database TODO: check if it was updated with in the last ~month
 * If player is, do nothing
 * else look up player in API to find name & outfit
 */
async function checkPlayer(id, login) {
    new mPlayer()
        .where('character_id', id)
        .fetch()
        .then(function (data) {
            // If data is null that means the id doesn't exist in the database so we need to add it
            if (data === null) { insertPlayer(id, login); }
            // Else the exists so change their login status to what was passed in
            else { updateLoginStatus(id, login); }
        }).catch(function (err) {
        console.error('checkPlayer ' + id + ' ' + err);
    });

}

/**
 * Looks up a character in the daybreak API then inserts that data into the player table
 * Passes on the outfit information to check it is there & insert if not
 */
async function insertPlayer(id, login) {
    let player = await lookUpPlayer(id);
    // DEBUG:
    //console.log(player);
    if (player !== 0) {
        let obj = {
            name : player.name,
            character_id: id,
            outfit_id: player.outfit_id,
            logged_in: login,
            faction: player.faction
        };

        mPlayer.forge(obj).save().then(function (result) {
            const id = result.get('id');
            console.log('Added player: ', id);
        }).catch(function (error) {
            console.error('playerInsert ' + error);
        });

        checkOutfit(player);
    }
}

/**
 * Looks up the player and outfit data associated with a character_id from the DBG api
 * test url http://census.daybreakgames.com/s:example/get/ps2:v2/character/?character_id=5428010618020694593&c:resolve=outfit
 */
async function lookUpPlayer(id) {
    return new Promise((resolve, reject) => {
        const url = 'http://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2:v2/character/?character_id=' + id + '&c:resolve=outfit';
        prequest(url).then(function (body) {
            if (body.hasOwnProperty('character_list')) {
                let obj = {
                    name : body.character_list[0].name.first,
                    character_id : id,
                    faction : body.character_list[0].faction_id,
                    outfit_id : '0',
                    outfit_name : '0',
                    alias : '0'
                };
                if (body.character_list[0].hasOwnProperty('outfit')) {
                    obj.outfit_id = body.character_list[0].outfit.outfit_id;
                    obj.outfit_name = body.character_list[0].outfit.name;
                    obj.alias = body.character_list[0].outfit.alias;
                }
                return resolve(obj);
            }
           return resolve(0);
        }).catch(function (err) {
            console.error('lookUpPlayer ' + id + ' ' + err);
            reject(err);
        });
    })
}

/**
 * Updates the login status of the provided character to the value of login
 * Does not check if the player exists, should only be part of a different query that has checked this
 */
function updateLoginStatus(id, login) {
    new mPlayer()
        .where('character_id', id)
        .save({ 'logged_in' : login }, { patch : true })
        .then(function () {
            console.log('updated login status for ' + id);
        }).catch(function (err) {
        console.error('updateLoginStatus ' + err);
    })
}

/**
 * Uses the results from the lookUpPlayer() query and checks if the outfit_id exists in the outfit table
 * Sends an outfit object to insertOutfit() if it doesn't exist in the outfit table.
 * TODO: check if it was updated with in the last ~month
 */
function checkOutfit(results) {
    if (results.outfit_id !== '0') {
        new mOutfit()
            .where('outfit_id', results.outfit_id)
            .fetch()
            .then(function (data) {
                // If data is null that means the id doesn't exist in the database so we need to add it
                if (data === null) {
                    let obj = {
                        outfit_id: results.outfit_id,
                        alias: results.alias,
                        name: results.outfit_name,
                        faction: results.faction
                    };
                    insertOutfit(obj);
                }
            }).catch(function (err) {
            console.error('outfitExists ' + results.outfit_id + ' ' + err);
            callback(false);
        });
    }
}

/**
 * Inserts an obj in to the outfit table
 * obj requires:
 *      outfit_id
 *      alias
 *      name
 *      faction
 */
function insertOutfit(obj) {
    mOutfit.forge(obj).save().then(function (result) {
        const id = result.get('id');
        console.log('Added outfit: ', id);
    }).catch(function (error) {
        console.error('outfitInsert ' + error);
    });
}

/**
 * Run every hour and call logoutOldPlayers()
 */
let OldPlayers = new cron.CronJob({
    // Run every hour
    cronTime : '0 0 */24 * * *',
    onTick   : function () {
        logoutOldPlayers();
        console.log('Logging out players who have been logged in for more than 6 hours...');
    },
    start    : true,
    timeZone : 'UTC'
});

/**
 * Assigns logged_in to 0 if a player has been logged in for more than 6 hours
 * Called every hour by the above variable
 */
function logoutOldPlayers() {
    const sixHoursAgo = Date.now() - 21600000; // Timestamp for 6 hours ago
    bookshelf.knex.raw('SELECT character_id FROM player WHERE logged_in=1 AND updated_at<' + sixHoursAgo)
        .then(function (data) {
            console.log(data);
            data.forEach(function (d) {
                updateLoginStatus(d.character_id, false);
            })
        }).catch(function (err) {
            console.error('logoutOldPlayers ' + err);
    })
}

console.log(Date.now() - 28800000);
exports.checkPlayer = checkPlayer;