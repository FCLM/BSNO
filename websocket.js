// Modules
var WebSocket = require('ws');
// Files
var api_key   = require('./api_key.js');
var database  = require('./database.js');
var player    = require('./player.js');
// Variables
var ws; // Websocket needs to be global so can be accessed by multiple functions
var event = 0; // Global Event ID
var timeCount = 0; // Global seconds left
// Functions

/**
 * Starts the Socket, keeps track of the time and closes the socket after the allotted time has passed
 * Keeps track of the time the socket has been opened and will stop it after it 2 hours
 */
function startTimer() {
    event = database.eventCreate(); // Get a new event id
    if (event > -1) {
        console.log('Tracking started for event ' + event);
        socketInit();
        timeCount = 7200;
        setInterval(function () {
            if (timeCount < 1) {
                stopSocket();
            }
            timeCount--;
        }, 1000);
    }
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
    ws.send('{"service":"event","action":"subscribe","worlds":["25"],"eventNames":["FacilityControl","MetagameEvent", "ContinentLock", "PlayerLogin","PlayerLogout"]}');
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
    var dat = JSON.parse(data.payload);

    if (dat.event_name == "Death") {
        // Event was player v player interaction
        death(dat);
        player.checkPlayer(dat.attacker_character_id, true);
        player.checkPlayer(dat.character_id, true);
    } else if (dat.event_name == "GainExperience") {
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
        xpGain(dat);
    } else if (dat.event_name == "PlayerLogin") {
        // Player logged in
        subscribePlayer(dat);
        player.checkPlayer(dat.character_id, true);
    } else if (dat.event_name == "PlayerLogout") {
        //  Player logged out
        unsubscribePlayer(dat);
        player.checkPlayer(dat.character_id, false);
    }  else if (dat.event_name == "FacilityControl") {
        // Outfit Facility
        outfitFacility(dat);
    } else if (dat.event_name == "MetagameEvent") {
        // Outfit Facility
        metaGame(dat);
    } else if (dat.event_name == "ContinentLock") {
        continentLock(dat)
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
 * Subscribes to Kills/Deaths, XP, Facility for the given characterID
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
 * {"payload":
 *  {
 *      "event_name":"MetagameEvent",
 *      "experience_bonus":"30.000000",
 *      "faction_nc":"42.745102",
 *      "faction_tr":"41.176472",
 *      "faction_vs":"15.294119",
 *      "instance_id":"10126",
 *      "metagame_event_id":"2",
 *      "metagame_event_state":"135",
 *      "metagame_event_state_name":"started", // Can be "ended"
 *      "timestamp":"1488352487",
 *      "world_id":"1"
 *  },
 *  "service":"event",
 *  "type":"serviceMessage"
 * }
 */
function metaGame(data) {
    // If an alert closes with less than 30 minutes left, set the timeCount to 0 (which will trigger the unsubscribe event)
    if (data.metagame_event_state == "ended" && timeCount < 1800) {
        timeCount = 0;
    }
    // If an alert starts with more than 60 minutes left tie timeCount to the alert (set it 5400 [90 min] )
    else if (data.metagame_event_state == "started" && timeCount > 3600) {
        timeCount = 5400;
    }
}

/**
 * Checks if the continent lock(unlock) is close enough to end BSNO (30m left)
 * Example message for future use
 * { "payload": {
 *      "event_name":"ContinentLock",
 *      "metagame_event_id":"0",
 *      "nc_population":"39",
 *      "previous_faction":"0",
 *      "timestamp":"1488350511",
 *      "tr_population":"23",
 *      "triggering_faction":"2",
 *      "vs_population":"36",
 *      "world_id":"17",
 *      "zone_id":"2"
 *  },
 * "service":"event",
 * "type":"serviceMessage"
 * }
 */
function continentLock() {
    // If the continent locks, set the timeCount to 0 (which will trigger the unsubscribe)
    if (timeCount < 1800) {
        timeCount = 0;
    }
}

exports.startTimer = startTimer;