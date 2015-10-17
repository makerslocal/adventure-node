/**
 * app.js - Composition Root
 * Sets up modules and
 * employs error handling.
 */

// General Node/Express Modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

// Modules for Express Session
var session = require('express-session');
var cluster = require('cluster');
var cstore = require('cluster-store');
var numCores = require('os').cpus().length;

// Application specific variables
var secrets = require('./secrets.json'); // File of non-git data
var children = {}; // Collection of running child.js processes

var app = express();

// Express Session Setup
var cstore_opts = {
  sock: '/tmp/memstore.sock',
  store: cluster.isMaster && new require('express-session/session/memory')(),
  serve: cluster.isMaster,
  connect: cluster.isWorker,
  standalone: (1 === numCores)
};
var cstore_instance;
cstore.create(cstore_opts).then(function (store) {
  console.log("Cluster-Store created.");
  store.get(id, function (err, data) {
    console.log("Cluster-Store setup: ", data);
  });
  cstore_instance = store;
});

module.exports.endSession = function (sid)
{
  cstore_instance.destroy(sid);
};

app.use(session({
  secret: secrets.sessionSecret,
  store: cstore_instance, /* I have no idea what I'm doing */
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } /* one hour */
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Instantiate Routes
var route_index = require('./routes/index')(children, session);
var route_api = require('./routes/api.js')(children, session);

// Employ Routes
app.use('/', route_index);
app.use('/api', route_api);

//
// error handlers
//

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
