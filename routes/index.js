/**
 * index.js - Serve webpages
 * This module will handle requests
 * associated with webpages on the
 * site. Nothing more.
 */

// Requirements
var express = require('express');
var router = express.Router();
var path = require('path');
var childProcess = require('child_process');
var spawn = childProcess.spawn;
var fork = childProcess.fork;
var exec = childProcess.exec;
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

function Route (children, session) {
  router.get('/', function(req, res, next) {
    //console.log("Session:\n", req.session, "\nSID: "+req.sessionID);
    if (!children[req.sessionID]) {
      res.sendFile(path.join(__dirname, '../public/html', 'index.html'));
      //console.log("No sub process for ID!");
    } else {
      res.redirect('/play');
    }
  });

  router.get('/play', function(req, res, next) {
    if (!children[req.sessionID]) {
      children[req.sessionID] = fork('child.js');
      children[req.sessionID].send({
        init: true,
        sessionID: req.sessionID,
        saveName: req.query.saveName
      });
      res.sendFile(path.join(__dirname, '../public/html', 'advent.html'));
    } else {
      res.sendFile(path.join(__dirname, '../public/html', 'advent.html'));
    }
  });

  router.get('/saves', function(req, res, next) {
    var proc_ls = exec('ls', {
      cwd: "data"
    },
    function (error, stdout, stderr) {
      console.log("ls data: " + stdout);
      res.send(stdout);
    });
  });
  return(router);
}

module.exports = Route;
