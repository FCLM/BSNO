/**
 * Created by dylancross on 14/03/17.
 */
var express = require('express');
var router = express.Router();
var database = require('../database.js');

var bookshelf = require('../bookshelf.js');
/*
let leaderboard = {
    kills : [],
    deaths : [],
    headshots : [],
    shields : [],
    heals : [],
    revives : [],
    resupplies : []
};*/

/*
 Action              ID      Squad Version ID
 Healing             4       51
 Revive              7       53
 Shielding           438     439
 Resupplying         34      55
 https://census.daybreakgames.com/get/ps2/experience?c:limit=1100
 */

/*
 * Return the top 25 in each category
 * /api/leaderboard = default event 0
 * /api/leaderboard?event_id=123 = event 123
 */
router.get('/', async function(req, res, next) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }
    let leaderboard = await getLeaderboard(event_id)
    res.render('api', { data : JSON.stringify(leaderboard) })
});

async function getLeaderboard(event_id) {
    let promises = [];
    promises.push(getLeaderboardKills(event_id));
    promises.push(getLeaderboardDeaths(event_id));
    promises.push(getLeaderboardHeadshots(event_id));
    promises.push(getLeaderboardShields(event_id));
    promises.push(getLeaderboardHeals(event_id));
    promises.push(getLeaderboardRevives(event_id));
    promises.push(getLeaderboardResupplies(event_id));

    let results = await Promise.all(promises);

    let leaderboard = {
        kills       : results[0],
        deaths      : results[1],
        headshots   : results[2],
        shields     : results[3],
        heals       : results[4],
        revives     : results[5],
        resupplies  : results[6]
    };
    console.log(leaderboard);

    return leaderboard;
}

function getLeaderboardKills(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, kill.k, kill.event_id FROM player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o ON player.outfit_id = o_id INNER JOIN (SELECT attacker_character_id AS attack_id, event_id, COUNT (attacker_character_id) as k FROM deaths GROUP BY attack_id) AS kill ON character_id = attack_id ORDER BY k desc LIMIT 25')
            .then (function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard kills ' + err);
                reject(err)
            });
        })
}

function getLeaderboardDeaths(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, death.d, death.event_id FROM player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o ON player.outfit_id = o_id INNER JOIN (SELECT loser_character_id AS death_id, event_id, COUNT (loser_character_id) AS d FROM deaths GROUP BY death_id) AS death ON character_id = death_id ORDER BY d desc LIMIT 25')
            .then(function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard deaths ' + err);
                reject(err);
        });
    })
}

function getLeaderboardHeadshots(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, hs.headshotKills, hs.event_id FROM player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o ON player.outfit_id = o_id INNER JOIN (SELECT attacker_character_id AS hs_id, event_id, COUNT (is_headshot) as headshotKills FROM deaths GROUP BY hs_id) AS hs ON character_id = hs_id ORDER BY headshotKills desc LIMIT 25')
            .then (function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard headshots ' + err);
                reject(err);
        });
    })
}

function getLeaderboardShields(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=438 AND event_id='+ event_id + ' OR experience_id=439 AND event_id='+ event_id + ' GROUP BY character_id ORDER BY xpEvent DESC LIMIT 25')
            .then (function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard shields ' + err);
                reject(err);
        });
    })
}

function getLeaderboardHeals(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=4 AND event_id='+ event_id + ' OR experience_id=51 AND event_id='+ event_id + ' GROUP BY character_id ORDER BY xpEvent DESC LIMIT 25')
            .then (function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard heals ' + err);
                reject(err);
        });
    })
}

function getLeaderboardRevives(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=7 AND event_id='+ event_id + ' OR experience_id=53 AND event_id='+ event_id + ' GROUP BY character_id ORDER BY xpEvent DESC LIMIT 25')
            .then (function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard revives ' + err);
                reject(err);
        });
    })
}

function getLeaderboardResupplies(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=34 AND event_id='+ event_id + ' OR experience_id=55 AND event_id='+ event_id + ' GROUP BY character_id ORDER BY xpEvent DESC LIMIT 25')
            .then (function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard resupplies ' + err);
                reject(err);
        });
    })
}

module.exports = router;
