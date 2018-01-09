const Express = require('express');
const Static = Express();
const Path = require('path');
const Config = require('./config');

const base = Path.join(__dirname + '/../..', 'public');

module.exports = new function() {
    this.listen = () => {
        Static.use(Express.static(base));
        Static.get('/', (req, res) => {
            res.sendFile(base + '/index.html');
        });
        Static.listen(Config.ports.static);
        console.log('static listening on: ' + Config.ports.static);
    }
};