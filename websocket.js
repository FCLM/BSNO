// Modules
const WebSocket = require('ws');
// Files
const api_key = require('api_key.js');
const database = require('database.js');
// Variables
let ws; // Websocket needs to be global so can be accessed by multiple functions
let time; // Global timestamp for that BSNO
// Functions

/**
 * Initialise a websocket connection to DBG
 * Subscribe to initial events
 * Delegate to parseWSData()
 */
function socketInit() {
    ws = new WebSocket('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:' + api_key.KEY);

    ws.on('open', function open() {
        console.log('stream opened');
    });

    ws.on('message', function (data) {
        if (data.indexOf("payload") == 2) {
            // Deal with data
            parseWSData(data);
        }
    });
    // Subscribe to login/outs, Alerts, Facility Caps and Cont Locks/Unlocks
    ws.send('{"service":"event","action":"subscribe","worlds":["25"],"eventNames":["FacilityControl","MetagameEvent", "ContinentLock", "ContinentUnlock", "PlayerLogin","PlayerLogout"]}')
}

/**
 * Deals with the data sent by the socket and sends them to child functions depending on the event
 */
function parseWSData(data) {
    data = data.replace(': :', ':');
    let d = JSON.parse(data).payload;

    if (d.event_name == "Death") {
        // Event was player v player interaction
        death(d);
    } else if (d.event_name == "GainExperience") {
        // Gained experience in something
        // Will need to narrow this down to a select amount
        /*
            Action              ID      Squad Version ID
            Healing             4       51
            Revive              7       53
            Shielding           438     439
            Resupplying         34      55
            Assist              2       ?
            Motion Spotter?     293     294
            ?? anything else
            https://census.daybreakgames.com/get/ps2/experience?c:limit=1100
         */
        xpGain(d);
    } else if (d.event_name == "PlayerLogin") {
        // Player logged in
        subscribePlayer(d);
        addToTracked(d);
    } else if (d.event_name == "PlayerLogout") {
        //  Player logged out
        unsubscribePlayer(d);
    } else if (d.event_name == "PlayerFacilityCapture") {
        // Player Facility
        playerFacility(d, true);
    } else if (d.event_name == "PlayerFacilityDefend") {
        // Player Facility
        playerFacility(d, false);
    }  else if (d.event_name == "FacilityControl") {
        // Outfit Facility
        outfitFacility(d);
    } else if (d.event_name == "MetagameEvent") {
        // Outfit Facility
        metaGame(d);
    }

    // need cont lock/unlock
    // continentLock(d)
}

/**
 * Stores the Kill/Death in the database
 */
function death(data) {
    const obj = {
        attacker_character_id : data.attacker_character_id,
        attacker_loadout_id : data.attacker_loadout_id,
        attacker_vehicle_id : data.attacker_vehicle_id,
        loser_character_id : data.character_id,
        loser_loadout_id : data.character_loadout_id,
        loser_vehicle_id : data.character_vehicle_id,
        headshot : data.is_headshot,
        time : data.timestamp
    };
    database.deathsInsert(obj);
}

/**
 * Stores the XP events in the database
 */
function xpGain(data) {
    const obj = {
        character_id : data.character_id,
        experience_id : data.experience_id,
        time : data.timestamp
    };
    database.xpInsert(obj);
}

/**
 * Subscribes to Kills/Deaths, XP, Facility caps/defs for the given characterID
 */
function subscribePlayer(data) {
    const id = data.character_id;
    ws.send('{"service":"event","action":"subscribe","characters":["' + id +'"],"eventNames":["Death", "FacilityControl", "GainExperience"]}');
}

/**
 * Adds the character to the tracked database with a timestamp for this BSNO,
 * this will be where characters that logged in during BSNO are stored
 */
function addToTracked(data) {
    const obj = {
        character_id : data.character_id,
        outfit_id : '',
        time : data
    };
    database.trackedInsert(obj);
}

/**
 * Unsubscribes to Kills/Deaths, XP, Facility caps/defs for the given characterID
 */
function unsubscribePlayer(data) {
    const id = data.character_id;
    ws.send('{"service":"event","action":"clearSubscribe","characters":["' + id +'"],"eventNames":["Death", "FacilityControl", "GainExperience"]}');
}

/**
 * Saves the PlayerFacilityCapture/PlayerFacilityDefense to the playerFacility Database
 */
function playerFacility(data, capture) {
    const obj = {
        character_id : data.character_id,
        capture : capture,
        facility_id : data.facility_id,
        time : data.timestamp
    };
    database.playerFacilityInsert(obj);
}

/**
 * Saves the FacilityControl event to the database if there is an outfit id
 */
function outfitFacility(data) {
    if (data.outfit_id !== 0) {
        let obj = {
            facility_id : data.facility_id,
            outfit_id : data.outfit_id,
            capture : true,
            time : data.timestamp
        };
        if (data.new_faction_id === data.old_faction_id) {
            obj.capture = false;
        }
        database.outfitFacilityInsert(obj);
    }
}

/**
 * Checks the current time left in BSNO against the metagame
 * Can extend or reduce the time of a BSNO by 30 minutes
 */
function metaGame(data) {

}

/**
 * Checks if the continent lock(unlock) is close enough to end BSNO (30m left)
 */
function continentLock(data) {

}

/**
 * Clears all subsciptions in the socket, then closes it
 */
function stopSocket() {
    // Clear subscription
    ws.send('{"service":"event","action":"clearSubscribe","all":"true"}');
}

exports.socketInit  = socketInit;
exports.stopSocket  = stopSocket;