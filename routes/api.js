/**
 * Created by dylancross on 15/03/17.
 */
const express = require('express');
const router = express.Router();
const bookshelf = require('../bookshelf.js');

router.get('/', async function(req, res, next) {
    // /api/??
    const url = req.baseUrl;
    switch (url) {
        case '/api/events':
            apiEvent(res);
            break;
        case '/api/current_players':
            apiCurrentPlayers(res);
            break;
        case '/api/facilities':
            apiFacilities(req, res);
            break;
        case '/api/player_kdh':
            apiPlayerKDH(req,res);
            break;
        case '/api/outfit_kdh':
            apiOutfitKDH(req, res);
            break;
        case '/api/player_leaderboard':
            apiPlayerLeaderboard(req, res);
            break;
        case '/api/outfit_leaderboard':
            apiOutfitLeaderboard(req,res);
            break;
        default:
            apiHome(res);
            break;
    }
});

/**
 * Population API
 * factions from DBG api: 0 - NS, 1 - VS, 2 - NC, 3 - TR
 */
async function apiCurrentPlayers(res) {

    let online = await getCurrentPlayers();
    res.render('api', { data : JSON.stringify(online) })
}

async function getCurrentPlayers() {
    let promises = [];

    promises.push(getTotalPlayers());
    promises.push(getFactionPlayers(1)); // VS
    promises.push(getFactionPlayers(2)); // NC
    promises.push(getFactionPlayers(3)); // TR

    let results = await Promise.all(promises);
    let online = {
        total : results[0],
        vs : results[1],
        nc : results[2],
        tr : results[3],
        timestamp : Date.now()
    };

    return online;
}

async function getTotalPlayers() {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT COUNT(character_id) AS online FROM player WHERE logged_in=1')
            .then(function (data) {
                //console.log(data[0].online);
                resolve(data[0].online);
            }).catch(function (err) {
            console.error('getTotalPlayers ' + err);
            resolve(0);
        })
    })
}

// 1 = VS, 2 = NC, 3 = TR
async function getFactionPlayers(faction) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT COUNT(character_id) AS online FROM player WHERE logged_in=1 AND faction=' + faction)
            .then(function (data) {
                //console.log(data[0].online);
                resolve(data[0].online);
            }).catch(function (err) {
            console.error('getTotalPlayers ' + err);
            resolve(0);
        })
    })
}


/**
 * Outfit Facility interaction API
 */
async function apiFacilities(req, res) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }

    let facilities = await getFacilities(event_id);
    res.render('api', { data : JSON.stringify(facilities) });
}

async function getFacilities(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT outfit_id AS _id, alias AS _alias, name AS _name, f.capture, f.defense FROM outfit INNER JOIN(SELECT outfit_id AS fac_id, SUM(capture=1) AS capture, SUM(capture=0) AS defense FROM outfitFacility WHERE event_id=' + event_id +' GROUP BY fac_id) AS f ON _id = fac_id')
            .then(function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err){
                console.error('outfitFacilityGetFacilities ' + err);
                resolve(0);
            })
    })
}

/**
 * Player KDH API
 */
async function apiPlayerKDH(req, res) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }

    let data = await getPlayerKDH(event_id);
    res.render('api', { data: JSON.stringify(data) });
}

async function getPlayerKDH(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, death.d, kill.k, hs.headshotKills, death.event_id FROM player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o ON player.outfit_id = o_id INNER JOIN (SELECT loser_character_id AS death_id, event_id, COUNT (loser_character_id) AS d FROM deaths WHERE event_id=' + event_id + '  GROUP BY death_id) AS death ON character_id = death_id INNER JOIN (SELECT attacker_character_id AS attack_id, COUNT (attacker_character_id) as k FROM deaths WHERE event_id=' + event_id + '  GROUP BY attack_id) AS kill ON character_id = attack_id INNER JOIN (SELECT attacker_character_id AS hs_id, COUNT (is_headshot) as headshotKills FROM deaths WHERE event_id=' + event_id + '  GROUP BY hs_id) AS hs ON character_id = hs_id')
            .then(function (data) {
                //console.log(data);
                resolve(data);
            })
            .catch(function (err) {
                console.error('getPlayerKDH ' + err);
                resolve(0);
            })
    });
}

/**
 * Outfit KDH API
 */
async function apiOutfitKDH(req, res) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }
    let data = await getPlayerKDHSortedByOutfit(event_id);
    let outfits = await outfitFromPlayers(data);
    res.render('api', { data: JSON.stringify(outfits) });
}

