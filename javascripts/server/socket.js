const io = require('socket.io')();
const socket = io.listen(3000);
module.exports = socket;