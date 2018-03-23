const Board = require('../../common/board');
const Socket = require('./../socket');
const Moves = require('./moves');
const Barricades = require('./barricades');

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

    this.reset = (players) => {
        this.running = false;
        this.players = players;
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
            //console.log('ai turn');
        }
    };



    this.getPossibleMoves = (point_id) => {
        const points = this.board.points;
        const picked_pawn = point_id;
        const thrown = this.thrown;
        const turn = this.turn;
        return Moves.get(points, picked_pawn, thrown, turn);
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

    this.isAI = () => {
        //const game = this.get(game_id);
        let turn_new_is_ai = false;
        this.players.forEach((player) => {
            if(player.color === this.turn && player.type === 'ai') {
                turn_new_is_ai = true;
            }
        });
        return turn_new_is_ai;
    };

    this.turnAI = (id) => {
        //const game = this;
        let choosen_pawn = null;
        let point_with_highest_score = {
            id: null,
            score: 0,
            move: null
        };

        let timeouts = {
            thrown: null,
            pick_pawn: null,
            put_pawn: null
        };

        timeouts.thrown = setTimeout(() => {
            const thrown = Math.ceil(Math.random() * 6);
            this.setThrown(thrown);
            //Socket.to(id).emit('updateGame', game);

            this.players.forEach((player) => {
                if(player.type === 'human') {
                    Socket.to(player.client_id).emit('updateGame', this.get());
                }
            });

        }, this.speed);

        timeouts.pick_pawn = setTimeout(() => {
            let points_checked = [];

            const current_points = this.board.points;
            const current_number_home_pawns = this.board.home[this.home_points[this.turn]];

            let co = 0;
            for(let x in current_points) {
                if(current_points[x] === this.turn) {
                    //check possibilities;

                    const point_id_to_check = x;

                    console.log(point_id_to_check);

                    const moves = this.getPossibleMoves(point_id_to_check);

                    moves.forEach((move) => {

                        score = 0;

                        if(Moves.getRow(point_id_to_check) < Moves.getRow(move)) {
                            score = 0;
                        }
                        else if(move === '0,8') {
                            score = 100;
                        }
                        else if(point_id_to_check === '1,8') {
                            score = 0;
                        }
                        else if(Moves.getRow(point_id_to_check) > Moves.getRow(move)) {
                            score = 20;
                        }
                        else if(Moves.getRow(point_id_to_check) < 6 && Moves.getRow(point_id_to_check) > 2 && Moves.getColumn(point_id_to_check) > 6 && Moves.getColumn(point_id_to_check) < 10 && this.thrown > 1) {

                            let barricades_between_pawn_finish = Barricades.getNumberBarricadesBetweenPawnAndFinish(current_points, '3,8');

                            if(barricades_between_pawn_finish.route.left !== null && Moves.getColumn(point_id_to_check) > Moves.getColumn(move)) {
                                score = 90 / barricades_between_pawn_finish.route.left;
                            }

                            if(barricades_between_pawn_finish.route.right !== null && Moves.getColumn(point_id_to_check) < Moves.getColumn(move)) {
                                let new_score = 90 / barricades_between_pawn_finish.route.right;
                                score = score < new_score ? new_score : score;
                            }

                            //console.log('point id: ' + point_id_to_check);
                            //console.log('move id: ' + move);
                            //console.log(barricades_between_pawn_finish);
                            //console.log(score);

                        }
                        else if (Moves.getRow(point_id_to_check) < 4 && Moves.getRow(point_id_to_check) > Moves.getRow(move)) {
                            score = 15;
                        }
                        else if (Moves.getRow(point_id_to_check) === 1 && Moves.getRow(point_id_to_check) === Moves.getRow(move) && Moves.getColumn(point_id_to_check) <= 8 && Moves.getColumn(point_id_to_check) < Moves.getColumn(move)) {
                            score = 15;
                        }
                        else if (Moves.getRow(point_id_to_check) === 1 && Moves.getRow(point_id_to_check) === Moves.getRow(move) && Moves.getColumn(point_id_to_check) > 8 && Moves.getColumn(point_id_to_check) > Moves.getColumn(move)) {
                            score = 15;
                        }
                        else if (Moves.getRow(point_id_to_check) === 3 && Moves.getColumn(point_id_to_check) <= 8 && Moves.getColumn(point_id_to_check) > Moves.getColumn(move)) {
                            score = 15;
                        }
                        else if (Moves.getRow(point_id_to_check) === 3 && Moves.getColumn(point_id_to_check) > 8 && Moves.getColumn(point_id_to_check) < Moves.getColumn(move)) {
                            score = 15;
                        }
                        else if(current_points[move] === 'blocked' && Moves.getRow(point_id_to_check) >= Moves.getRow(move)) {
                            score = 10;
                        } else if(Moves.getRow(point_id_to_check) > Moves.getRow(move)) {
                            score = 12.5;
                        } else if (Moves.getRow(point_id_to_check) === Moves.getRow(move)) {
                            score = 4;
                        } else {
                            score = 0;
                        }

                        if(score > point_with_highest_score.score) {
                            point_with_highest_score.id = x;
                            point_with_highest_score.move = move;
                            point_with_highest_score.score = score;
                        }
                    });
                    co++;
                }
            }

            if(points_checked.length < 5 && point_with_highest_score.score < 5 && current_number_home_pawns > 0) {
                point_with_highest_score.id = this.home_points[this.turn];
                const moves = this.getPossibleMoves(point_with_highest_score.id);

                moves.forEach((move) => {
                    if(current_points[move] === 'blocked') {
                        score = 25;
                    } else if(Moves.getRow(this.home_points[this.turn]) > Moves.getRow(move)) {
                        score = 10 * (Moves.getRow(this.home_points[this.turn]) - Moves.getRow(move));
                    } else {
                        score = 0;
                    }

                    if(score > point_with_highest_score.score) {
                        point_with_highest_score.id = this.home_points[this.turn];
                        point_with_highest_score.move = move;
                        point_with_highest_score.score = score;
                    }
                });

                //point_with_highest_score.move = moves[0];
            }

            //console.log(point_with_highest_score);

            if(point_with_highest_score.id !== null) {
                this.setPickedPawn(point_with_highest_score.id);
                //Socket.to(id).emit('updateGame', game);

                this.players.forEach((player) => {
                    if(player.type === 'human') {
                        Socket.to(player.client_id).emit('updateGame', this.get());
                    }
                });
            } else {
                this.nextTurn(id);
                //Socket.to(id).emit('updateGame', game);

                this.players.forEach((player) => {
                    if(player.type === 'human') {
                        Socket.to(player.client_id).emit('updateGame', this.get());
                    }
                });

                clearTimeout(timeouts.put_pawn);
            }


        }, this.speed * 2);

        timeouts.put_pawn = setTimeout(() => {
            this.setPutPawn(point_with_highest_score.move);
            //Socket.to(id).emit('updateGame', game);
            this.players.forEach((player) => {
                if(player.type === 'human') {
                    Socket.to(player.client_id).emit('updateGame', this.get());
                }
            });

            if(this.action === 'put_barricade') {
                setTimeout(() => {
                    const points = this.board.points;
                    const possible_points = [];
                    let best_point = null;
                    for(let x in points) {
                        if(Moves.getRow(x) < 12) {
                            if (points[x] === null) {
                                possible_points.push(x);
                            }

                            if (points[x] !== null && points[x] !== this.turn && points[x] !== 'blocked') {
                                let row = Moves.getRow(x);
                                let column = Moves.getColumn(x);


                                if(row < 4) {
                                    let barricades_between_pawn_finish = Barricades.getNumberBarricadesBetweenPawnAndFinish(points, x);
                                    /*
                                    console.log('');
                                    console.log('number barricades');
                                    console.log('point id: ' + x);
                                    console.log(barricades_between_pawn_finish);
                                    */
                                    if(barricades_between_pawn_finish.route.left !== null && barricades_between_pawn_finish.route.left < 4) {
                                        best_point = barricades_between_pawn_finish.best_put_place.left;
                                    }

                                    if(best_point !== null && barricades_between_pawn_finish.route.right !== null && barricades_between_pawn_finish.route.right < 4) {
                                        best_point = barricades_between_pawn_finish.best_put_place.right;
                                    }

                                    if(best_point !== null) {
                                        break;
                                    }
                                }

                                if(row === 1 && column < 8 && typeof points[row + ',' + (column + 1)] !== 'undefined' && points[row + ',' + (column + 1)] === null) {
                                    best_point = row + ',' + (column + 1);
                                    //console.log(1);
                                    break;
                                }
                                else if(row === 1 && column > 8 && typeof points[row + ',' + (column - 1)] !== 'undefined' && points[row + ',' + (column - 1)] === null) {
                                    best_point = row + ',' + (column - 1);
                                    //console.log(2);
                                    break;
                                }
                                else if(row === 3 && column < 8 && typeof points[row + ',' + (column - 1)] !== 'undefined' && points[row + ',' + (column - 1)] === null) {
                                    best_point = row + ',' + (column - 1);
                                    //console.log(3);
                                    break;
                                }
                                else if(row === 3 && column > 8 && typeof points[row + ',' + (column + 1)] !== 'undefined' && points[row + ',' + (column + 1)] === null) {
                                    best_point = row + ',' + (column + 1);
                                    //console.log(4);
                                    break;
                                } else if (typeof points[(row - 1) + ',' + column] !== 'undefined' && points[(row - 1) + ',' + column] === null) {
                                    best_point = (row - 1) + ',' + column;
                                    //console.log(5);
                                    break;
                                }
                                else if(row > 3 && column <= 8 && typeof points[row + ',' + (column + 1)] !== 'undefined' && points[row + ',' + (column + 1)] === null) {
                                    best_point = row + ',' + (column + 1);
                                    //console.log(6);
                                    break;
                                }
                                else if(row > 3 && column > 8 && typeof points[row + ',' + (column - 1)] !== 'undefined' && points[row + ',' + (column - 1)] === null) {
                                    best_point = row + ',' + (column - 1);
                                    //console.log(7);
                                    break;
                                }
                            }
                        }
                    }

                    let random_point = possible_points[Math.ceil(Math.random() * (possible_points.length - 1))];
                    let choosen_point = best_point !== null && best_point !== '0,8' ? best_point : random_point;

                    //console.log(random_point);
                    if(best_point !== null) {
                        //console.log('best: ' + best_point + ' , random: ' + random_point);
                    }

                    //this.setPutBarricade(id, possible_points[Math.ceil(Math.random() * (possible_points.length - 1))]);
                    this.setPutBarricade(choosen_point);
                    //Socket.to(id).emit('updateGame', game);

                    this.players.forEach((player) => {
                        if(player.type === 'human') {
                            Socket.to(player.client_id).emit('updateGame', this.get());
                        }
                    });

                }, this.speed);
            }
        }, this.speed * 3);
    };

};


module.exports = Game;