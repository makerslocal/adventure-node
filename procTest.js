var childProcess = require('child_process');
var spawn = childProcess.spawn;
var child = spawn('adventure');

console.log("spawned: " + child.pid);

child.stdout.on('data', function(data) {
  console.log("Child data: " + data);
});
child.on('error', function () {
  console.log("Failed to start child.");
});
child.on('close', function (code) {
  console.log('Child process exited with code ' + code);
});
child.stdout.on('end', function () {
  console.log('Finished collecting data chunks.');
});

child.stdin.end();
