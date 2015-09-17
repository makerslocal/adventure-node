/**
 * Adventure-Node
 */

// General Node/Express Modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var childProcess = require('child_process');
var spawn = childProcess.spawn;
var fork = childProcess.fork;
var exec = childProcess.exec;
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');
var fs = require('fs');

// Modules for Express Session
var session = require('express-session');
var cluster = require('cluster');
var cstore = require('cluster-store');
var numCores = require('os').cpus().length;

// Routes
var routes = require('./routes/index');
var users = require('./routes/users');

// Application specific variables
var secrets = require('./secrets.json'); // File of non-git data
var children = {}; // Collection of running children processes

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

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
//app.use('/users', users);

app.get('/', function(req, res, next) {
  console.log("Session:\n", req.session, "\nSID: "+req.sessionID);
  if (!children[req.sessionID])
  {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
    console.log("No sub process for ID!");
    //children[req.sessionID] = fork('child.js');
    //children[req.sessionID].send({ ID: req.sessionID });
  } else {
    res.redirect('/play');
    //children[req.sessionID].send({ hello: "Hi there..." });
  }
  //child.send({ hello: "Hi there!" });
});

app.get('/play', function(req, res, next) {
  if (!children[req.sessionID])
  {
    children[req.sessionID] = fork('child.js');
    children[req.sessionID].send({
      init: true,
      sessionID: req.sessionID,
      saveName: req.query.saveName
    });
    res.sendFile(path.join(__dirname, 'public/html/advent.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public/html/advent.html'));
  }
});

app.get('/sendCmd', function(req, res, next) {
  if (!children[req.sessionID]) {
    res.send("Error, no process.");
  } else {
    children[req.sessionID].once('message', function(message) {
      console.log("Parent got response: ", message);
      res.json({ buf: message.res });
    });
    children[req.sessionID].send({
      buf: req.query.cmd
    });
  }
});

app.get('/getBuf', function(req, res, next) {
  if (!children[req.sessionID]) {
    res.send("Error, no process.");
  } else {
    children[req.sessionID].once('message', function(message) {
      console.log("Parent got response: ", message);
      res.json({ buf: message.res });
    });
    children[req.sessionID].send({
      buf: "get buffer"
    });
  }
});

app.get('/saves', function(req, res, next) {
  console.log("stdout: ", child.stdout);
  /*var proc_ls = spawn('ls', ['-l'], {
    cwd: "data"
  });
  proc_ls.stdout.on('data', function (data) {
    console.log("ls data: " + data);
  });
  res.send("data");
  //res.render('index', { title: 'Express' });
  */
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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
