/**
 * Created by dylancross on 1/03/17.
 */
// Modules
var Q         = require('q');
var prequest  = require('prequest');
// Files
var database  = require('./database.js');
var api_key   = require('./api_key.js');

/**
 * Gets sent an ID and looks up whether that player is in the tracked database TODO: check if it was updated with in the last ~month
 * If player is, do nothing
 * else look up player in API to find name & outfit
 */
function checkPlayer(id, login) {
    database.playerExists(id, function (exists) {
        if (exists === false) {
            var promise = lookUpPlayer(id);

            return promise.then(function (results) {
                var obj = {
                    name : results.name,
                    character_id: id,
                    outfit_id: results.outfit_id,
                    logged_in: login
                };
                database.playerInsert(obj);
                checkOutfit(results);
            });
        }
        else {
            database.playerLoginStatusUpdate(id, login);
        }
    });
}

/**
 * Gets the player (and their outfit) details from the API
 * factions: 0 - NS, 1 - VS, 2 - NC, 3 - TR
 */
function lookUpPlayer(id) {
    var response = Q.defer();
    var url = 'http://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2:v2/character/?character_id=' + id + '&c:resolve=outfit';
    // http://census.daybreakgames.com/s:example/get/ps2:v2/character/?character_id=5428010618020694593&c:resolve=outfit
    prequest(url).then(function (body) {
        var obj = {
            name : body.character_list[0].name.first,
            character_id : id,
            faction : body.character_list[0].faction_id,
            outfit_id : body.character_list[0].outfit.outfit_id,
            outfit_name : body.character_list[0].outfit.name,
            alias : body.character_list[0].outfit.alias
        };
        return response.resolve(obj);
    }).catch(function (err) {
        response.reject(err);
    });
    return response.promise;
}

/**
 * Checks if the outfit exists in the database and adds it if it doesn't
 */
function checkOutfit(results) {
    database.outfitExists(results.outfit_id, function (exists) {
        console.log('outfit exists' + exists);
        if (!exists) {
            var obj = {
                outfit_id : results.outfit_id,
                alias : results.alias,
                name : results.outfit_name,
                faction : results.faction
            };
            console.log(obj);
            database.outfitInsert(obj);
        }
    });
}

exports.checkPlayer     = checkPlayer;
exports.lookUpPlayer    = lookUpPlayer;
exports.checkOutfit     = checkOutfit;

checkPlayer("5428010618020694593", true);