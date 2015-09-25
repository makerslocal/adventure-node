var express = require('express');
var router = express.Router();

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

app.get('/getHist', function(req, res, next) {
  if (!children[req.sessionID]) {
    res.send("Error, no process.");
  } else {
    children[req.sessionID].once('message', function(message) {
      console.log("Parent got response: ", message);
      res.json({ buf: message.res });
    });
    children[req.sessionID].send({
      buf: "get history"
    });
  }
});

module.exports = router;
