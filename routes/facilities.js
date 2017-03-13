/**
 * Created by dylancross on 14/03/17.
 */
var express = require('express');
var router = express.Router();

var database = require('../database.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    database.outfitFacilityGetFacilities(1, function (data) {
        console.log(data);
        var facilities = {
            total : data
        };
        facilities = JSON.stringify(facilities);
        res.render('api', { data: facilities });
    });
});

module.exports = router;
