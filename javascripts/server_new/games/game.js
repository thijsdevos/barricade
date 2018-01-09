let Board = require('../../common/board');

const Game = function(id, player_id) {

    this.id = id;
    this.admin = player_id;
    this.running = false;
    this.turn = null;
    this.action = null;
    this.thrown = null;
    this.thrown_history = [];
    this.picked_pawn = null;
    this.won = null;
    this.speed = 100;
    this.players = [];
    this.board = new Board;

    this.get = () => {
        return {
            id: this.id,
            admin: this.admin,
            running: this.running,
            turn: this.turn,
            action: this.action,
            thrown: this.thrown,
            thrown_history: this.thrown_history,
            picked_pawn: this.picked_pawn,
            won: this.won,
            speed: this.speed,
            players: this.players,
            board: this.board
        }
    };

    this.addPlayer = (player) => {
        this.players.push(player);
    };

    this.removePlayer = (player_id) => {
        let index_of_player = 0;
        this.players.forEach((player, index) => {
            if(player.id === player_id) {
                index_of_player = index;
            }
        });
        this.players.splice(index_of_player, 1);
    };

    this.start = () => {
        this.running = true;
    };

    this.reset = () => {
        this.running = false;
    }

};


module.exports = Game;