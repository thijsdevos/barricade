const Board = require('../../common/board');
const Socket = require('./../socket');
const Moves = require('./moves');
const Barricades = require('./barricades');
const AI = require('./ai');

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
    this.counter = {
        color: null,
        co: 0
    };
    this.turns_order = ['red', 'green', 'yellow', 'blue'];
    this.point_id_to_win = '0,8';
    this.converter_colors_point_id = {red: '14,2', green: '14,6', yellow: '14,10', blue: '14,14'};
    this.home_points = {red: '14,2', green: '14,6', yellow: '14,10', blue: '14,14'};
    this.chat = [];

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
            board: this.board,
            counter: this.counter
        }
    };

    this.addPlayer = (player) => {
        this.players.push(player);
    };

    this.getPlayer = (player_id) => {
        let player_to_get = null;
        this.players.forEach((player) => {
            if(player.id === player_id) {
                return player_to_get = player;
            }
        });
        return player_to_get;
    };

    this.updatePlayer = (player_id, field, value) => {
        this.players.forEach((player) => {
            if(player.id === player_id) {
                player[field] = value;
            }
        });
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

    this.pickColor = (player_id, color) => {
        this.updatePlayer(player_id, 'color', color);
    };

    this.setSpeed = (speed) => {
        this.speed = speed;
    };

    this.start = () => {
        this.running = true;
        this.action = 'throw';
        this.turn = this.turns_order[0];
        this.counter.color = this.turn;

        if(this.isAI()) {
            this.turnAI();
        }
    };

    this.reset = (players, chat) => {
        this.running = false;
        this.players = players;
        this.chat = chat;
        this.won = null;
        this.players.forEach(player => {
            return player.color = null;
        });
    };

    this.setThrown = (thrown) => {
        this.action = 'pick_pawn';
        this.thrown = thrown;
        this.thrown_history.push(thrown);
    };

    this.setPickedPawn = (point_id) => {
        this.action = 'put_pawn';
        this.picked_pawn = point_id;
        this.changeAmountHomePawnsIfPointIdIsHome(point_id, -1);
    };

    this.cancelPickedPawn = (point_id) => {
        this.action = 'pick_pawn';
        this.picked_pawn = null;
        this.changeAmountHomePawnsIfPointIdIsHome(point_id, 1);
    };

    this.setPutPawn = (point_id) => {
        const choosen_point = this.board.points[point_id];
        const current_point_id = this.picked_pawn;

        this.board.points[current_point_id] = null;
        this.picked_pawn = null;

        if(point_id === this.point_id_to_win) {
            this.won = this.turn;
        }
        else if(choosen_point === 'blocked') {
            this.board.points[point_id] = this.turn;
            this.action = 'put_barricade';
        } else {

            if(choosen_point !== null) {
                let color_home_point_id = this.converter_colors_point_id[choosen_point];
                this.changeAmountHomePawns(color_home_point_id, 1);
            }

            this.board.points[point_id] = this.turn;

            if(this.thrown === 6) {
                this.action = 'throw';
                this.thrown = null;

                if(this.isAI()) {
                    this.turnAI();
                }
            } else {
                this.nextTurn();
            }

        }
    };

    this.setPutBarricade = (point_id) => {
        if(this.board.points[point_id] === null) {
            this.board.points[point_id] = 'blocked';

            if(this.thrown === 6) {
                this.action = 'throw';
                this.thrown = null;

                if(this.isAI()) {
                    this.turnAI();
                }
            } else {
                this.nextTurn();
            }
        }
    };

    this.nextTurn = () => {
        const turn_current = this.turn;
        let turn_new = null;
        let turn_index = this.turns_order.indexOf(turn_current);

        let possible_turns = [];
        this.players.forEach((player) => {
            possible_turns.push(player.color);
        });

        let turn_found = false;
        while(!turn_found) {
            turn_index = turn_index + 1;
            if(turn_index > this.turns_order.length) {
                turn_index = 0;
            }

            if(possible_turns.includes(this.turns_order[turn_index])) {
                turn_new = this.turns_order[turn_index];
                turn_found = true;
            }
        }

        this.action = 'throw';
        this.thrown = null;
        this.thrown_history = [];
        this.turn = turn_new;

        if(turn_new === this.counter.color) {
            this.counter.co++;
        }

        if(this.isAI()) {
            this.turnAI();
        }
    };

    this.changeAmountHomePawnsIfPointIdIsHome = (point_id, amount) => {
        if(this.isHome(point_id)) {
            this.changeAmountHomePawns(point_id, amount);
        }
    };

    this.isHome = (point_id) => {
        return Moves.getRow(point_id) === 14;
    };

    this.changeAmountHomePawns = (point_id, amount) => {
        const new_amount = this.board.home[point_id] + amount;
        if(new_amount >= 0 && new_amount <= 5) {
            this.board.home[point_id] = new_amount;
        }
    };

    this.getPossibleMoves = (point_id) => {
        const points = this.board.points;
        const picked_pawn = point_id;
        const thrown = this.thrown;
        const turn = this.turn;
        return Moves.get(points, picked_pawn, thrown, turn);
    };

    this.isAI = () => {
        let turn_new_is_ai = false;
        this.players.forEach((player) => {
            if(player.color === this.turn && player.type === 'ai') {
                turn_new_is_ai = true;
            }
        });
        return turn_new_is_ai;
    };

    this.turnAI = () => {

        let point_with_highest_score = {};
        let timeouts = {
            thrown: null,
            pick_pawn: null,
            put_pawn: null
        };

        timeouts.thrown = setTimeout(() => {
            const thrown = Math.ceil(Math.random() * 6);
            this.setThrown(thrown);
            this.emitGameUpdateAfterAIAction();
        }, this.speed);

        timeouts.pick_pawn = setTimeout(() => {
            point_with_highest_score = AI.getBestMoveForPuttingPawn(this.board, this.home_points, this.turn, this.thrown);
            if(point_with_highest_score.id !== null) {
                this.setPickedPawn(point_with_highest_score.id);
                this.emitGameUpdateAfterAIAction();
            } else {
                this.nextTurn(id);
                this.emitGameUpdateAfterAIAction();
                clearTimeout(timeouts.put_pawn);
            }
        }, this.speed * 2);

        timeouts.put_pawn = setTimeout(() => {
            this.setPutPawn(point_with_highest_score.move);
            this.emitGameUpdateAfterAIAction();

            if(this.action === 'put_barricade') {
                setTimeout(() => {
                    const best_point = AI.getBestMoveForPuttingBarricade(this.board, this.turn);
                    this.setPutBarricade(best_point);
                    this.emitGameUpdateAfterAIAction();
                }, this.speed);
            }
        }, this.speed * 3);
    };

    this.emitGameUpdateAfterAIAction = () => {
        this.players.forEach((player) => {
            if(player.type === 'human') {
                Socket.to(player.client_id).emit('updateGame', this.get());
            }
        });
    };

    this.getChat = () => {
        return this.chat;
    };

    this.getChatLastMessage = () => {
        let chat = this.chat;
        return this.chat[this.chat.length - 1];
    };

    this.addChatMessage = (message) => {
        this.chat.push(message);
    };
};


module.exports = Game;