async function getPlayerKDHSortedByOutfit(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id,  o.faction, outfit_id,  o.o_name, o.o_alias, death.d, kill.k, hs.headshotKills, death.event_id FROM player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o ON player.outfit_id = o_id INNER JOIN (SELECT loser_character_id AS death_id, event_id, COUNT (loser_character_id) AS d FROM deaths WHERE event_id='+ event_id +'  GROUP BY death_id) AS death ON character_id = death_id INNER JOIN (SELECT attacker_character_id AS attack_id, COUNT (attacker_character_id) as k FROM deaths WHERE event_id='+ event_id +'  GROUP BY attack_id) AS kill ON character_id = attack_id INNER JOIN (SELECT attacker_character_id AS hs_id, COUNT (is_headshot) as headshotKills FROM deaths WHERE event_id='+ event_id +'  GROUP BY hs_id) AS hs ON character_id = hs_id ORDER BY outfit_id')
            .then(function (data) {
                //console.log(data);
                resolve(data);
            })
            .catch(function (err) {
                console.error('getPlayerKDH ' + err);
                resolve(0);
            })
    });
}

async function outfitFromPlayers(data) {
    if (data.length > 0) {
        let outfits = [];
        outfits[0] = {
            outfit_id : data[0].outfit_id,
            name      : data[0].o_name,
            alias     : data[0].o_alias,
            faction   : data[0].faction,
            k         : data[0].k,
            d         : data[0].d,
            h         : data[0].headshotKills,
            members   : 1
        };
        // remove first member of array
        data.shift();
        let i = 0;
        data.forEach(function (d) {
            if (outfits[i].outfit_id === d.outfit_id) {
                outfits[i].k += d.k;
                outfits[i].d += d.d;
                outfits[i].h += d.h;
                outfits[i].members += 1;
            } else {
                i++;
                outfits[i] = {
                    outfit_id : d.outfit_id,
                    name      : d.o_name,
                    alias     : d.o_alias,
                    faction   : d.faction,
                    k         : d.k,
                    d         : d.d,
                    h         : d.headshotKills,
                    members   : 1
                };
            }
        });
        return outfits
    }
    else { return 0; }
}

/**
 * Player leaderboard API
 */

async function apiPlayerLeaderboard(req, res) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }
    let leaderboard = await getPlayerLeaderboard(event_id);
    res.render('api', { data : JSON.stringify(leaderboard) })
}

async function getPlayerLeaderboard(event_id) {
    let promises = [];
    promises.push(getPlayerLeaderboardKills(event_id));
    promises.push(getPlayerLeaderboardDeaths(event_id));
    promises.push(getPlayerLeaderboardHeadshots(event_id));
    promises.push(getPlayerLeaderboardShields(event_id));
    promises.push(getPlayerLeaderboardHeals(event_id));
    promises.push(getPlayerLeaderboardRevives(event_id));
    promises.push(getPlayerLeaderboardResupplies(event_id));

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

    return leaderboard;
}

function getPlayerLeaderboardKills(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, kill.k, kill.event_id FROM player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o ON player.outfit_id = o_id INNER JOIN (SELECT attacker_character_id AS attack_id, event_id, COUNT (attacker_character_id) as k FROM deaths GROUP BY attack_id) AS kill ON character_id = attack_id ORDER BY k desc LIMIT 25')
            .then (function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard kills ' + err);
                resolve(0);
            });
    })
}

function getPlayerLeaderboardDeaths(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, death.d, death.event_id FROM player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o ON player.outfit_id = o_id INNER JOIN (SELECT loser_character_id AS death_id, event_id, COUNT (loser_character_id) AS d FROM deaths GROUP BY death_id) AS death ON character_id = death_id ORDER BY d desc LIMIT 25')
            .then(function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard deaths ' + err);
                resolve(0);
            });
    })
}

function getPlayerLeaderboardHeadshots(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, hs.headshotKills, hs.event_id FROM player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o ON player.outfit_id = o_id INNER JOIN (SELECT attacker_character_id AS hs_id, event_id, COUNT (is_headshot) as headshotKills FROM deaths GROUP BY hs_id) AS hs ON character_id = hs_id ORDER BY headshotKills desc LIMIT 25')
            .then (function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard headshots ' + err);
                resolve(0);
            });
    })
}

function getPlayerLeaderboardShields(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=438 AND event_id='+ event_id + ' OR experience_id=439 AND event_id='+ event_id + ' GROUP BY character_id ORDER BY xpEvent DESC LIMIT 25')
            .then (function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard shields ' + err);
                resolve(0);
            });
    })
}

