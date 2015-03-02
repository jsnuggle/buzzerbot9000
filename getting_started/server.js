"use strict";

var Express = require('express'),
    Gpio = require('onoff').Gpio,
    buzzerPin = 17,
    led = new Gpio(buzzerPin, 'out');

var app = Express();

app.get('/', function (req, res) {
    res.send("Hello World! I'm a Raspberry Pi!");
});

app.get('/led', function (req, res) {
    res.send("Now let's test the LED. Did it turn on?");

    // todo: turn the led tester code into a lib
    console.log("I'm turning on the LED for you via gpio pin %s", buzzerPin);
    led.writeSync(1);

    setTimeout(function(){
        console.log("Now I'm turning it off");
        led.writeSync(0);
    }, 5000);
});

// todo: change this to read the port from the config:
var server = app.listen(5000, function () {
    var port = server.address().port;
    console.log('Express server listening at port %s', port);
});
