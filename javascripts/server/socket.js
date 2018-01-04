const io = require('socket.io')();
const socket = io.listen(8443);
module.exports = socket;