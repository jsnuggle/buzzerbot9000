var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'buzzerbot',
    streams: [
    {
        path: 'logs/info.log',
        level:  'info'
    },
    {
        stream: process.stdout,
        level: 'debug'
    }
]});

module.exports = logger;