function getPlayerLeaderboardHeals(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=4 AND event_id='+ event_id + ' OR experience_id=51 AND event_id='+ event_id + ' GROUP BY character_id ORDER BY xpEvent DESC LIMIT 25')
            .then (function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard heals ' + err);
                resolve(0);
            });
    })
}

function getPlayerLeaderboardRevives(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=7 AND event_id='+ event_id + ' OR experience_id=53 AND event_id='+ event_id + ' GROUP BY character_id ORDER BY xpEvent DESC LIMIT 25')
            .then (function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard revives ' + err);
                resolve(0);
            });
    })
}

function getPlayerLeaderboardResupplies(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=34 AND event_id='+ event_id + ' OR experience_id=55 AND event_id='+ event_id + ' GROUP BY character_id ORDER BY xpEvent DESC LIMIT 25')
            .then (function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('playerLeaderboard resupplies ' + err);
                resolve(0);
            });
    })
}

/**
 * Outfit Leaderboard API
 */
async function apiOutfitLeaderboard(req, res, next) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }

    let leaderboard = await getOutfitLeaderboard(event_id);
    res.render('api', { data : JSON.stringify(leaderboard) })
}

async function getOutfitLeaderboard(event_id) {
    let promises = [];
    promises.push(getOutfitLeaderboardKills(event_id));
    promises.push(getOutfitLeaderboardDeaths(event_id));
    promises.push(getOutfitLeaderboardCaptures(event_id));
    promises.push(getOutfitLeaderboardDefenses(event_id));

    let results = await Promise.all(promises);

    let leaderboard = {
        kills       : results[0],
        deaths      : results[1],
        captures    : results[2],
        defenses    : results[3]
    };

    return leaderboard;
}
function getOutfitLeaderboardKills(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw()
            .then(function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('getLeaderboardKills ' + err);
                resolve(0);
            })
    })
}

function getOutfitLeaderboardDeaths(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw()
            .then(function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('getLeaderboardDeaths ' + err);
                resolve(0);
            })
    })
}

function getOutfitLeaderboardCaptures(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT outfit_id AS _id, alias AS _alias, name AS _name, f.capture FROM outfit INNER JOIN(SELECT outfit_id AS fac_id, SUM(capture=1) AS capture FROM outfitFacility WHERE event_id=' + event_id + ' GROUP BY fac_id) AS f ON _id = fac_id ORDER BY capture DESC LIMIT 25')
            .then(function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('getLeaderboardCaptures ' + err);
                resolve(0);
            })
    })
}

function getOutfitLeaderboardDefenses(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT outfit_id AS _id, alias AS _alias, name AS _name, f.defense FROM outfit INNER JOIN(SELECT outfit_id AS fac_id, SUM(capture=0) AS defense FROM outfitFacility WHERE event_id=' + event_id + ' GROUP BY fac_id) AS f ON _id = fac_id ORDER BY defense DESC LIMIT 25')
            .then(function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('getLeaderboardDefenses ' + err);
                resolve(0);
            })
    })
}

/**
 * Events API
 */

async function apiEvent(res) {
    let event = await getEvents();
    res.render('api', { data : JSON.stringify(event) });
}

function getEvents() {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT id, created_at FROM Event')
            .then(function (data) {
                //console.log(data);
                let d = eventTimestampToDate(data);
                resolve(d);
            }).catch(function (err) {
                console.error('getEvents ' + err);
                resolve(0);
        })
    })
}

async function eventTimestampToDate(data) {
    return new Promise((resolve) => {
        data.forEach(function (d) {
            d.created_at = new Date(d.created_at);
        });
        //console.log(data);
        resolve(data);
    })
}

/**
 * API Home Page
 */
function apiHome(res) {
    res.render('api_home', {
        current_player_example      : JSON.stringify(currentPlayersExample),
        player_kdh_example          : JSON.stringify(playerKDHExample),
        outfit_kdh_example          : JSON.stringify(outfitKDHExample),
        facilities_example          : JSON.stringify(facilitiesExample),
        player_leaderboard_example  : JSON.stringify(playerLBExample),
        outfit_leaderboard_example  : JSON.stringify(outfitLBExample)
    });
}

const currentPlayersExample = {
    total   : 0,
    vs      : 0,
    tr      : 0,
    nc      : 0
};

const playerKDHExample = {

};

const outfitKDHExample = {

};

const facilitiesExample = {

};

const playerLBExample = {
    kills       : [],
    deaths      : [],
    headshots   : [],
    shields     : [],
    heals       : [],
    revives     : [],
    resupplies  : []
};

const outfitLBExample = {
    kills       : [],
    deaths      : [],
    headshots   : [],
    shields     : [],
    heals       : [],
    revives     : [],
    resupplies  : []
};

module.exports = router;