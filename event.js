/**
 * Created by dylancross on 16/03/17.
 */
// Modules

// Files
const mEvent = require('./models/event.js');
const bookshelf = require('./bookshelf.js');
const websocket = require('./websocket.js');
// Variable
let timeCount = 0; // Global seconds left

/**
 * Create a new event and return the ID
 */
async function newEvent(name) {
    //let pop = await getPop();
    timeCount = 0;
    let obj = {
        name: "BSNO",
        start_pop: await getPop(),//pop,
        end_pop: -1
    };

    if (name) {
        obj.name = name;
    }

    mEvent.forge(obj).save().then(function (result) {
        console.log('Event Tracking for: ' + result.get('id') + ' started.');
        websocket.setEventID(result.get('id'));
    }).catch(function (error) {
        console.error('eventCreate ' + error);
    });
    startEventTimer();
    websocket.subscribeToActions();
}

/**
 * Grab the current pop
 */
async function getPop() {
    return new Promise((resolve) => {
        bookshelf.knex.raw('')
            .then(function (data) {
                console.log(data);
                resolve(data);
            })
            .catch(function (err) {
                console.error('getPop ' + err);
                resolve(err);
            })
    })
}

/**
 * Create a timer with 2 hours on it
 * Once complete unsubscribe from event
 */

function startEventTimer() {
    timeCount = 7200;
    setInterval(function () {
        if (timeCount < 1) {
            websocket.unsubscribeToActions();
        }
        timeCount--;
    }, 1000);
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
    console.log('Metagame @ ' + timeCount/60 + ' : ' + timeCount%60);
    // If an alert closes with less than 30 minutes left, set the timeCount to 0 (which will trigger the unsubscribe event)
    if (data.metagame_event_state === "ended" && timeCount < 1800) {
        timeCount = 0;
    }
    // If an alert starts with more than 60 minutes left tie timeCount to the alert (set it 5400 [90 min] )
    else if (data.metagame_event_state === "started" && timeCount > 3600) {
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
    console.log('Cont Locked @ ' + timeCount/60 + ' : ' + timeCount%60);
    if (timeCount < 1800) {
        timeCount = 0;
    }
}

exports.metaGame      = metaGame;
exports.continentLock = continentLock;
exports.newEvent      = newEvent;