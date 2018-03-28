
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

    function createGame(game_id, player_id) {
        games[game_id] = new Game(game_id, player_id);
    }

    function addPlayer(client, game_id, player_id, nickname, type) {
        players[player_id] = game_id;
        game(client).addPlayer({
            id: player_id,
            nickname: nickname,
            color: null,
            client_id: client.id,
            type: type
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

    function gameByClient(client) {
        return games[gameId(client)];
    }

    function emitGameUpdate(client) {
        game(client).players.forEach((player) => {
            if(player.type === 'human') {
                Socket.to(player.client_id).emit('updateGame', game(client).get());
            }
        });
    }

    function emitGamePossibleMoves(client, point_id) {
        game(client).players.forEach((player) => {
            if(player.type === 'human') {
                Socket.to(player.client_id).emit('updatePossibleMoves', point_id === null ? [] : game(client).getPossibleMoves(point_id));
            }
        });
    }

    function emitChatUpdate(client) {
        const game = gameByClient(client);
        const lastChatMessage = game.getChatLastMessage();
        game.players.forEach((player) => {
            if(player.type === 'human') {
                Socket.to(player.client_id).emit('updateChat', lastChatMessage);
            }
        });
    }

    function emitSetupGame(client) {
        client.emit('setupGame', game(client).get());
    }

    function emitProfileUpdate(client) {
        client.emit('updateProfile', game(client).getPlayer(playerId(client)));
    }

    function emitFullChat(client) {
        client.emit('setupChat', game(client).getChat());
    }

    function playerExists(client) {
        return typeof players[playerId(client)] !== 'undefined';
    }

    function resetPlayersSocketIdAfterReconnect(client) {
        game(client).updatePlayer(playerId(client), 'client_id', client.id);
    }

    this.connect = function(client) {
        if(playerExists(client)) {
            resetPlayersSocketIdAfterReconnect(client);
            emitSetupGame(client);
            emitProfileUpdate(client);
            emitFullChat(client);
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

        if(game_id) {
            timeouts[player_id] = setTimeout(() => {
                removePlayer(client);
                if (games[game_id] && games[game_id].players.length === 0) {
                    delete games[game_id];
                }
                delete timeouts[player_id];
            }, 5000);
        }
    };

    this.setup = function(nickname) {
        const client = this;
        const id = pincode();
        const player_id = playerId(client);
        createGame(id, player_id);
        addPlayer(client, id, player_id, nickname, 'human');
        emitSetupGame(client);
        emitProfileUpdate(this);
    };

    this.join = function(obj) {
        addPlayer(this, obj.pincode, playerId(this), obj.nickname, 'human');
        emitSetupGame(this);
        emitFullChat(this);
        emitProfileUpdate(this);
    };

    this.start = function() {
        game(this).start();
        emitGameUpdate(this);
    };

    this.reset = function() {
        const game_id = game(this).id;
        const players = game(this).players;
        const admin_id = game(this).admin;
        const chat = game(this).chat;
        createGame(game_id, admin_id);
        game(this).reset(players, chat);
        emitGameUpdate(this);
        emitProfileUpdate(this);
    };

    this.pickColor = function(color) {
        game(this).pickColor(playerId(this), color);
        emitGameUpdate(this);
        emitProfileUpdate(this);
    };

    this.pickAI = function(color) {
        game(this).addPlayer({
            id: Math.random().toString(36).substr(2),
            nickname: 'AI: ' + color,
            color: color,
            type: 'ai'
        });
        emitGameUpdate(this);
    };

    this.setSpeed = function(speed) {
        game(this).setSpeed(speed);
        emitGameUpdate(this);
    };

    this.setThrown = function(thrown) {
        game(this).setThrown(thrown);
        emitGameUpdate(this);
    };

    this.setPickedPawn = function(point_id) {
        game(this).setPickedPawn(point_id);
        emitGameUpdate(this);
        emitGamePossibleMoves(this, point_id);
    };

    this.cancelPickedPawn = function(point_id) {
        game(this).cancelPickedPawn(point_id);
        emitGameUpdate(this);
        emitGamePossibleMoves(this, null);
    };

    this.setPutPawn = function(point_id) {
        game(this).setPutPawn(point_id);
        emitGameUpdate(this);
        emitGamePossibleMoves(this, null);
    };

    this.setPutBarricade = function(point_id) {
        game(this).setPutBarricade(point_id);
        emitGameUpdate(this);
    };

    this.message = function(message) {
        game(this).addChatMessage(message);
        emitChatUpdate(this);
    };

};