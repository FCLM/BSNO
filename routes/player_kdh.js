/**
 * Created by dylancross on 14/03/17.
 */
const express = require('express');
const router = express.Router();
const bookshelf = require('../bookshelf.js');

/*
 * /api/player_kdh = default event 0
 * /api/player_kdh?event_id=123 = event 123
 */
router.get('/', async function(req, res, next) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }

    let data = await getPlayerKDH(event_id);
    res.render('api', { data: JSON.stringify(data) });
});

async function getPlayerKDH(event_id) {
    return new Promise((resolve, reject) => {
        bookshelf.knex.raw('SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, death.d, kill.k, hs.headshotKills, death.event_id FROM player INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o ON player.outfit_id = o_id INNER JOIN (SELECT loser_character_id AS death_id, event_id, COUNT (loser_character_id) AS d FROM deaths GROUP BY death_id) AS death ON character_id = death_id INNER JOIN (SELECT attacker_character_id AS attack_id, COUNT (attacker_character_id) as k FROM deaths GROUP BY attack_id) AS kill ON character_id = attack_id INNER JOIN (SELECT attacker_character_id AS hs_id, COUNT (is_headshot) as headshotKills FROM deaths GROUP BY hs_id) AS hs ON character_id = hs_id')
            .then(function (data) {
                console.log(data);
                resolve(data);
            })
            .catch(function (data) {
                console.error('getPlayerKDH ' + err);
                resolve(0);
            })
    });
}

module.exports = router;
