var Board = require('../common/board');

const Game = function(id, player_id) {

    this.id = id;
    this.board = new Board;
    this.admin = player_id;
    this.players = [];
    this.turn = null;
    this.action = null;
    this.started = false;
    this.thrown = null;
    this.thrown_history = [];
    this.picked_pawn = null;
    this.won = null;
    this.speed = 100;

    this.counter = {
        color: null,
        co: 0
    };

    /*
    this.aiTimeouts = {
        thrown: null,
        pick_pawn: null,
        put_pawn: null
    };
    */

    /*
    this.pawns = Pawns;

    this.players = {
        red: null,
        green: null,
        yellow: null,
        blue: null
    };

    /*
    this.board = {
        ''
    };
    */

};


module.exports = Game;