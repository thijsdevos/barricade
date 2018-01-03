
var Player = require('./player');

const Players = function() {

    this.players = {};

    this.exists = (id) => {
        return typeof this.players[id] !== 'undefined';
    };

    this.create = (id) => {
        this.players[id] = new Player(id);
    };

    this.get = (id) => {
        return typeof id === 'undefined' ? this.players : this.players[id];
    };

    this.setNickname = (id, nickname) => {
        this.players[id].nickname = nickname;
    };

    this.setGameId = (id, game_id) => {
        this.players[id].game_id = game_id;
    };

    this.setColor = (id, color) => {
        this.players[id].color = color;
    };

    this.setType = (id, type) => {
        this.players[id].type = type;
    };

};


module.exports = new Players;