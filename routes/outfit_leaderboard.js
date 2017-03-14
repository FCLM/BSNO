/**
 * Created by dylancross on 14/03/17.
 */
const express = require('express');
const router = express.Router();
const bookshelf = require('../bookshelf.js');

/* GET home page. */
router.get('/', async function(req, res, next) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }

    let leaderboard = await getOutfitLeaderboard(event_id);
    res.render('api', { data : JSON.stringify(leaderboard) })
});

async function getOutfitLeaderboard(event_id) {
    let promises = [];
    promises.push(getLeaderboardKills(event_id));
    promises.push(getLeaderboardDeaths(event_id));
    promises.push(getLeaderboardCaptures(event_id));
    promises.push(getLeaderboardDefenses(event_id));

    let results = await Promise.all(promises);

    let leaderboard = {
        kills       : results[0],
        deaths      : results[1],
        captures    : results[2],
        defenses    : results[3]
    };

    return leaderboard;
}

function getLeaderboardKills(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw()
            .then(function (data) {
                console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('getLeaderboardKills ' + err);
                resolve(0);
            })
    })
}

function getLeaderboardDeaths(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw()
            .then(function (data) {
                console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('getLeaderboardDeaths ' + err);
                resolve(0);
            })
    })
}

function getLeaderboardCaptures(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT outfit_id AS _id, alias AS _alias, name AS _name, f.capture FROM outfit INNER JOIN(SELECT outfit_id AS fac_id, SUM(capture=1) AS capture FROM outfitFacility WHERE event_id=' + event_id + ' GROUP BY fac_id) AS f ON _id = fac_id ORDER BY capture DESC LIMIT 25')
            .then(function (data) {
                console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('getLeaderboardCaptures ' + err);
                reject(err);
            })
    })
}

function getLeaderboardDefenses(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT outfit_id AS _id, alias AS _alias, name AS _name, f.defense FROM outfit INNER JOIN(SELECT outfit_id AS fac_id, SUM(capture=0) AS defense FROM outfitFacility WHERE event_id=' + event_id + ' GROUP BY fac_id) AS f ON _id = fac_id ORDER BY defense DESC LIMIT 25')
            .then(function (data) {
                console.log(data);
                resolve(data);
            }).catch(function (err) {
                console.error('getLeaderboardDefenses ' + err);
                reject(err);
            })
    })
}

module.exports = router;
