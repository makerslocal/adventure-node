/**
 * index.js - Serve webpages
 * This module will handle requests
 * associated with webpages on the
 * site. Nothing more.
 */

// Requirements
var express = require('express');
var router = express.Router();

// Main module
function Index (children, session) {
  router.get('/', function(req, res, next) {
    //console.log("Session:\n", req.session, "\nSID: "+req.sessionID);
    if (!children[req.sessionID]) {
      res.sendFile(path.join(__dirname, 'public/html/index.html'));
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
      res.sendFile(path.join(__dirname, 'public/html/advent.html'));
    } else {
      res.sendFile(path.join(__dirname, 'public/html/advent.html'));
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
}

module.exports = Index;
