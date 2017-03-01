// Modules
var WebSocket = require('ws');
// Files
var api_key   = require('./api_key.js');
var database  = require('./database.js');
var player    = require('./player.js');
// Variables
var ws; // Websocket needs to be global so can be accessed by multiple functions
var event = 0;
var timeCount = 0, time; // Global seconds left
// Functions

/**
 * Starts the Socket, keeps track of the time and closes the socket after the allotted time has passed
 * Keeps track of the time the socket has been opened and will stop it after it 2 hours
 */
function startTimer() {
    event = database.newEventID(); // Get a new event id
    console.log('Tracking started for event ' + event);
    timeCount = 7200;
    setInterval(function () {
        if (timeCount < 1) {
            stopSocket();
        }
        timeCount--;
    }, 1000);
}

/**
 * Returns the timer for the
 */
function getTimeCount() {
    return timeCount;
}
/**
 * Initialise a websocket connection to DBG
 * Subscribe to initial events
 * Delegate to parseWSData()
 */
function socketInit() {
    ws = new WebSocket('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:' + api_key.KEY);
    startTimer();
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
    ws.send('{"service":"event","action":"subscribe","worlds":["25"],"eventNames":["FacilityControl","MetagameEvent", "ContinentLock", "ContinentUnlock", "PlayerLogin","PlayerLogout"]}');
}

/**
 * Clears all subsciptions in the socket, then closes it
 */
function stopSocket() {
    // Clear subscription
    ws.send('{"service":"event","action":"clearSubscribe","all":"true"}');
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
        player.checkPlayer(d.attacker_character_id);
        player.checkPlayer(d.character_id);
    } else if (d.event_name == "GainExperience") {
        // Gained experience in something
        // Will need to narrow this down to a select amount
        // "GainExperience_experience_id_1" change id to these:
        /*
            Action              ID      Squad Version ID
            Healing             4       51
            Revive              7       53
            Shielding           438     439
            Resupplying         34      55
            https://census.daybreakgames.com/get/ps2/experience?c:limit=1100
         */
        //xpGain(d);
    } else if (d.event_name == "PlayerLogin") {
        // Player logged in
        subscribePlayer(d);
        addToTracked(d);
    } else if (d.event_name == "PlayerLogout") {
        //  Player logged out
        unsubscribePlayer(d);
    }  else if (d.event_name == "FacilityControl") {
        // Outfit Facility
        outfitFacility(d);
    } else if (d.event_name == "MetagameEvent") {
        // Outfit Facility
        metaGame(d);
    } else if (d.event_name == "ContinentLock") {
        continentLock(d)
    }
}

/**
 * Stores the Kill/Death in the database
 */
function death(data) {
    var obj = {
        attacker_character_id : data.attacker_character_id,
        attacker_loadout_id : data.attacker_loadout_id,
        attacker_vehicle_id : data.attacker_vehicle_id,
        loser_character_id : data.character_id,
        loser_loadout_id : data.character_loadout_id,
        loser_vehicle_id : data.character_vehicle_id,
        headshot : data.is_headshot,
        event_id : event
    };
    database.deathsInsert(obj);
}

/**
 * Stores the XP events in the database
 */
function xpGain(data) {
    var obj = {
        character_id : data.character_id,
        experience_id : data.experience_id,
        event_id : event
    };
    database.xpInsert(obj);
}

/**
 * Subscribes to Kills/Deaths, XP, Facility caps/defs for the given characterID
 */
function subscribePlayer(data) {
    var id = data.character_id;
    ws.send('{"service":"event","action":"subscribe","characters":["' + id +'"],"eventNames":["Death", "GainExperience"]}');
}

/**
 * Unsubscribes to Kills/Deaths, XP, Facility caps/defs for the given characterID
 */
function unsubscribePlayer(data) {
    var id = data.character_id;
    ws.send('{"service":"event","action":"clearSubscribe","characters":["' + id +'"],"eventNames":["Death", "FacilityControl", "GainExperience"]}');
}

/**
 * Saves the FacilityControl event to the database if there is an outfit id
 */
function outfitFacility(data) {
    if (data.outfit_id !== 0) {
        var obj = {
            facility_id : data.facility_id,
            outfit_id : data.outfit_id,
            capture : true,
            event_id : event
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

exports.socketInit      = socketInit;
exports.stopSocket      = stopSocket;
exports.getTimeCount    = getTimeCount;