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
        client.on('pick_color', Games.pickColor);
        client.on('pick_ai', Games.pickAI);
        client.on('set_game_speed', Games.setSpeed);
        client.on('set_thrown', Games.setThrown);
        client.on('pick_pawn', Games.setPickedPawn);
        client.on('cancel_pawn', Games.cancelPickedPawn);
        client.on('put_pawn', Games.setPutPawn);
        client.on('put_barricade', Games.setPutBarricade);
    };
};

App.init();