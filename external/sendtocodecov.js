#!/usr/bin/env node

var fs = require('fs');
var spawn = require('child_process').spawn;
var path = require('path');

fs.readFile(path.resolve(__dirname, '..', 'coverage/coverage.json'), 'utf8', function(err, data) {
  if (err) {
    console.error(err);
    console.error('coverage data not found/read');
    process.exit(1);
  }
  pipeToCodeCov(data);
});

function pipeToCodeCov(json) {
  var codecov = 'node_modules/.bin/codecov';
  var child;
  var node = process.execPath;
  var codecov = path.resolve(__dirname, '..', codecov)
  try {
    child = spawn(node, [codecov]);
  } catch (err) {
    console.error('codecov lib is not accessible');
    process.exit()
  }
  child.stdin.setEncoding = 'utf8';
  child.stdin.end(json + '\n');
}
