/**
 * Created by dylancross on 15/03/17.
 */
const express = require('express');
const router = express.Router();
const bookshelf = require('../bookshelf.js');

router.get('/', async function(req, res, next) {
    // /api/??
    let limit = 0;
    if (req.query.limit > 0) { limit = req.query.limit; }

    const url = req.baseUrl;
    switch (url) {
        case "/api/events":
            await apiEvent(res, limit);
            break;
        case "/api/event":
            await apiEventDetails(res, req);
            break;
        case "/api/current_players":
            await apiCurrentPlayers(res);
            break;
        case "/api/facilities":
            await apiFacilities(req, res, limit);
            break;
        case "/api/player_kdh":
            await apiPlayerKDH(req,res, limit);
            break;
        case "/api/outfit_kdh":
            await apiOutfitKDH(req, res, limit);
            break;
        case "/api/player_leaderboard":
            await apiPlayerLeaderboard(req, res, limit);
            break;
        case "/api/outfit_leaderboard":
            await apiOutfitLeaderboard(req, res, limit);
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
    res.status(200).jsonp(online);
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
        bookshelf.knex.raw("SELECT COUNT(character_id) AS online FROM player WHERE logged_in=1").then(function (data) {
            //console.log(data[0].online);
            resolve(data[0].online);
        }).catch(function (err) {
            console.error("getTotalPlayers " + err);
            resolve(0);
        })
    })
}

// 1 = VS, 2 = NC, 3 = TR
async function getFactionPlayers(faction) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw("SELECT COUNT(character_id) AS online FROM player WHERE logged_in=1 AND faction=" + faction).then(function (data) {
            //console.log(data[0].online);
            resolve(data[0].online);
        }).catch(function (err) {
            console.error("getTotalPlayers " + err);
            resolve(0);
        })
    })
}


/**
 * Outfit Facility interaction API
 */
async function apiFacilities(req, res, limit) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }
    let query = "SELECT outfit_id AS _id, alias AS _alias, name AS _name, f.capture, f.defense FROM outfit "
        + "INNER JOIN(SELECT outfit_id AS fac_id, SUM(capture=1) AS capture, SUM(capture=0) AS defense FROM outfitFacility"
        + " WHERE event_id=" + event_id +" GROUP BY fac_id) AS f ON _id = fac_id";
    if (limit !== 0) { query += " LIMIT " + limit; }

    let facilities = await getFacilities(query);
    res.status(200).jsonp(facilities);
}

async function getFacilities(query) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw(query)
            .then(function (data) {
                //console.log(data);
                resolve(data);
            }).catch(function (err){
                console.error("outfitFacilityGetFacilities " + err);
                resolve(0);
            })
    })
}

/**
 * Player KDH API
 */
async function apiPlayerKDH(req, res, limit) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }
    let query = "SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, death.d, kill.k, "
        + "hs.headshotKills, death.event_id FROM player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, "
        + "alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o ON player.outfit_id = o_id INNER JOIN "
        + "(SELECT loser_character_id AS death_id, event_id, COUNT (loser_character_id) AS d FROM deaths "
        + "WHERE event_id=" + event_id + "  GROUP BY death_id) AS death ON character_id = death_id INNER JOIN "
        + "(SELECT attacker_character_id AS attack_id, COUNT (attacker_character_id) as k FROM deaths "
        + "WHERE event_id=" + event_id + "  GROUP BY attack_id) AS kill ON character_id = attack_id INNER JOIN "
        + "(SELECT attacker_character_id AS hs_id, SUM (is_headshot) as headshotKills FROM deaths "
        + "WHERE event_id=" + event_id + "  GROUP BY hs_id) AS hs ON character_id = hs_id";
    if (limit !== 0) { query += " LIMIT " + limit; }

    let data = await getPlayerKDH(query);
    res.status(200).jsonp(data);
}

async function getPlayerKDH(query) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw(query)
            .then(function (data) {
                //console.log(data);
                resolve(data);
            })
            .catch(function (err) {
                console.error("getPlayerKDH " + err);
                resolve(0);
            })
    });
}

/**
 * Outfit KDH API
 */
