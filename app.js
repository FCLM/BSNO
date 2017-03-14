// Modules
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// Files
const index                   = require('./routes/index.js');
const api_home                = require('./routes/api_home.js');
const api_current_players     = require('./routes/current_players.js');
const api_player_kdh          = require('./routes/player_kdh.js');
const api_outfit_kdh          = require('./routes/outfit_kdh.js');
const api_facilities          = require('./routes/facilities.js');
const api_player_leaderboard  = require('./routes/player_leaderboard.js');
const api_outfit_leaderboard  = require('./routes/outfit_leaderboard.js');
const websocket               = require('./websocket.js');

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
app.use('/api', api_home);
app.use('/api/current_players', api_current_players);
app.use('/api/player_kdh', api_player_kdh);
app.use('/api/outfit_kdh', api_outfit_kdh);
app.use('/api/facilities', api_facilities);
app.use('/api/player_leaderboard', api_player_leaderboard);
app.use('/api/outfit_leaderboard', api_outfit_leaderboard);

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

//websocket.startTimer();

module.exports = app;
