"use strict";

var express = require('express');
var path = require('path');
var config = require('configure');
var fs = require('fs');
var _ = require('underscore');

var app = express();

app.use("/", express.static(path.join(__dirname, '/tmp')));
app.use("/bower", express.static(path.join(__dirname, '/bower_components')));

app.get("/config.json", function(req, res) {
    res.send(sanitizeConfig());
});

app.listen(7000, function () {
    console.log('starting server');
});

function sanitizeConfig() {
    return JSON.parse(fs.readFileSync('fake_config.json'));
    //var whitelist = ['door_release_seconds', 'twilio_number', 'doorbell', 'success_message', 'fail_message', 'send_reply', 'passwords'];
    //return  _.pick(configData, whitelist); 
}