async function apiOutfitKDH(req, res, limit) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }

    let query = "SELECT character_id,  o.faction, outfit_id,  o.o_name, o.o_alias, death.d, kill.k, "
    + "hs.headshotKills, death.event_id FROM player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, "
    + "alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o ON player.outfit_id = o_id INNER JOIN "
    + "(SELECT loser_character_id AS death_id, event_id, COUNT (loser_character_id) AS d FROM deaths "
    + "WHERE event_id="+ event_id +"  GROUP BY death_id) AS death ON character_id = death_id INNER JOIN "
    + "(SELECT attacker_character_id AS attack_id, COUNT (attacker_character_id) as k FROM deaths WHERE "
    + "event_id="+ event_id +"  GROUP BY attack_id) AS kill ON character_id = attack_id INNER JOIN (SELECT"
    + " attacker_character_id AS hs_id, COUNT (is_headshot) as headshotKills FROM deaths WHERE event_id="
    + event_id +"  GROUP BY hs_id) AS hs ON character_id = hs_id ORDER BY outfit_id";
    if (limit !== 0) { query += " LIMIT " + limit; }

    let data = await getPlayerKDHSortedByOutfit(query);
    let outfits = await outfitFromPlayers(data);
    res.status(200).jsonp(outfits);
}

async function getPlayerKDHSortedByOutfit(query) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw(query).then(function (data) {
            //console.log(data);
            resolve(data);
        }).catch(function (err) {
            console.error("getPlayerKDH " + err);
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
 * event_id is the id of the particular event to pull stats from
 * stat is the particular stat to return (if not there will return all 7 in an array)
 * Example query for kill leaderboard in event 1 returning 50 players: http://localhost:3005/api/player_leaderboard?event_id=1&stat=kills
 */
async function apiPlayerLeaderboard(req, res, limit) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }
    const stat = req.query.stat;

    switch (stat) {
        case "kills":
            let kills = await getPlayerLeaderboardKills(event_id, limit);
            res.status(200).jsonp(kills);
            break;
        case "deaths":
            let deaths = await getPlayerLeaderboardDeaths(event_id, limit);
            res.status(200).jsonp(deaths);
            break;
        case "headshots":
            let headshots = await getPlayerLeaderboardHeadshots(event_id, limit);
            res.status(200).jsonp(headshots);
            break;
        case "heals":
            let heals = await getPlayerLeaderboardHeals(event_id, limit);
            res.status(200).jsonp(heals);
            break;
        case "shields":
            let shields = await getPlayerLeaderboardShields(event_id, limit);
            res.status(200).jsonp(shields);
            break;
        case "revives":
            let revives = await getPlayerLeaderboardRevives(event_id, limit);
            res.status(200).jsonp(revives);
            break;
        case "resupplies":
            let resupplies = await getPlayerLeaderboardResupplies(event_id, limit);
            res.status(200).jsonp(resupplies);
            break;
        default:
            let leaderboard = await getPlayerLeaderboard(event_id, limit);
            res.status(200).jsonp(leaderboard);
            break;
    }

}

async function getPlayerLeaderboard(event_id, limit) {
    let promises = [];
    promises.push(getPlayerLeaderboardKills(event_id, limit));
    promises.push(getPlayerLeaderboardDeaths(event_id, limit));
    promises.push(getPlayerLeaderboardHeadshots(event_id, limit));
    promises.push(getPlayerLeaderboardShields(event_id, limit));
    promises.push(getPlayerLeaderboardHeals(event_id, limit));
    promises.push(getPlayerLeaderboardRevives(event_id, limit));
    promises.push(getPlayerLeaderboardResupplies(event_id, limit));

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

function getPlayerLeaderboardKills(event_id, limit) {
    if (limit === 0) { limit = 25; }
    const query = "SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, kill.k, kill.event_id FROM player "
        + "INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id) "
        + "AS o ON player.outfit_id = o_id INNER JOIN (SELECT attacker_character_id AS attack_id, event_id, COUNT "
        +"(attacker_character_id) as k FROM deaths WHERE event_id=" + event_id + " GROUP BY attack_id) AS kill ON "
        + "character_id = attack_id ORDER BY k desc LIMIT " + limit;
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw(query).then (function (data) {
                resolve(data);
        }).catch(function (err) {
            console.error("playerLeaderboard kills " + err);
            resolve(0);
        });
    })
}

