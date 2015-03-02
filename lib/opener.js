"use strict";

var Gpio = require("onoff").Gpio,
    underscore = require('underscore');

var Opener = function (options, validators) {
    this.options = options;
    this.validators = validators;
    this.opener_pin = new Gpio(this.options.opener_pin, 'out');
};

Opener.prototype = {
    open_door: function (message, from, callback) {
        console.log('open_door called')
        var validator = this.findValidator(message, from);
        validator.validate(message, from, underscore.bind(function(success, reply) {
            if (success) {
                this.signal();
            }
            callback(success);
        }, this));
    },
    findValidator: function (message, from) {
        return underscore.find(this.validators, function (v) {
            return v.canValidate(message, from);
        });
    },
    signal: function () {
        this.on(setTimeout(this.off.bind(this), this.options.door_release_seconds * 1000));
    },
    on: function (done) {
        this.opener_pin.writeSync(1);
    },
    off: function () {
        this.opener_pin.writeSync(0);
    },
};

module.exports = Opener;
