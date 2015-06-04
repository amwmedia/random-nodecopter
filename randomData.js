var data = {};
var dataLastSent = '';
var listeners = [];

setInterval(genA, 1500);
setInterval(genB, 2270);
setInterval(genC, 5234);

genA();
genB();
genC();

function genA() {
	var time = (new Date()).getTime();
	data.a = time % 40;
	pushUpdate();
}

function genB() {
	var time = (new Date()).getTime();
	data.b = time % 13;
	pushUpdate();
}

function genC() {
	var time = (new Date()).getTime();
	data.c = time % 2;
	pushUpdate();
}

function pushUpdate () {
	var dataString = JSON.stringify(data);
	console.log(' => update!', dataString); // REMOVE ME
	if (dataLastSent !== dataString) {
		listeners.forEach(function (f) {
			f(data);
		});
		dataLastSent = dataString;
	}
}

module.exports = function (listener) {
	listeners.push(listener);
};