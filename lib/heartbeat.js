"use strict";

var util = require('util'),
    _ = require('underscore'),
    exec = require('child_process').exec,
    bunyan = require('bunyan'),
    fs = require('fs');

var DEFAULT_INTERVAL = 1000;
var DEFAULT_LOG_PATH = 'logs/heartbeat.log';

var Heartbeat = function (interval, logPath) {
    this.logPath = logPath || DEFAULT_LOG_PATH;
    this.interval = interval || DEFAULT_INTERVAL;

    var now = _.now();

    try {
        fs.renameSync(this.logPath, this.logPath + "." + now);
    } catch (e) {}

    this.intervalObj = null;
    this.logger = bunyan.createLogger({
        name: 'heartbeat',
        streams: [{
            path: this.logPath
        }]
    });
    this.startTime = now;
};


Heartbeat.prototype = {
    start: function() {
        this.logStatus();
        this.intervalObj = setInterval(this.logStatus.bind(this), this.interval);
    },
    stop: function() {
        clearInterval(this.intervalObj);
    },
    logStatus: function() {
        var networkAvailable = false;
        var self = this;

        // todo: convert to constant for router
        exec('ping -c 1 10.0.1.1', function(error, stdout, stderr){
            if(error !== null) {
                networkAvailable = false;
            } else  {
                networkAvailable = true;
            }
            var diagnostics = {
                pid: process.pid,
                router_ping: networkAvailable,
                ip_addresses: self.ipAddresses(),
                memory: process.memoryUsage(),
                uptime: _.now() - self.startTime
            };
            self.logger.info(diagnostics, 'lub-dub');

       });
    },

    ipAddresses: function() {

        return  _.chain(require('os').networkInterfaces())
                .each(function(e, k) {
                    e.map(function(o) {
                        return _.extend(o, {interface: k});
                    });
                })
                .values().flatten()
                .filter(function(val){ return (val.family == 'IPv4' && val.internal == false) })
                .map(function(obj) { return _.pick(obj, 'interface', 'address'); })
                .value();
    }

};

module.exports = Heartbeat;
