var arDrone = require('ar-drone');
var client  = arDrone.createClient();

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rndData = require('./randomData');

var totalConnections = 0,
	isFlying = false,
	takingOff = false,
	landing = false,
	prevData = {},
	leds = [
		'frontLeftGreenOthersRed',
		'frontRightGreenOthersRed',
		'rearRightGreenOthersRed',
		'rearLeftGreenOthersRed'
	],
	directions = [
		'left',
		'right',
		'front',
		'back'
	];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	totalConnections++;
	socket.on('disconnect', function(){
		totalConnections--;
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
	rndData(function (data) {
		io.emit('data', data);
		processCopterData(data);
	});
});


function processCopterData(data) {
	var action = '';
	if (totalConnections === 0 && isFlying && !landing) {
		landing = true;
		client.stop();
		client.land(function () {
			isFlying = false;
			landing = false;
		});
	}
	if (totalConnections === 0) { return; }

	if (totalConnections > 0 && !takingOff && !isFlying) {
		takingOff = true;
		io.emit('mainText', 'take off...');
		client.takeoff(function () {
			client.up(1);
			client.after(2000, function () {
				client.up(0);
				isFlying = true;
				takingOff = false;
				io.emit('mainText', 'We are FLYING!');
			});
		});
	}

	if (!takingOff && !landing && isFlying) {

		if (data.c !== prevData.c) {
			action = data.c ? 'right' : 'left';
			if (action === 'right') {
				client.animate('flipRight', 100);
				io.emit('mainText', 'flip it RIGHT');
			} else {
				client.animate('flipLeft', 100);
				io.emit('mainText', 'flip it LEFT');
			}
		}

		if (data.b !== prevData.b) {
			client[directions[data.b % 4]](0.2);
			client.after(100, function () {
				client.stop();
			});
			io.emit('mainText', 'going ' + directions[data.b % 4]);

			// client.animateLeds(leds[data.a % 4], 5, 1);
		}

		if (data.a !== prevData.a) {
			client.animateLeds(leds[data.a % 4], 5, 1);
			io.emit('leds');
		}

	}
	prevData = JSON.parse(JSON.stringify(data));
}

client.config('control:altitude_max', 3000);

// initial setup commands
// client.takeoff();























// // client.disableEmergency()
// client.config('control:altitude_max', 3000);
// // client.createREPL()

// client.takeoff();
// client
// 	// .after(5000, function() {
// 		// this.clockwise(0.5);
// 	// })
// 	.after(5000, function () {
// 		this.animate('flipLeft', 15);
// 		// this.clockwise(0);
// 		// this.up(1);
// 	})
// 	// .after(1000, function () {
// 	// 	this.clockwise(-0.5);
// 	// 	this.down(0.5);
// 	// })
// 	.after(5000, function () {
// 		this.stop();
// 		this.land();
// 	});