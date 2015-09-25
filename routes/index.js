var express = require('express');
var router = express.Router();

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

module.exports = router;
