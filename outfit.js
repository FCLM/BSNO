/**
 * Created by dylancross on 28/02/17.
 */
//modules
var prequest = require('prequest');
var Q = require('q');
//files
var api_key = require('./api_key.js');

function getOutfitFromID(id) {
    let response = Q.defer();
    const url = 'https://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2/outfit/?outfit_id=' + id + '&c:resolve=leader(faction_id),member_character(name.first,battle_rank.value)&c:hide=time_created,time_created_date';
    //https://census.daybreakgames.com/s:example/get/ps2/outfit/?outfit_id=37512545478648131&c:resolve=leader(faction_id),member_character(name.first,battle_rank.value)&c:hide=time_created,time_created_date
    prequest(url).then(function (body) {
        let obj = {
            outfit_id : id,
            alias : body[0].alias,
            name : body[0].name,
            members : {},
            faction : body[0].leader.faction_id
        };
        return response.resolve(obj);
    }).catch(function (err) {
        response.reject(err);
    });
    return response.promise;
}