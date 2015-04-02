"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var config = require('configure');
var twilio = require('twilio');
var logger = require('./lib/logger');

var Opener = require('./lib/opener.js');
var Doorbell = require('./lib/doorbell.js');
var Validators = require('./lib/validators.js');

process.env.TWILIO_AUTH_TOKEN = config.twilio_token;

var app = express(),
    opener = new Opener(config, new Validators(config)),
    doorbell = new Doorbell(config);

logger.info('Starting...');

doorbell.listen();

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/sms', twilio.webhook(), function (request, response) {

    var sms = request.body;

    opener.open_door(sms.Body, sms.From, function (success) {
        var twilioResponse = new twilio.TwimlResponse();
        var message = success ? config.success_message : config.fail_message;
        twilioResponse.message(message);
        logger.info('"' + message + '"', sms.Body, sms.From);

        if (config.send_reply) {
            response.send(twilioResponse);
        }
    });

});

app.get('/status', function(request, response) {
    response.send("server is up");
});

var port = Number(config.port);
app.listen(port, function () {
    logger.info('Listening for the opener signal via HTTP on port ' + port);
});
