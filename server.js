"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var config = require('configure');
var twilio = require('twilio');

var Opener = require('./lib/opener.js');
var Doorbell = require('./lib/doorbell.js');
var Validators = require('./lib/validators.js');

process.env.TWILIO_AUTH_TOKEN = config.twilio_token;

var app = express(),
    opener = new Opener(config, new Validators(config)),
    doorbell = new Doorbell(config);

console.log('Starting...');

doorbell.listen();

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/sms', twilio.webhook(), function (request, response) {

    var sms = request.body;

    opener.open_door(sms.Body, sms.From, function (success) {
        var twil_res = new twilio.TwimlResponse();
        var message = success ? config.success_message : config.fail_message;
        twil_res.message(message);
        console.log('"' + message + '"', sms.Body, sms.From);

        if (config.send_reply) {
            response.send(twil_res);
        }
    });

});

var port = Number(config.port);
app.listen(port, function () {
    console.log('Listening for the opener signal via HTTP on port ' + port);
});
