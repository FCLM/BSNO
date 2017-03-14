/**
 * Created by dylancross on 14/03/17.
 */
var express = require('express');
var router = express.Router();

var database = require('../database.js');

/*
 * /api/facilities = default event 0
 * /api/facilities?event_id=123 = event 123
 */
router.get('/', function(req, res, next) {
    var event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }

    database.outfitFacilityGetFacilities(event_id, function (data) {
        data = JSON.stringify(data);
        res.render('api', { data: data });
    });
});

module.exports = router;
