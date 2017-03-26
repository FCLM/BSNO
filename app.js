// Modules
const express       = require('express');
const path          = require('path');
const favicon       = require('serve-favicon');
const logger        = require('morgan');
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');
const cron          = require('cron');
// Files
const index     = require('./routes/index.js');
const api       = require('./routes/api.js');
const websocket = require('./websocket.js');
const event     = require('./event.js');
const player    = require('./player.js');

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

app.use('/', index);
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

websocket.socketInit();

// Cron jobs

/**
 * Every Sunday @ 7PM AEDT
 */
let eventStarter = new cron.CronJob({
    // run @ sunday 7pm AEDT = 0 0 8 * * 0 (in UTC)
    // will need to be offset for DST (current). (FOR FUTURE REFERENCE: UTC is 13 hours behind NZDT)
    cronTime : '0 0 8 * * 0',
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
