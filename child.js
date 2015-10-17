/**
 * Child process
 * manages connection to Adventure
 */

// Modules
var childProcess = require('child_process');
var spawn = childProcess.spawn;
var fork = childProcess.fork;
var exec = childProcess.exec;
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

// Variables
var messageCount = 0; /* Number of incoming datas from the parent process */
var sessionID = 0; /* identifier for browser's session, not used */
var saveName = 0; /* Name of existing saved file */
var adventProc; /* instance of adventure */

var buffer = [];
var bufferLast = 0; /* index of last send buffer element */
/**
 * Buffer object sections:
 * type: "game" or "player"
 * text: given line of text
 */


// Add new lines to the buffers
function newData (type, text) {
  buffer.push({
    "type": type,
    "text": text
  });
}

console.log("Child process started.");

process.on('message', function (message) {
  console.log("Child got message: ", message);
  messageCount++;

  console.log("Current buffer: ", buffer);

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

    adventProc.stdout.on('data', function (output) {
      newData("game", decoder.write(output));
      console.log('new buffer: ' + decoder.write(output));
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
    console.log("Sending unsent buffer contents.");
    var subBuffer = [];
    for (index = bufferLast; index < buffer.length; index++) {
      subBuffer.push(buffer[index]);
    }
    process.send({
      res: subBuffer
    }, function () {
      bufferLast = buffer.length-1;
    });
  } else if (message.buf == 'get bufferLast') {
    console.log("Sending last buffer contents.");
    process.send({
      res: buffer[buffer.length-1]
    }, function () {
      bufferLast = buffer.length-1;
    });
  } else if (message.buf == 'get bufferAll') {
    console.log("Sending all buffer contents.");
    process.send({
      res: buffer
    }, function () {
      bufferLast = buffer.length-1;
    });
  } else if (message.buf == 'close') {
    adventProc.stdin.end();
    process.send({
      res: buffer[buffer.length-1]
    });
  } else if (!message.init && message.buf) {
    var input = message.buf.toString('utf-8');
    newData("player", input);
    adventProc.stdin.write(input + '\n',
    function() {
      adventProc.stdout.once('data', function (output) {
        console.log("child, sending response");
        //newData("game", decoder.write(output));
        process.send({
          res: buffer[buffer.length-1]
        });
      });
    });
  }

  //console.log("Child has been contacted " + messageCount + " times.");
});
