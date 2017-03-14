/**
 * Created by dylancross on 14/03/17.
 */
const express = require('express');
const router = express.Router();
const bookshelf = require('../bookshelf.js');

/* GET home page. */
router.get('/', async function(req, res, next) {

    let online = await getCurrentPlayers();
    console.log(online);
    res.render('api', { data : JSON.stringify(online) })
});

async function getCurrentPlayers() {
    let promises = [];

    promises.push(getTotalPlayers());
    promises.push(getFactionPlayers(1));
    promises.push(getFactionPlayers(2));
    promises.push(getFactionPlayers(3));

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
                console.log(data[0].online);
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
                console.log(data[0].online);
                resolve(data[0].online);
            }).catch(function (err) {
            console.error('getTotalPlayers ' + err);
            resolve(0);
        })
    })
}

module.exports = router;
