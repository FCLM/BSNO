/**
 * Created by dylancross on 14/03/17.
 */
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('api', { data: 0 });
});

module.exports = router;

