/**
 * Created by dylancross on 14/03/17.
 */
var express = require('express');
var router = express.Router();
var database = require('.../database.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    database.playerGetLoggedIn(function (data) {
        res.render('index', { title: 'Express' });
    });
});

module.exports = router;
