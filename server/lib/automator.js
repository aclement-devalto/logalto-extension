var YAML = require('yamljs'),
	merge = require('merge'),
	SSH = require('simple-ssh'),
	config = require('../config/config.js'),
	ansi_up = require('ansi_up');

// Load tasks file (path relative to server dir)
var tasks = YAML.load('./server/config/tasks.yml');

var findTaskByAlias = function(requestedAlias) {
	var task;

	for (var categoryKey in tasks) {
	    if (Object.prototype.hasOwnProperty.call(tasks, categoryKey)) {
	    	for (var taskKey in tasks[categoryKey]['tasks']) {
			    if (Object.prototype.hasOwnProperty.call(tasks[categoryKey]['tasks'], taskKey) && requestedAlias == taskKey) {
			    	task = merge(true, tasks[categoryKey]['tasks'][taskKey], {type: tasks[categoryKey]['type']});

			    	return task;
			    }
			}
	    }
	}

	return null;
}

// Execute a task command

var executeTask = function(task, callback) {
	if (task.type == 'backend') {
		// Format alternate version of tenant alias for backend scripts
		function capitalizeFirstLetter(string) {
		    return string.charAt(0).toUpperCase() + string.slice(1);
		}

		var tenantParts = task.tenant.split('-');
		tenantParts[0] = capitalizeFirstLetter(tenantParts[0]);
		tenantParts[1] = capitalizeFirstLetter(tenantParts[1]);
		
		camelCaseTenant = tenantParts.join('');

		// Connect to VM using SSH key
		var ssh = new SSH({
			host: config.vm.hostname,
			user: config.vm.username,
			key: config.vm.sshKey
		});

		var formatOutput = function(output) {
			return ansi_up.ansi_to_html(output);
		};

		ssh.exec("cd " + config.vm.basePath + " && " + task.script.replace(/{tenant}/, camelCaseTenant), {
			out: function(stdout) {
				callback({processing: true, output: formatOutput(stdout)});
			    console.log('stdout: ', stdout);
			},
			err: function(stderr) {
				callback({processing: true, error: formatOutput(stderr)});
		        console.log('stderr: ', stderr);
		    },
		    exit: function(code) {
				console.log('exit code: ' + code);

				ssh.end();

				task.status = code === 0 ? true: false;
				callback(task);
		    }
		}).start();

		return task
	} else {
		const senchaOptions = task.script.replace(/{tenant}/, task.tenant).split(' ');
		const spawn = require('child_process').spawn;
		const command = spawn('sencha', senchaOptions, {cwd: config.webPath, env: process.env});

		var bufferToString = function(buf) {
		  return String.fromCharCode.apply(null, new Uint16Array(buf));
		}

		command.stdout.on('data', function(data) {
			const stdout = bufferToString(data);
			callback({processing: true, output: stdout});
			console.log('stdout: ' + stdout);
		});

		command.stderr.on('data', function(data) {
			const stderr = bufferToString(stderr);
			callback({processing: true, error: stderr});
			console.log('stderr: ' + stderr);
		});

		command.on('error', function(error) {
			task.status = false;
			callback(task);
		  	console.log('Failed to start child process', error);
		});

		command.on('close', function(code) {
			task.status = code === 0 ? true: false;
			callback(task);
			console.log('exit code: ' + code);
		});
	}
}

exports.processTask = function(alias, tenant, callback) {
	var task = findTaskByAlias(alias)

	if (task) {
		task.tenant = tenant

		executeTask(task, callback);
	} else {
		console.log('Unknown task received: ' + alias);

		callback({status: false});
	}
};

exports.tasks = tasks;