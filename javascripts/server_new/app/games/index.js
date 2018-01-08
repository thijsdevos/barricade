
const Game = require('./game');
const Player = require('./player');
const Socket = require('./../socket');

module.exports = new function() {

    let games = {};
    let players = {};

    function pincode() {
        return Math.floor(1000 + Math.random() * 9000);
    }

    function addGame(game_id, player_id) {
        games[game_id] = new Game(game_id, player_id);
    }

    function addPlayer(client, game_id, player_id, nickname) {
        players[player_id] = game_id;
        game(client).addPlayer({
            id: player_id,
            nickname: nickname,
            color: null
        });
        console.log(game_id);
        client.join(game_id);
    }

    function playerId(client) {
        return client.handshake.query.profile_id;
    }

    function gameId(client) {
        return players[playerId(client)];
    }

    function game(client) {
        return games[gameId(client)];
    }

    function sendGameUpdate(client) {
       // console.log(gameId(client));
       // client.to(gameId(client)).emit('updateGame', game(client).get());
        Socket.emit('updateGame', game(client).get());
    }

    this.setup = function(nickname) {
        const client = this;
        const id = pincode();
        const player_id = playerId(client);

        addGame(id, player_id);
        addPlayer(client, id, player_id, nickname);

       // console.log(game(client).get());

        sendGameUpdate(client);
    };

    this.join = function(obj) {
        const client = this;
        addPlayer(client, obj.pincode, playerId(client), obj.nickname);
        sendGameUpdate(client);
    };

    this.start = function() {
        game(this).start();
        sendGameUpdate(this);
    };

    this.reset = function() {
        game(this).reset();
        sendGameUpdate(this);
    };

};