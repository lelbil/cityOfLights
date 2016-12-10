var mongoose = require('mongoose');
require('./locations');

var URI = 'mongodb://localhost/cityOfLight';
mongoose.connect(URI);

mongoose.connection.on('connecting', function() {
	console.log("connecting");
});

mongoose.connection.on('connected', function () {
console.log('Mongoose connected to ' + URI);
});

mongoose.connection.on('error', function(error) {
	console.log('mongoose connection error: ' + error);
});

mongoose.connection.on('disconnecting', function () {
	console.log('disconnecting');
})

mongoose.connection.on('disconnected', function() {
	console.log('mongoose connection disconnected');
})

var gracefulShutdown = function (msg, callback) {
	mongoose.connection.close(function(){
		console.log('Mongoose disconnected through ' + msg);
		callback();
	});
};

process.once('SIGUSR2', function() {
	gracefulShutdown('nodemon restart', function() {
		process.kill(process.pid, 'SIGUSR2');
	});
});

process.on('SIGINT', function() {
	gracefulShutdown('app termination', function() {
		process.exit(0);
	});
});