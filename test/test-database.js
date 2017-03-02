// Modules
var assert = require('assert');
// Files
var database = require('../database.js');

/**
 * Test the inserting and retrieving of outfit in to the outfit table
 */
describe('databaseOutfit', function() {
    it('should return an object that can be used to reconstruct the saved object', function() {
        var expected = {
            outfit_id : "23456",
            alias : "Test",
            name : "Test Outfit",
            faction : 4
        };
        database.outfitInsert(expected);
        database.outfitRetrieve("23456", function (result) {
            var actual = {
                outfit_id : result.outfit_id,
                alias : result.alias,
                name : result.name,
                faction : result.faction
            };
            assert.equal(expected, actual);
        })
    });
});

/**
 * Test the inserting and retrieving of an outfitFacility in to the outfitFacility table
 */
describe('databaseOutfitFacility', function() {
    it('should return an object that can be used to reconstruct the saved object', function() {
        var expected = {
            facility_id : "123",
            outfit_id : "23456",
            capture : true,
            event_id : -1
        };
        database.outfitFacilityInsert(expected);
        database.outfitFacilityRetrieve("123", function (result) {
            var actual = {
                facility_id : result.facility_id,
                outfit_id : result.outfit_id,
                capture : result.capture,
                event_id : result.event_id
            };
            assert.equal(expected, actual);
        })
    });
});

/**
 * Test the inserting and retrieving of an xp event in to the xp table
 */
describe('databaseXP', function() {
    it('should return an object that can be used to reconstruct the saved object', function() {
        var expected = {
            character_id : "34567",
            experience_id : "12",
            event_id : -1
        };
        database.xpInsert(expected);
        database.xpRetrieve("34567", function (result) {
            var actual = {
                character_id : result.character_id,
                experience_id : result.experience_id,
                event_id : result.event_id
            };
            assert.equal(expected, actual);
        })
    });
});

/**
 * Test the inserting and retrieving of a player in to the player table
 */
describe('databasePlayer', function() {
    it('should return an object that can be used to reconstruct the saved object', function() {
        var expected = {
            character_id : "34567",
            outfit_id : "1234",
            logged_in : true
        };
        database.playerInsert(expected);
        database.playerRetrieve("34567", function (result) {
            var actual = {
                character_id : result.character_id,
                outfit_id : result.outfit_id,
                logged_in : result.logged_in
            };
            assert.equal(expected, actual);
        })
    });
});

/**
 * Test the inserting and retrieving of a player in to the player table
 */
describe('databaseDeath', function() {
    it('should return an object that can be used to reconstruct the saved object', function() {
        var expected = {
            attacker_character_id : "123",
            attacker_loadout_id : "1",
            attacker_vehicle_id : "2",
            loser_character_id : "321",
            loser_loadout_id : "1",
            loser_vehicle_id : "2",
            headshot : true,
            event_id : -1
        };
        database.deathsInsert(expected);
        database.deathsRetrieve("34567", function (result) {
            var actual = {
                attacker_character_id : result.attacker_character_id,
                attacker_loadout_id : result.attacker_loadout_id,
                attacker_vehicle_id : result.attacker_vehicle_id,
                loser_character_id : result.loser_character_id,
                loser_loadout_id : result.loser_loadout_id,
                loser_vehicle_id : result.loser_vehicle_id,
                headshot : result.headshot,
                event_id : result.event_id
            };
            assert.equal(expected, actual);
        })
    });
});