const Socket = require('./socket');
const Games = require('./games');
const Static = require('./static');

const App = new function() {
    this.init = () => {
        Static.listen();
        Socket.on('connection', this.onConnection);
    };

    this.onConnection = (client) => {
        Games.connect(client);
        client.on('disconnect', Games.disconnect);
        client.on('setup', Games.setup);
        client.on('join', Games.join);
        client.on('start', Games.start);
        client.on('reset', Games.reset);
    };
};

App.init();