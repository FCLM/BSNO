/**
 * Created by dylancross on 16/03/17.
 */
// Modules
const cron = require('cron');
// Files
const mEvent = require('./models/event.js');
const bookshelf = require('./bookshelf.js');
const websocket = require('./websocket.js');
// Variable
let timeCount = 0; // Global seconds left

let eventStarter = new cron.CronJob({
    // run @ sunday 7pm AEDT = 0 0 19 * * 0
    // will need to be offset for DST (current). (FOR FUTURE REFERENCE: UTC is 13 hours behind NZDT)
    cronTime : '0 0 19 * * 0',
    onTick   : function () {
        //console.log('tick');
        newEvent();
    },
    start    : true,
    timeZone : 'UTC'
});

/**
 * Create a new event and return the ID
 */
async function newEvent(name) {
    let pop = await getPop();
    timeCount = 0;
    let obj = {
        name: "BSNO",
        start_pop: pop,
        end_pop: -1
    };

    if (name) {
        obj.name = name;
    }

    mEvent.forge(obj).save().then(function (result) {
        console.log('Event Tracking for: ' + result.get('id') + ' started.');
        // TODO:
        websocket.setEventID(result.get('id'));
    }).catch(function (error) {
        console.error('eventCreate ' + error);
    });
    startEventTimer();
    // TODO:
    websocket.subscribeToActions();
    console.log('Tracking started for event ');
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
            // TODO:
            websocket.unsubscribeToActions();
        }
        timeCount--;
    }, 1000);
}

exports.newEvent = newEvent;