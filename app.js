// Modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// Files
var index                   = require('./routes/index.js');
var api_current_players     = require('./routes/current_players.js');
var api_player_kdh          = require('./routes/player_kdh.js');
var api_facilities          = require('./routes/facilities.js');
var api_player_leaderboard  = require('./routes/player_leaderboard.js');
var websocket               = require('./websocket.js');

var app = express();

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
app.use('/api/current_players', api_current_players);
app.use('/api/player_kdh', api_player_kdh);
app.use('/api/facilities', api_facilities);
app.use('/api/player_leaderboard', api_player_leaderboard);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
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

//websocket.startTimer();

module.exports = app;
