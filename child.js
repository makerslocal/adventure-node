/**
 * Child process
 * manages connection to Adventure
 */

var childProcess = require('child_process');
var spawn = childProcess.spawn;
var fork = childProcess.fork;
var exec = childProcess.exec;

var messageCount = 0;
var sessionID = 0;
var saveName = 0;
var adventProc;
var history = '';
var buffer = '';

function newData (data) {
  buffer = data+'<br>';
  history = history + buffer;
}

console.log("Child process started.");

process.on('message', function (message) {
  console.log("Child got message: ", message);
  messageCount++;
  if (message.init) {
    console.log("Child received init signal.");
    if (message.sessionID && !sessionID)
    {
      console.log("Assigning new ID: " + message.sessionID);
      sessionID = message.sessionID;
    }
    if (message.saveName && !saveName)
    {
      console.log("Assigning new save name: " + message.saveName);
      saveName = message.saveName;
    }
    if (saveName) {
      adventProc = spawn('unbuffer', ['-p', 'adventure', saveName.toString('utf-8')], {
        cwd: 'data'
      });
    } else {
      adventProc = spawn('unbuffer', ['-p', 'adventure'], {
        cwd: 'data'
      });
    }

    adventProc.stdout.on('data', function (data) {
      newData(data);
      console.log('new buffer: ' + buffer);
    });

    adventProc.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    adventProc.on('error', function (data) {
      console.log('Failed to start adventure. ' + data);
    });

    adventProc.on('close', function (code) {
      console.log('child process exited with code ' + code);
    });
  }

  if (message.buf == 'get id')
  {
    process.send({
      res: sessionID
    });
  } else if (message.buf == 'get save') {
    process.send({
      res: saveName
    });
  } else if (message.buf == 'get buffer') {
    console.log("Sending buffer contents.");
    process.send({
      res: buffer
    });
  } else if (message.buf == 'get history') {
    console.log("Sending buffer contents.");
    process.send({
      res: history
    });
  } else if (message.buf == 'close') {
    adventProc.stdin.end();
    process.send({
      res: buffer
    });
  } else if (!message.init && message.buf) {
    var input = message.buf.toString('utf-8');
    history = history + '<strong>'+input+'</strong><br><br>';
    adventProc.stdin.write(input + '\n',
    function() {
      adventProc.stdout.once('data', function (data) {
        console.log("child, sending response");
        process.send({
          res: buffer
        });
      });
    });
  }

  //console.log("Child has been contacted " + messageCount + " times.");
});
