"use strict";

var Gpio = require('onoff').Gpio,
// todo: pull pin number from the config:
    buzzerPin = 17,
    led = new Gpio(buzzerPin, 'out');
     
console.log("I'm turning on the LED for you via gpio pin %s", buzzerPin);
led.writeSync(1);

setTimeout(function(){
    console.log("Now I'm turning it off");
    led.writeSync(0);
}, 3000);
