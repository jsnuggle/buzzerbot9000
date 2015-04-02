"use strict";

var Gpio = require("onoff").Gpio,
    underscore = require('underscore'),
    logger = require('./logger');

var Opener = function (options, validators) {
    this.options = options;
    this.validators = validators;
    this.opener_pin = new Gpio(this.options.opener_pin, 'out');
};

Opener.prototype = {

    open_door: function (message, from, callback) {
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
        logger.info("Validation success. Signaling door open.");
        this.on(underscore.bind(function() { setTimeout(this.off.bind(this), this.options.door_release_seconds * 1000); }, this));
    },

    on: function (callback) {
        this.opener_pin.writeSync(1);
        if (typeof callback == "function") {
            callback();
        }
    },

    off: function (callback) {
        this.opener_pin.writeSync(0);
        if (typeof callback == "function") {
            callback();
        }
    },

};

module.exports = Opener;
