
const Game = require('./game');
const Player = require('./player');
const Socket = require('./../socket');

module.exports = new function() {

    let games = {};
    let players = {};
    let timeouts = {};

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
            color: null,
            client_id: client.id
        });
    }

    function removePlayer(client) {
        game(client).removePlayer(playerId(client));
        delete players[playerId(client)];
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

    function emitGameUpdate(client) {
        game(client).players.forEach((player) => {
            Socket.to(player.client_id).emit('updateGame', game(client).get());
        });
    }

    function emitSetupGame(client) {
        client.emit('setupGame', game(client).get());
    }

    function playerExists(client) {
        return typeof players[playerId(client)] !== 'undefined';
    }

    this.setup = function(nickname) {
        const client = this;
        const id = pincode();
        const player_id = playerId(client);
        addGame(id, player_id);
        addPlayer(client, id, player_id, nickname);
        emitSetupGame(client);
    };

    this.join = function(obj) {
        const client = this;
        addPlayer(client, obj.pincode, playerId(client), obj.nickname);
        emitSetupGame(client);
    };

    this.start = function() {
        game(this).start();
        emitGameUpdate(this);
    };

    this.reset = function() {
        game(this).reset();
        emitGameUpdate(this);
    };

    this.connect = function(client) {
        if(playerExists(client)) {
            emitSetupGame(client);
        }

        const player_id = playerId(client);
        if(timeouts[player_id]) {
            clearTimeout(timeouts[player_id]);
            delete timeouts[player_id];
        }
    };

    this.disconnect = function() {
        const client = this;
        const player_id = playerId(client);
        const game_id = gameId(client);

        timeouts[player_id] = setTimeout(() => {
            removePlayer(client);
            if(games[game_id] && games[game_id].players.length === 0) {
                delete games[game_id];
            }
            delete timeouts[player_id];
        }, 5000);
    };

};