#!/usr/bin/env node

var fs = require('fs');
var spawn = require('child_process').spawn;
var path = require('path');

fs.readFile('coverage/coverage.json', 'utf8', function(err, data) {
	if(err) // coverage data not found/read
		console.error(err), process.exit(1);
	pipeToCodeCov(data);
});

function pipeToCodeCov(json) {
	var codecov = 'node_modules/.bin/codecov',
			child;

	child = spawn(process.execPath, [path.resolve(codecov)], { stdio: ['pipe', 'ignore', 'ignore'] });
	child.stdin.write(json);
}