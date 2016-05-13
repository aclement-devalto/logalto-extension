var fs = require('fs');

var config = {};

//----------------------------------------------------------------

	// CUSTOM CONFIG

	// Path to Logalto on host machine
	config.LOGALTO_DIR = process.env.HOME + '/Projets/logalto'    // Update this variable with your own local path to Logalto

//----------------------------------------------------------------

	// DEFAULT VARIABLES

	// Path to web directory relative
	config.webPath = config.LOGALTO_DIR + '/web'

	config.vm = {
		// Virtual machine hostname
		hostname: "192.168.56.101",

		// SSH username
		username: 'vagrant',

		// Path to Vagrant SSH key
		sshKeyPath: config.LOGALTO_DIR + "/puphpet/files/dot/ssh/id_rsa",

		// Absolute path for Logalto on VM
		basePath: '/vagrant'
	}

	// Print debug output in terminal
	config.debug = true

	// Listening port
	config.listeningPort = 7500

//----------------------------------------------------------------

// Initial config check before launch

// Check Logalto base directory
try {
    fs.accessSync(config.LOGALTO_DIR, fs.F_OK);
} catch (e) {
    console.log("Unable to find Logalto directory (" + config.LOGALTO_DIR + ") ! Did you forget to change the default config?");
}

// Look for Vagrant SSH key
fs.readFile(config.vm.sshKeyPath, function read(err, data) {
    if (err) {
        console.log("Unable to find Vagrant SSH key (" + config.vm.sshKey + ") !");
    }
    config.vm.sshKey = data;
});

//----------------------------------------------------------------

module.exports = config;