// Modules
const assert      = require('assert');
// Files
const player      = require('../player.js');
const database    = require('../database.js');

/**
 * Check the checkPlayer function with a character,
 * should save DylanNZ in player & FCLM in outfit tables 5428180936948328209
 * http://census.daybreakgames.com/s:example/get/ps2:v2/character/?character_id=5428180936948328209&c:resolve=outfit
 */
describe('playerCheckPlayer', function() {
    it('Should load FCLM & DylanNZ into the db', function () {
        player.checkPlayer("5428180936948328209", true);
        database.playerExists("5428180936948328209", function (exists) {
            assert.equal(true, exists);
        })
    });
});

/**
 * Check the lookUpPlayer function that interacts with the daybreak API
 * checks for the character
 * http://census.daybreakgames.com/s:example/get/ps2:v2/character/?character_id=5428010618020694593&c:resolve=outfit
 */
describe('playerLookUpPlayer', function () {
    it('Should look up a character and return the same object as expected ', function () {
        const expected = {
            name: 'Dreadnaut',
            character_id: '5428010618020694593',
            faction: '1',
            outfit_id: '37509488620601809',
            outfit_name: 'DasAnfall',
            alias: 'DA'
        };

        const promise = player.lookUpPlayer("5428010618020694593");
        return promise.then(function (result) {
            console.log(expected);
            console.log(result);
            assert(expected, result);
        })
    });
});

/**
 * Checks the  checkOutfit, should check if the provided outfit exists, if not it should insert to database
 * Reads it back from the database to see
 */
describe('playerCheckOutfit', function () {
   it('Should try to insert the provided outfit into the db', function () {
       const expected = {
           faction: '1',
           outfit_id: '37509488620601809',
           outfit_name: 'DasAnfall',
           alias: 'DA'
       };
       player.checkOutfit(expected);
       database.outfitRetrieve(expected.outfit_id, function (data) {
           console.log(data);
           const actual = {
               outfit_id : result.outfit_id,
               alias : result.alias,
               name : result.name,
               faction : result.faction
           };

           console.log(expected);
           console.log(actual);

           assert.equal(expected, actual);
       })
   })
});