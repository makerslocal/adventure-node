/**
 * api.js - handle queries
 * This file will communicate between pages and
 * child.js, handle session actions, and any
 * actions associated with game saves.
 */

// Required modules
var express = require('express');
var router = express.Router();

// main module
function Api (children, session) {
  //Convey from webpage to child process
  router.get('/game/send', function(req, res, next) {
    if (!children[req.sessionID]) {
      res.send("Error, no process.");
    } else {
      children[req.sessionID].once('message', function(message) {
        //console.log("Parent got response: ", message);
        res.json({ buf: message.res });
      });
      children[req.sessionID].send({
        buf: req.query.cmd
      });
    }
  });

  // Get most recent game output
  router.get('/game/getBufferLast', function(req, res, next) {
    if (!children[req.sessionID]) {
      res.send("Error, no process.");
    } else {
      children[req.sessionID].once('message', function(message) {
        //console.log("Parent got response: ", message);
        res.json({ buf: message.res });
      });
      children[req.sessionID].send({
        buf: "get bufferLast"
      });
    }
  });

  // Get everything, input and output
  router.get('/game/getBufferAll', function(req, res, next) {
    if (!children[req.sessionID]) {
      res.send("Error, no process.");
    } else {
      children[req.sessionID].once('message', function(message) {
        //console.log("Parent got response: ", message);
        res.json({ buf: message.res });
      });
      children[req.sessionID].send({
        buf: "get bufferAll"
      });
    }
  });

  // Get all output since last request for output
  router.get('/game/getBuffer', function(req, res, next) {
    if (!children[req.sessionID]) {
      res.send("Error, no process.");
    } else {
      children[req.sessionID].once('message', function(message) {
        //console.log("Parent got response: ", message);
        res.json({ buf: message.res });
      });
      children[req.sessionID].send({
        buf: "get buffer"
      });
    }
  });

  // Send active games
  router.get('/games', function(req, res, next) {
    //
  });

  // Send active sessions
  router.get('/sessions', function(req, res, next) {
    //
  });

  // End the active session
  router.get('/endSession', function(req, res, next) {
    if (req.query.sid) {
      cstore_instance.destroy(req.query.sid);
    } else {
      req.session.destroy();
    }
  });

  // Send active sessions
  router.get('/saves', function(req, res, next) {
    //
  });
}

module.exports = Api;