function getPlayerLeaderboardDeaths(event_id, limit) {
    if (limit === 0) { limit = 25; }
    const query = "SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, death.d, death.event_id FROM "
        + "player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY "
        + "o_id)  AS o ON player.outfit_id = o_id INNER JOIN (SELECT loser_character_id  AS death_id, event_id, COUNT "
        + "(loser_character_id) AS d FROM deaths WHERE event_id=" + event_id + " GROUP BY death_id) AS death ON " +
        "character_id = death_id ORDER BY d desc LIMIT " + limit;
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw(query).then(function (data) {
            //console.log(data);
            resolve(data);
        }).catch(function (err) {
            console.error("playerLeaderboard deaths " + err);
            resolve(0);
        });
    })
}

function getPlayerLeaderboardHeadshots(event_id, limit) {
    if (limit === 0) { limit = 25; }
    const query = "SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, hs.headshotKills, hs.event_id "
        + "FROM player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP"
        + " BY o_id)  AS o ON player.outfit_id = o_id INNER JOIN (SELECT attacker_character_id AS hs_id, event_id, SUM "
        + "(is_headshot) as headshotKills FROM deaths WHERE event_id=" + event_id + " GROUP BY hs_id) AS hs ON character_id"
        + " = hs_id ORDER BY headshotKills desc LIMIT " + limit;
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw(query).then (function (data) {
            //console.log(data);
            resolve(data);
        }).catch(function (err) {
            console.error("playerLeaderboard headshots " + err);
            resolve(0);
        });
    })
}

function getPlayerLeaderboardShields(event_id, limit) {
    if (limit === 0) { limit = 25; }
    const query = "SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=438 AND event_id=" + event_id
        + " OR experience_id=439 AND event_id="+ event_id + " GROUP BY character_id ORDER BY xpEvent DESC LIMIT " + limit;
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw(query).then (function (data) {
            //console.log(data);
            resolve(data);
        }).catch(function (err) {
            console.error("playerLeaderboard shields " + err);
            resolve(0);
        });
    })
}

function getPlayerLeaderboardHeals(event_id, limit) {
    if (limit === 0) { limit = 25; }
    const query = "SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=4 AND event_id=" + event_id
        + " OR experience_id=51 AND event_id="+ event_id + " GROUP BY character_id ORDER BY xpEvent DESC LIMIT " + limit;
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw(query).then (function (data) {
            //console.log(data);
            resolve(data);
        }).catch(function (err) {
            console.error("playerLeaderboard heals " + err);
            resolve(0);
        });
    })
}

function getPlayerLeaderboardRevives(event_id, limit) {
    if (limit === 0) { limit = 25; }
    const query = "SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=7 AND event_id=" + event_id
        + " OR experience_id=53 AND event_id="+ event_id + " GROUP BY character_id ORDER BY xpEvent DESC LIMIT " + limit;
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw(query).then (function (data) {
            //console.log(data);
            resolve(data);
        }).catch(function (err) {
            console.error("playerLeaderboard revives " + err);
            resolve(0);
        });
    })
}

function getPlayerLeaderboardResupplies(event_id, limit) {
    if (limit === 0) { limit = 25; }
    const query = "SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=34 AND event_id=" + event_id
        + " OR experience_id=55 AND event_id="+ event_id + " GROUP BY character_id ORDER BY xpEvent DESC LIMIT " + limit;
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw(query).then (function (data) {
            //console.log(data);
            resolve(data);
        }).catch(function (err) {
            console.error("playerLeaderboard resupplies " + err);
            resolve(0);
        });
    })
}

/**
 * Outfit Leaderboard API
 * event_id is the id of the particular event to pull stats from
 * stat is the particular stat to return (if not there will return all 7 in an array)
 * Example query for kill leaderboard in event 1 returning 50 players: http://localhost:3005/api/outfit_leaderboard?event_id=1&stat=kills
 */
