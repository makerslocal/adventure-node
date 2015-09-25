var express = require('express');
var router = express.Router();

app.get('/saves', function(req, res, next) {
  var proc_ls = exec('ls', {
    cwd: "data"
  },
  function (error, stdout, stderr) {
    console.log("ls data: " + stdout);
    res.send(stdout);
  });
});

module.exports = router;
