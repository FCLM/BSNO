// Modules
const WebSocket = require('ws');
const ReconWs   = require('recon-ws');
const fs        = require('fs');
// Files
const api_key   = require('./api_key.js');
const database  = require('./database.js');
const player    = require('./player.js');
const event     = require('./event.js');
const bookshelf = require('./bookshelf.js');
// Variables
let ws; // Websocket needs to be global so can be accessed by multiple functions
let currentEvent = -1; // Global Event ID
let eventRunning = false;
// Functions

/**
 * Initialise a websocket connection to DBG
 * Subscribe to initial events
 * Delegate to parseWSData()
 */
function socketInit() {
    ws = new ReconWs('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:' + api_key.KEY);
    ws.on('open', function open() {
        console.log('stream opened');
        ws.send('{"service":"event","action":"subscribe","worlds":["25"],"eventNames":["FacilityControl","MetagameEvent", "ContinentLock", "PlayerLogin","PlayerLogout"]}');
        //event.newEvent("TESTING");
    });

    ws.on('message', function (data) {
        if (data.indexOf("payload") === 2) {
            // Deal with data
            parseWSData(data);
        }
    });
    // Subscribing to login/outs, Alerts, Facility Caps and Cont Locks/Unlocks
    ws.on('close', function (data) {
        writeToFile(data);
    })
}

/**
 * Deals with the data sent by the socket and sends them to child functions depending on the event
 */
function parseWSData(data) {
    data = JSON.parse(data);
    data = data.payload;
    // DEBUG:
    //console.log(data);
    if (eventRunning) {
        switch (data.event_name) {
            case "Death":
                //console.log(Date.now() + " Recieved Death");
                death(data);
                player.checkPlayer(data.attacker_character_id, true);
                player.checkPlayer(data.character_id, true);
                break;
            case "GainExperience":
                //console.log(Date.now() + " Recieved XP Event");
                xpGain(data);
                break;
            case "PlayerLogin":
                //console.log(Date.now() + " Recieved Login");
                subscribePlayer(data.character_id);
                player.checkPlayer(data.character_id, true);
                break;
            case "PlayerLogout":
                //console.log(Date.now() + " Recieved Logout");
                player.checkPlayer(data.character_id, false);
                break;
            case "FacilityControl":
                //console.log(Date.now() + " Recieved Facility Update");
                facility(data);
                break;
            case "MetagameEvent":
                //console.log(Date.now() + " Recieved Metagame");
                event.metaGame(data);
                break;
            case "ContinentLock":
                //console.log(Date.now() + " Recieved Continent Lock");
                event.continentLock(data);
                break;
            default:
                break;
        }
    } else {
        if (data.event_name === "PlayerLogin") {
            //console.log(Date.now() + " Recieved Login");
            player.checkPlayer(data.character_id, true);
        } else if (data.event_name === "PlayerLogout") {
            //console.log(Date.now() + " Recieved Logout");
            player.checkPlayer(data.character_id, false);
        }
    }
}

/**
 * Stores the Kill/Death in the database
 *      {
 *          "attacker_character_id":"5428076920413512721",
 *          "attacker_fire_mode_id":"15",
 *          "attacker_loadout_id":"19",
 *          "attacker_vehicle_id":"0",
 *          "attacker_weapon_id":"44",
 *          "character_id":"5428026242681799153",
 *          "character_loadout_id":"10",
 *          "event_name":"Death",
 *          "is_headshot":"0",
 *          "timestamp":"1488493348",
 *          "world_id":"1",
 *          "zone_id":"6"
 *      };
 *
 */
async function death(data) {
    //console.log(data);
    // Not suicide
    if (data.attacker_character_id !== data.character_id) {
        // not tk
        let check = await checkSameFaction(data.attacker_character_id, data.character_id);
        if (!check) {
            let obj = {
                attacker_character_id: data.attacker_character_id,
                attacker_loadout_id: data.attacker_loadout_id,
                attacker_vehicle_id: data.attacker_vehicle_id,
                loser_character_id: data.character_id,
                loser_loadout_id: data.character_loadout_id,
                is_headshot: data.is_headshot,
                event_id: currentEvent
            };
            database.deathsInsert(obj);
        }
    }
}

/**
 * Stores the XP events in the database
 * XP Events found here: https://census.daybreakgames.com/get/ps2/experience?c:limit=1100
 */
function xpGain(data) {
    let obj = {
        character_id : data.character_id,
        experience_id : data.experience_id,
        event_id : currentEvent
    };
    database.xpInsert(obj);
}

/**
 * Subscribes to Kills/Deaths, XP, Facility for the given characterID
 */
function subscribePlayer(id) {
    ws.send('{"service":"event","action":"subscribe","characters":["' + id +'"],"eventNames":["Death", "GainExperience"]}');
}

/**
 * Saves the FacilityControl event to the database if there is an outfit id
 */
function facility(data) {
    if (data.outfit_id !== "0") {
        let obj = {
            facility_id : data.facility_id,
            outfit_id : data.outfit_id,
            capture : true,
            event_id : currentEvent
        };
        if (data.new_faction_id === data.old_faction_id) {
            obj.capture = false;
        }
        database.facilityInsert(obj);
    }
}

// Set the current event id (to be stored with the event data)
function setEventID(id) {
    currentEvent = id;
}

/**
 * * Requires socket connection to DBG to be initialised *
 * Select all currently logged in players and subscribe to their events
 * Sets eventRunning boolean to true
 */
function subscribeToActions() {
    eventRunning = true;
    bookshelf.knex.raw('SELECT character_id FROM player WHERE logged_in=true')
        .then(function (data) {
            data.rows.forEach(function (d) {
                //console.log(d.character_id);
                ws.send('{"service":"event","action":"subscribe","characters":["' + d.character_id +'"],"eventNames":["Death", "GainExperience"]}');
            });
        }).catch(function (err) {
            console.error('subscriberToEventActions ' + err);
        })
}

/**
 * Unsubscribes to *ALL* events and then resubscribes to non event items (login/outs, Alerts, Facility Caps and Cont Locks/Unlocks)
 * Sets eventRunning boolean to false
 */
function unsubscribeToActions() {
    ws.send('{"service":"event","action":"clearSubscribe","all":"true"}');
    eventRunning = false;
    ws.send('{"service":"event","action":"subscribe","worlds":["25"],"eventNames":["FacilityControl","MetagameEvent", "ContinentLock", "PlayerLogin","PlayerLogout"]}');
}

/**
 * Writes the reason it closed and a few other things to a log so i can read it later
 */
function writeToFile(data) {
    const toWrite = "Closed - " + Date.now() + ' ' + data;
    fs.writeFile('error.txt', toWrite, function (err) {
        if (err) {
            return console.log('error.txt Error: ' + err);
        }
    });
}


exports.socketInit           = socketInit;
exports.setEventID           = setEventID;
exports.subscribeToActions   = subscribeToActions;
exports.unsubscribeToActions = unsubscribeToActions;