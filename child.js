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
var buffer = '';


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
      adventProc = spawn('adventure', [saveName.toString('utf-8')], {
        cwd: 'data'
      });
    } else {
      adventProc = spawn('adventure');
    }

    adventProc.stdout.on('data', function (data) {
      buffer = buffer + '\n[' + data + ']';
      console.log('stdout: ' + data);
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
    process.send({
      res: buffer
    });
    buffer = '';
  } else if (message.buf == 'close') {
    adventProc.stdin.end();
    process.send({
      res: buffer
    });
    buffer = '';
  } else if (!message.init && message.buf) {
    adventProc.stdin.write(message.buf.toString('utf-8'));
    /*adventProc.stdout.once('data', function (data) {
      buffer = buffer + '\n[' + data + ']';
      process.send({
        res: buffer
      });
      buffer = '';
      console.log('stdout: ' + data);
    });*/
  }

  //console.log("Child has been contacted " + messageCount + " times.");
});
