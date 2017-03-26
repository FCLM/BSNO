const express = require('express');
const router = express.Router();
const handlebars = require('hbs');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const stats = await getStats();
  res.render('index', {
      title: 'Briggs Sunday Night Ops',
      timeUntil : "4d 2h 23m",
      eventTimestamp : "26/4/17",
      stats : stats
  });
});

async function getStats() {
    const obj = [
        {
            "character_id": "5428010618015213745",
            "name": "TardusMors",
            "faction": 2,
            "outfit_id": "37520336767958072",
            "o_name": "Sons of Odin Gaming",
            "o_alias": "ODIN",
            "d": 2,
            "k": 1,
            "headshotKills": 0,
            "event_id": 5
        }, {
            "character_id": "5428010618015219537",
            "name": "Lithe",
            "faction": 2,
            "outfit_id": "37529350728892448",
            "o_name": "Gauss Powered Gamers",
            "o_alias": "SAWS",
            "d": 3,
            "k": 1,
            "headshotKills": 0,
            "event_id": 5
        }, {
            "character_id": "5428010618015227249",
            "name": "5STAR",
            "faction": 2,
            "outfit_id": "37509488620604330",
            "o_name": "666th Devil Dogs",
            "o_alias": "666",
            "d": 2,
            "k": 4,
            "headshotKills": 1,
            "event_id": 5
        }, {
            "character_id": "5428010618015231793",
            "name": "LONGFELLA",
            "faction": 1,
            "outfit_id": "37509488620602490",
            "o_name": "Keepers of Johari",
            "o_alias": "KOJ",
            "d": 4,
            "k": 6,
            "headshotKills": 0,
            "event_id": 5
        }, {
            "character_id": "5428010618015240801",
            "name": "Leer",
            "faction": 2,
            "outfit_id": "37536288424934744",
            "o_name": "The NC Bus Drivers Association",
            "o_alias": "NBDA",
            "d": 1,
            "k": 5,
            "headshotKills": 1,
            "event_id": 5
        },
    ];
    return obj;
}

handlebars.registerHelper("kdr", function(kills, deaths) {
    if (deaths === 0) {
        // if no deaths, the kdr will be the total kills
        return kills.toFixed(2);
    }
    let kdr = kills / deaths;
    //if (kdr === kdr) {
        return kdr.toFixed(2);
    //}
    //return 0.0;
});

module.exports = router;
