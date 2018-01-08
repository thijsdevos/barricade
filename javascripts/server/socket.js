const io = require('socket.io')();
module.exports = io.listen(8443);

/*
const io = require('socket.io')();
//const socket = ;



const Helper = function() {

    let socket = io.listen(8443);
    let client = null;

    socket.on('connection', (connection_client) => {
        client = connection_client;
        console.log('euhm');
    });

    console.log(client);

    this.send = () => {

    };

    this.broadcast = () => {

    };

    this.recieve = (name, callback) => {

        client.on(name, callback);


        /*
        client.on('setup', (nickname) => {

            const game = Games.create(player_id);

            Players.setNickname(player_id, nickname);
            Players.setGameId(player_id, game.id);

            Games.addPlayer(game.id, Players.get(player_id));

            client.join(game.id);
            client.emit('setupGame', Games.get(game.id));
        });
        ///


};

};

module.exports = new Helper;s
 */