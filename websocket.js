// Modules
var WebSocket = require('ws');
// Files
var api_key = require('api_key.js');
// Variables
var ws; // Websocket needs to be global so can be accessed by multiple functions
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
    var d = JSON.parse(data).payload;

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
    } else if (d.event_name == "PlayerLogout") {
        //  Player logged out
        unsubscribePlayer(d);
    } else if (d.event_name == "PlayerFacilityCapture") {
        // Player Facility
        playerFacility(d);
    } else if (d.event_name == "PlayerFacilityDefend") {
        // Player Facility
        playerFacility(d);
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

}

/**
 * Stores the XP events in the database
 */
function xpGain(data) {

}

/**
 * Subscribes to Kills/Deaths, XP, Facility caps/defs for the given characterID
 */
function subscribePlayer(data) {

}

/**
 * Unsubscribes to Kills/Deaths, XP, Facility caps/defs for the given characterID
 */
function unsubscribePlayer(data) {

}

/**
 * Saves the PlayerFacilityCapture/PlayerFacilityDefense to the playerFacility Database
 */
function playerFacility(data) {

}

/**
 * Saves the FacilityControl event to the database if there is an outfit id
 */
function outfitFacility(data) {
    if (data.outfit_id != 0) {

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
    // Close connection
    ws.send();
}

exports.socketInit  = socketInit;
exports.stopSocket  = stopSocket;