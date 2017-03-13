/**
 * Created by dylancross on 14/03/17.
 */
var express = require('express');
var router = express.Router();
var database = require('../database.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    database.playerGetParticipantsKDH(1, function (data) {
        data = JSON.stringify(data);
        res.render('api', { data: data });

    });
});

module.exports = router;
