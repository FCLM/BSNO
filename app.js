// Modules
const express       = require('express');
const path          = require('path');
const favicon       = require('serve-favicon');
const logger        = require('morgan');
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');
const cron          = require('cron');
// Files
const api       = require('./routes/api.js');
const websocket = require('./websocket.js');
const event     = require('./event.js');
const player    = require('./player.js');
const weapons   = require('./weapons.js');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req,res) {  res.sendFile(path.join(__dirname + '/public/index.html')) });
app.get('/events', function (req,res) {  res.sendFile(path.join(__dirname + '/public/events.html')) });
app.use('/api*', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//websocket.socketInit();

// Uncomment this to populate the weapons table.
//weapons.getWeapons(); // ** RUN ONCE ONLY **

// Cron jobs

/**
 * Every Sunday @ 7PM AEST
 * TODO: change the cronTime value to 0 0 9 * * 0 once testing is finished
 */
let eventStarter = new cron.CronJob({
    cronTime : '0 0 9 * * *',
    onTick   : function () {
        event.newEvent();
    },
    start    : true,
    timeZone : 'UTC'
});


/**
 * Run every hour and call logoutOldPlayers()
 */
let OldPlayers = new cron.CronJob({
    // Run every hour
    cronTime : '0 0 */24 * * *',
    onTick   : function () {
        player.logoutOldPlayers();
        console.log('Logging out players who have been logged in for more than 5 hours...');
    },
    start    : true,
    timeZone : 'UTC'
});

module.exports = app;
