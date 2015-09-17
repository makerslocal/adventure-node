/**
 * Wrapper for Advent,
 * only exists because Node is stupid
 * http://i.imgur.com/9jZ2F5u.gif
 */

var childProcess = require('child_process');
var spawn = childProcess.spawn;
var fork = childProcess.fork;
var exec = childProcess.exec;

var child = spawn('grep', ['hello'], {
  stdio: [0, 1, 1]
});
child.on('error', function (err) {
  console.log("Failed to start child.", err);
});
/*
child.stderr.on('data', function (data) {
  console.log('CHILD stderr:', data);
});
child.stdout.setEncoding('utf8');
child.stdout.on('readable', function() {
  console.log("Child has new stdout data available.");
});
child.stdout.on('data', function(data) {
  var message = decoder.write(data);
  console.log("CHILD stdout: " + message.trim());
});
child.stdout.on('end', function () {
  console.log('Finished collecting data chunks.');
});
*/
child.on('close', function (code) {
  if (code !== 0) {
    console.log('grep process exited with code ' + code);
  }
});

console.log("spawned: " + child.pid);
/*
child.stdin.write("yes\nhello\nthere\nhello\n", 'utf8', function () {
  console.log("Written to child stdin.");
  //console.log(child.stdout.read(1), child.stdout.buffer);
});
*/
//child.stdin.end();