async function apiOutfitLeaderboard(req, res, limit) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }

    const stat = req.query.stat;
    switch (stat) {
        case "kills":
            let kills = await getOutfitLeaderboardKills(event_id, limit);
            res.status(200).jsonp(kills);
            break;
        case "deaths":
            let deaths = await getOutfitLeaderboardDeaths(event_id, limit);
            res.status(200).jsonp(deaths);
            break;
        case "captures":
            let captures = await getOutfitLeaderboardCaptures(event_id, limit);
            res.status(200).jsonp(captures);
            break;
        case "defenses":
            let defenses = await getOutfitLeaderboardDeaths(event_id, limit);
            res.status(200).jsonp(defenses);
            break;
        default:
            let leaderboard = await getOutfitLeaderboard(event_id, limit);
            res.status(200).jsonp(leaderboard);
            break;
    }
}

async function getOutfitLeaderboard(event_id, limit) {
    let promises = [];
    promises.push(getOutfitLeaderboardKills(event_id, limit));
    promises.push(getOutfitLeaderboardDeaths(event_id, limit));
    promises.push(getOutfitLeaderboardCaptures(event_id, limit));
    promises.push(getOutfitLeaderboardDefenses(event_id, limit));

    let results = await Promise.all(promises);

    let leaderboard = {
        kills       : results[0],
        deaths      : results[1],
        captures    : results[2],
        defenses    : results[3]
    };

    return leaderboard;
}

function getOutfitLeaderboardKills(event_id, limit) {
    if (limit === 0) { limit = 25; }
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw().then(function (data) {
            //console.log(data);
            resolve(data);
        }).catch(function (err) {
            console.error("getOutfitLeaderboardKills " + err);
            resolve(0);
        })
    })
}

function getOutfitLeaderboardDeaths(event_id, limit) {
    if (limit === 0) { limit = 25; }
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw().then(function (data) {
            //console.log(data);
            resolve(data);
        }).catch(function (err) {
            console.error("getOutfitLeaderboardDeaths " + err);
            resolve(0);
        })
    })
}

function getOutfitLeaderboardCaptures(event_id, limit) {
    if (limit === 0) { limit = 25; }
    const query = "SELECT outfit_id AS _id, alias AS _alias, name AS _name, f.capture FROM outfit INNER JOIN (SELECT "
        + "outfit_id AS fac_id, SUM(capture=1) AS capture FROM outfitFacility WHERE event_id=" + event_id + " GROUP BY " +
        "fac_id) AS f ON _id = fac_id ORDER BY capture DESC LIMIT " + limit;
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw(query).then(function (data) {
            //console.log(data);
            resolve(data);
        }).catch(function (err) {
            console.error("getOutfitLeaderboardCaptures " + err);
            resolve(0);
        })
    })
}

function getOutfitLeaderboardDefenses(event_id, limit) {
    if (limit === 0) { limit = 25; }
    const query = "SELECT outfit_id AS _id, alias AS _alias, name AS _name, f.defense FROM outfit INNER JOIN (SELECT "
        + "outfit_id AS fac_id, SUM(capture=0) AS defense FROM outfitFacility WHERE event_id=" + event_id + " GROUP BY f" +
        "ac_id) AS f ON _id = fac_id ORDER BY defense DESC LIMIT " + limit;
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw(query).then(function (data) {
            //console.log(data);
            resolve(data);
        }).catch(function (err) {
            console.error("getOutfitLeaderboardDefenses " + err);
            resolve(0);
        })
    })
}

/**
 * Events API
 * Returns the events or selected amount of events ordered by current ranging backwards
 */

async function apiEvent(res, limit) {
    let query = "SELECT id, name, created_at FROM Event ORDER BY created_at DESC";
    console.log(limit);
    if (limit !== 0) { query += " LIMIT " + limit; }
    let event = await getEvents(query);
    res.status(200).jsonp(event);
}


async function apiEventDetails(res, req) {
    let query = "SELECT * FROM event WHERE id=";
    if (req.query.event_id > 0) { query += req.query.event_id; }
    else { query += '0' }
    let event = await getEvents(query);
    res.status(200).jsonp(event[0]);
}

function getEvents(query) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw(query).then(function (data) {
            resolve(data);
        }).catch(function (err) {
            console.error("getEvents " + err);
            resolve(0);
        })
    })
}
/**
 * API Home Page
 */
function apiHome(res) {
    res.render("api_home", {
    });
}

module.exports = router;