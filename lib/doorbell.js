"use strict";

var Gpio = require('onoff').Gpio,
    RateLimiter = require('limiter').RateLimiter,
    underscore = require('underscore'),
    twilio = require('twilio');


var Doorbell = function (config) {
    this.config = config;
    this.options = config.doorbell;
    this.input_pin = new Gpio(this.options.input_pin, 'in', 'rising');
    this.output_pin = new Gpio(this.options.output_pin, 'out');
    this.is_on = false;
    this.limiter = new RateLimiter(1, 'minute', true);
};

Doorbell.prototype = {
    listen: function() {
        console.log("Listening for the doorbell on gpio pin %s", this.options.input_pin);
        this.input_pin.watch(underscore.bind(function(err, value) {
            if (value) {
                console.log("Doorbell ring!");
                this.signal();
            }
        }, this));
    },

    signal: function () {
        if (this.is_on) {
            return;
        }
        this.on(setTimeout(this.off.bind(this), this.options.light_seconds * 1000));
        this.notifySubscribers();
    },
        
    notifySubscribers: function() {
        // chech sms killswitch
        if (!this.options.send_sms) {
            return;
        }
        // todo: check within schedule
        // only send an sms if we're within a given timeframe
    
        // rate limit
        var self = this;
        this.limiter.removeTokens(1, function(err, remainingRequests){
            if (remainingRequests >= 0) {
                underscore.each(self.options.subscribers, underscore.bind(self.sendSMS, self));
            }
        });
    },
    sendSMS: function (toNumber) {
        var client = new twilio.RestClient(this.config.twilio_sid, this.config.twilio_token);
        console.log("Notifying subcriber %s via SMS", toNumber);
        client.messages.create({
            to: toNumber,
            from: this.config.twilio_number,
            body: this.options.message
        }, function(error, message) {
            if (error) {
                // todo: error log this
                console.log(error.message);
            }
        });
    },
    on: function (done) {
        this.output_pin.writeSync(1);
        this.is_on = true;
    },
    off: function () {
        this.output_pin.writeSync(0);
        this.is_on = false;
    },
};

module.exports = Doorbell;
