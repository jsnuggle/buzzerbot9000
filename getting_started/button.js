"use strict";

var Gpio = require('onoff').Gpio,
// todo: pull pin number from the config:
    output = new Gpio(18, 'out'),
    input = new Gpio(12, 'in', 'rising');

input.watch(function(err, value) {
    if (value) {
        console.log('button pressed');
        output.writeSync(1);

        setTimeout(function(){
            output.writeSync(0);
        }, 3000);
    }
});
