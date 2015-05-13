"use strict";

var express = require('express');
var basicAuth = require('basic-auth');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('configure');
var twilio = require('twilio');
var logger = require('./lib/logger');

var Opener = require('./lib/opener.js');
var Doorbell = require('./lib/doorbell.js');
var Validators = require('./lib/validators.js');
var Heartbeat = require('./lib/heartbeat.js');

process.env.TWILIO_AUTH_TOKEN = config.twilio_token;

// todo: convert to middleware util:
var auth = function(req, res, next) {
  var user = basicAuth(req);

  if (user && user.name && user.pass && user.name === config.admin_user && user.pass === config.admin_pass) {
    return next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };
};

var app = express(),
    opener = new Opener(config, new Validators(config)),
    doorbell = new Doorbell(config),
    heartbeat = new Heartbeat(60000);

logger.info('Starting...');

doorbell.listen();

app.use(bodyParser.urlencoded({ extended: true }));

// todo: refactor this into its own module:
app.post('/sms', twilio.webhook(), function (req, res) {

    var sms = req.body;

    opener.open_door(sms.Body, sms.From, function (success) {
        var twiliores = new twilio.TwimlResponse();
        var message = success ? config.success_message : config.fail_message;
        twiliores.message(message);
        logger.info('"' + message + '"', sms.Body, sms.From);

        if (config.send_reply) {
            res.send(twilioResponse);
        }
    });

});

app.use(auth);


app.use('/', express.static(path.join(__dirname, 'public')));

var port = Number(config.port);
app.listen(port, function () {
    logger.info('Listening for the opener signal via HTTP on port ' + port);
    heartbeat.start();
});
