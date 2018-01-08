
const Socket = require('./socket');
const Games = require('./games');

const App = new function() {

    this.init = () => {
        Socket.on('connection', this.connection);
    };

    this.connection = (client) => {
        client.on('setup', Games.setup);
        client.on('join', Games.join);
        client.on('start', Games.start);
        client.on('reset', Games.reset);
    };

};

module.exports = App;