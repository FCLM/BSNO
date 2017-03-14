/**
 * Created by dylancross on 14/03/17.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('api_home', { title: 'Express' });
});

module.exports = router;
