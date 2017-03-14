/**
 * Created by dylancross on 14/03/17.
 */
const express = require('express');
const router = express.Router();
const bookshelf = require('../bookshelf.js');

/*
 * /api/facilities = default event 0
 * /api/facilities?event_id=123 = event 123
 */
router.get('/', async function(req, res, next) {
    let event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }

    let facilities = await getFacilities(event_id);
    res.render('api', { data : JSON.stringify(facilities) });
});

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

module.exports = router;
