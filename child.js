/**
 * Child process
 * manages connection to Adventure
 */

// Modules
var childProcess = require('child_process');
var spawn = childProcess.spawn;
var fork = childProcess.fork;
var exec = childProcess.exec;

// Variables
var messageCount = 0; /* Number of incoming datas from the parent process */
var sessionID = 0; /* identifier for browser's session, not used */
var saveName = 0; /* Name of existing saved file */
var adventProc; /* instance of adventure */

var buffer = '';
var bufferAll = '';
var bufferLast = '';

// Add new lines to the buffers
function newData (data) {
  bufferLast = data+'<br>';
  buffer = buffer+bufferLast;
  //bufferAll = bufferAll+bufferLast;
}

console.log("Child process started.");

process.on('message', function (message) {
  console.log("Child got message: ", message);
  messageCount++;

  // Initial setup
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
      endSession(sessionID);
      process.exit();
    });
  } // End setup

  // Process requests
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
    }, function () {
      bufferAll = bufferAll + buffer;
      buffer = '';
    });
  } else if (message.buf == 'get bufferLast') {
    console.log("Sending bufferLast contents.");
    process.send({
      res: bufferLast
    });
  } else if (message.buf == 'get bufferAll') {
    console.log("Sending bufferAll contents.");
    process.send({
      res: bufferAll
    });
  } else if (message.buf == 'close') {
    adventProc.stdin.end();
    process.send({
      res: buffer
    });
  } else if (!message.init && message.buf) {
    var input = message.buf.toString('utf-8');
    bufferAll = bufferAll + '<strong>'+input+'</strong><br><br>';
    adventProc.stdin.write(input + '\n',
    function() {
      adventProc.stdout.once('data', function (data) {
        console.log("child, sending response");
        process.send({
          res: buffer
        }, function () {
          bufferAll = bufferAll + buffer;
          buffer = '';
        });
      });
    });
  }

  //console.log("Child has been contacted " + messageCount + " times.");
});
