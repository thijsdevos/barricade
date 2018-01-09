const io = require('socket.io')();
const Config = require('./config');
module.exports = io.listen(Config.ports.socket);
console.log('socket listening on: ' + Config.ports.socket);