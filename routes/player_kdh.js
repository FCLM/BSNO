/**
 * Created by dylancross on 14/03/17.
 */
var express = require('express');
var router = express.Router();
var database = require('../database.js');

/*
 * /api/player_kdh = default event 0
 * /api/player_kdh?event_id=123 = event 123
 */
router.get('/', function(req, res, next) {
    var event_id = 0;
    if (req.query.event_id > 0) { event_id = req.query.event_id; }

    database.playerGetParticipantsKDH(event_id, function (data) {
        data = JSON.stringify(data);
        res.render('api', { data: data });

    });
});

module.exports = router;
