// Setup basic express server
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 7500;

var automator = require('./lib/automator.js');

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// List of available tasks
app.get('/tasks', function(req, res) {
	res.header('Content-Type', 'application/json');
 	res.send(JSON.stringify(automator.tasks));
});

app.get('/ping', function(req, res) {
	res.send('Still there');
});

io.on('connection', function (socket) {

  socket.on('message', function (data) {
    console.log("Message received from socket" + data);
  });

  // when the client emits 'new message', this listens and executes
  socket.on('execute-task', function (params) {
  	console.log("Command received from socket (execute-task) " + params.task);

    var taskCallback = function(result) {
      if (result.processing) {
        socket.emit('task-status', result);
      } else {
        console.log("Command complete: " + result.status);

        socket.emit('task-complete', result);
      }
    };

  	automator.processTask(params.task, params.tenant, taskCallback);
  });
});