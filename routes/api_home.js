/**
 * Created by dylancross on 14/03/17.
 */
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('api_home', {
        current_player_example      : JSON.stringify(currentPlayersExample),
        player_kdh_example          : JSON.stringify(playerKDHExample),
        outfit_kdh_example          : JSON.stringify(outfitKDHExample),
        facilities_example          : JSON.stringify(facilitiesExample),
        player_leaderboard_example  : JSON.stringify(playerLBExample),
        outfit_leaderboard_example  : JSON.stringify(outfitLBExample)
        });
});

const currentPlayersExample = {
    total   : 0,
    vs      : 0,
    tr      : 0,
    nc      : 0
};

const playerKDHExample = {

};

const outfitKDHExample = {

};

const facilitiesExample = {

};

const playerLBExample = {
    kills       : [],
    deaths      : [],
    headshots   : [],
    shields     : [],
    heals       : [],
    revives     : [],
    resupplies  : []
};

const outfitLBExample = {
    kills       : [],
    deaths      : [],
    headshots   : [],
    shields     : [],
    heals       : [],
    revives     : [],
    resupplies  : []
};

module.exports = router;
