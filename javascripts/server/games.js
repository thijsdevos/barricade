const Game = require('./game');
const Moves = require('./moves');
const Socket = require('./socket');

const Games = function() {

    const turns_order = ['red', 'green', 'yellow', 'blue'];
    const converter_colors_point_id = {red: '14,2', green: '14,6', yellow: '14,10', blue: '14,14'};
    const point_id_to_win = '0,8';
    const home_points = {
        red: '14,2',
        green: '14,6',
        yellow: '14,10',
        blue: '14,14'
    };
    const ai_speed = 250;

    this.games = {};

    this.create = (player_id) => {
        const id = Math.floor(1000 + Math.random() * 9000);
        return this.games[id] = new Game(id, player_id);
    };

    this.get = (id) => {
        return typeof id === 'undefined' ? this.games : this.games[id];
    };

    this.addPlayer = (id, player) => {
        this.games[id].players.push(player);
    };

    this.updatePlayer = (id, player) => {
        for(let i in this.games[id].players) {
            if(this.games[id].players[i].id === player.id) {
                this.games[id].players[i] = player;
                break;
            }
        }
    };

    this.startGame = (id) => {
        this.games[id].action = 'throw';
        this.games[id].turn = turns_order[0];
        this.games[id].started = true;

        this.games[id].counter.color = this.games[id].turn;

        if(this.isAI(id)) {
            this.turnAI(id);
        }
    };

    this.resetGame = (id) => {
        const players = this.games[id].players;
        const admin_id = this.games[id].admin;

        /*
        this.games[id].aiTimeouts = {
            thrown: null,
            pick_pawn: null,
            put_pawn: null
        };
        */

        this.games[id] = new Game(id, admin_id);
        this.games[id].players = players;
        this.games[id].won = null;


        this.games[id].players.forEach(player => {
           return player.color = null;
        });
    };

    this.setThrown = (id, thrown) => {
        this.games[id].action = 'pick_pawn';
        this.games[id].thrown = thrown;
        this.games[id].thrown_history.push(thrown);
    };

    this.setPickedPawn = (id, point_id) => {
        this.games[id].action = 'put_pawn';
        this.games[id].picked_pawn = point_id;
        this.changeAmountHomePawnsIfPointIdIsHome(id, point_id, -1);
    };

    this.cancelPickedPawn = (id, point_id) => {
        this.games[id].action = 'pick_pawn';
        this.games[id].picked_pawn = null;
        this.changeAmountHomePawnsIfPointIdIsHome(id, point_id, 1);
    };

    this.changeAmountHomePawnsIfPointIdIsHome = (id, point_id, amount) => {
        if(this.isHome(point_id)) {
            this.changeAmountHomePawns(id, point_id, amount);
        }
    };

    this.isHome = (point_id) => {
        return Moves.getRow(point_id) === 14;
    };

    this.changeAmountHomePawns = (id, point_id, amount) => {

        const new_amount = this.games[id].board.home[point_id] + amount;

        if(new_amount >= 0 && new_amount <= 5) {
            this.games[id].board.home[point_id] = new_amount;
        }
    };

    this.setPutPawn = (id, point_id) => {

        const choosen_point = this.games[id].board.points[point_id];
        const current_point_id = this.games[id].picked_pawn;

        this.games[id].board.points[current_point_id] = null;
        this.games[id].picked_pawn = null;

        if(point_id === point_id_to_win) {
            this.games[id].won = this.games[id].turn;
        }
        else if(choosen_point === 'blocked') {
            this.games[id].board.points[point_id] = this.games[id].turn;
            this.games[id].action = 'put_barricade';
        } else {

            if(choosen_point !== null) {
                let color_home_point_id = converter_colors_point_id[choosen_point];
                this.changeAmountHomePawns(id, color_home_point_id, 1);
            }

            this.games[id].board.points[point_id] = this.games[id].turn;

            if(this.games[id].thrown === 6) {
                this.games[id].action = 'throw';
                this.games[id].thrown = null;

                if(this.isAI(id)) {
                    this.turnAI(id);
                }
            } else {
                this.nextTurn(id);
            }

        }
    };

    this.setPutBarricade = (id, point_id) => {

        if(this.games[id].board.points[point_id] === null) {

            this.games[id].board.points[point_id] = 'blocked';

            if(this.games[id].thrown === 6) {
                this.games[id].action = 'throw';
                this.games[id].thrown = null;

                if(this.isAI(id)) {
                    this.turnAI(id);
                }
            } else {
                this.nextTurn(id);
            }
        }

    };

    this.getPossibleMoves = (id, point_id) => {
        const points = this.games[id].board.points;
        const picked_pawn = point_id;
        const thrown = this.games[id].thrown;
        const turn = this.games[id].turn;
        return Moves.get(points, picked_pawn, thrown, turn);
    };

    this.nextTurn = (id) => {
        const turn_current = this.games[id].turn;
        let turn_new = null;
        let turn_index = turns_order.indexOf(turn_current);

        let possible_turns = [];
        this.games[id].players.forEach((player) => {
            possible_turns.push(player.color);
        });

        let turn_found = false;
        while(!turn_found) {
            turn_index = turn_index + 1;
            if(turn_index > turns_order.length) {
                turn_index = 0;
            }

            if(possible_turns.includes(turns_order[turn_index])) {
                turn_new = turns_order[turn_index];
                turn_found = true;
            }
        }

        this.games[id].action = 'throw';
        this.games[id].thrown = null;
        this.games[id].thrown_history = [];
        this.games[id].turn = turn_new;

        if(turn_new === this.games[id].counter.color) {
            this.games[id].counter.co++;
        }

        if(this.isAI(id)) {
            this.turnAI(id);
        }

    };

    this.isAI = (game_id) => {
        const game = this.get(game_id);
        let turn_new_is_ai = false;
        game.players.forEach((player) => {
            if(player.color === game.turn && player.type === 'ai') {
                turn_new_is_ai = true;
            }
        });
        return turn_new_is_ai;
    };

    this.turnAI = (id) => {
        const game = this.get(id);
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
            this.setThrown(id, thrown);
            Socket.to(id).emit('updateGame', game);
        }, ai_speed);

        timeouts.pick_pawn = setTimeout(() => {
            let points_checked = [];

            const current_points = game.board.points;
            const current_number_home_pawns = game.board.home[home_points[game.turn]];

            let co = 0;
            for(let x in current_points) {
                if(current_points[x] === game.turn) {
                    //check possibilities;

                    const picked_pawn = x;
                    const moves = this.getPossibleMoves(id, picked_pawn);

                    moves.forEach((move) => {

                        if(move === '0,8') {
                            score = 100;
                        }
                        else if(move === '1,8') {
                            score = 0;
                        }
                        else if (Moves.getRow(picked_pawn) < 4 && Moves.getRow(picked_pawn) > Moves.getRow(move)) {
                            score = 15;
                        }
                        else if (Moves.getRow(picked_pawn) === 1 && Moves.getColumn(picked_pawn) <= 8 && Moves.getColumn(picked_pawn) < Moves.getColumn(move)) {
                            score = 15;
                        }
                        else if (Moves.getRow(picked_pawn) === 1 && Moves.getColumn(picked_pawn) > 8 && Moves.getColumn(picked_pawn) > Moves.getColumn(move)) {
                            score = 15;
                        }
                        else if (Moves.getRow(picked_pawn) === 3 && Moves.getColumn(picked_pawn) <= 8 && Moves.getColumn(picked_pawn) > Moves.getColumn(move)) {
                            score = 15;
                        }
                        else if (Moves.getRow(picked_pawn) === 3 && Moves.getColumn(picked_pawn) > 8 && Moves.getColumn(picked_pawn) < Moves.getColumn(move)) {
                            score = 15;
                        }
                        else if(current_points[move] === 'blocked') {
                            score = 10;
                        } else if(Moves.getRow(picked_pawn) > Moves.getRow(move)) {
                            score = 12.5;
                        } else if (Moves.getRow(picked_pawn) === Moves.getRow(move)) {
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
                point_with_highest_score.id = home_points[game.turn];
                const moves = this.getPossibleMoves(id, point_with_highest_score.id);

                moves.forEach((move) => {
                    if(current_points[move] === 'blocked') {
                        score = 25;
                    } else if(Moves.getRow(home_points[game.turn]) > Moves.getRow(move)) {
                        score = 10 * (Moves.getRow(home_points[game.turn]) - Moves.getRow(move));
                    } else {
                        score = 0;
                    }

                    if(score > point_with_highest_score.score) {
                        point_with_highest_score.id = home_points[game.turn];
                        point_with_highest_score.move = move;
                        point_with_highest_score.score = score;
                    }
                });

                //point_with_highest_score.move = moves[0];
            }

            //console.log(point_with_highest_score);

            if(point_with_highest_score.id !== null) {
                this.setPickedPawn(id, point_with_highest_score.id);
                Socket.to(id).emit('updateGame', game);
            } else {
                this.nextTurn(id);
                Socket.to(id).emit('updateGame', game);
                clearTimeout(timeouts.put_pawn);
            }


        }, ai_speed * 2);

        timeouts.put_pawn = setTimeout(() => {
            this.setPutPawn(id, point_with_highest_score.move);
            Socket.to(id).emit('updateGame', game);

            if(game.action === 'put_barricade') {
                setTimeout(() => {
                    const points = this.games[id].board.points;
                    const possible_points = [];
                    let best_point = null;
                    for(let x in points) {
                        if(Moves.getRow(x) < 12) {
                            if (points[x] === null) {
                                possible_points.push(x);
                            }

                            if (points[x] !== null && points[x] !== game.turn && points[x] !== 'blocked') {
                                let row = Moves.getRow(x);
                                let column = Moves.getColumn(x);


                                /*
                                if(row === 1) {
                                    console.log('row: ' + row + ' , column: ' + column);
                                    console.log('left');
                                    console.log(column);
                                    console.log(row + ',' + (column + 1));
                                    console.log(typeof points[row + ',' + (column + 1)] !== 'undefined');
                                    console.log(row === 1 && column <= 8 && typeof points[row + ',' + (column + 1)] !== 'undefined' && points[row + ',' + (column + 1)] === null);


                                    console.log('right');
                                    console.log(column);
                                    console.log(row + ',' + (column - 1));
                                    console.log(typeof points[row + ',' + (column - 1)] !== 'undefined');
                                    console.log(row === 1 && column > 8 && typeof points[row + ',' + (column - 1)] !== 'undefined' && points[row + ',' + (column - 1)] === null);
                                }
                                */

                                /*
                                console.log('check 1: ' + points[row + ',' + column + 1]);
                                console.log('check 2: ' + points[row + ',' + column - 1]);
                                console.log('check 3: ' + points[row + ',' + column - 1]);
                                console.log('check 4: ' + points[row + ',' + column + 1]);
                                console.log('check 5: ' + points[row - 1 + ',' + column]);
                                console.log('check 6: ' + points[row + ',' + column + 1]);
                                console.log('check 7: ' + points[row + ',' + column - 1]);
                                */
                                if(row === 1 && column < 8 && typeof points[row + ',' + (column + 1)] !== 'undefined' && points[row + ',' + (column + 1)] === null) {
                                    best_point = row + ',' + (column + 1);
                                    console.log(1);
                                    break;
                                }
                                else if(row === 1 && column > 8 && typeof points[row + ',' + (column - 1)] !== 'undefined' && points[row + ',' + (column - 1)] === null) {
                                    best_point = row + ',' + (column - 1);
                                    console.log(2);
                                    break;
                                }
                                else if(row === 3 && column < 8 && typeof points[row + ',' + (column - 1)] !== 'undefined' && points[row + ',' + (column - 1)] === null) {
                                    best_point = row + ',' + (column - 1);
                                    console.log(3);
                                    break;
                                }
                                else if(row === 3 && column > 8 && typeof points[row + ',' + (column + 1)] !== 'undefined' && points[row + ',' + (column + 1)] === null) {
                                    best_point = row + ',' + (column + 1);
                                    console.log(4);
                                    break;
                                }
                                else if (typeof points[(row - 1) + ',' + column] !== 'undefined' && points[(row - 1) + ',' + column] === null) {
                                    best_point = (row - 1) + ',' + column;
                                    console.log(5);
                                    break;
                                }
                                else if(row > 3 && column <= 8 && typeof points[row + ',' + (column + 1)] !== 'undefined' && points[row + ',' + (column + 1)] === null) {
                                    best_point = row + ',' + (column + 1);
                                    console.log(6);
                                    break;
                                }
                                else if(row > 3 && column > 8 && typeof points[row + ',' + (column - 1)] !== 'undefined' && points[row + ',' + (column - 1)] === null) {
                                    best_point = row + ',' + (column - 1);
                                    console.log(7);
                                    break;
                                }
                            }
                        }
                    }

                    let random_point = possible_points[Math.ceil(Math.random() * (possible_points.length - 1))];
                    let choosen_point = best_point !== null && best_point !== '0,8' ? best_point : random_point;

                    //console.log(random_point);
                    if(best_point !== null) {
                        console.log('best: ' + best_point + ' , random: ' + random_point);
                    }

                    //this.setPutBarricade(id, possible_points[Math.ceil(Math.random() * (possible_points.length - 1))]);
                    this.setPutBarricade(id, choosen_point);
                    Socket.to(id).emit('updateGame', game);
                }, ai_speed);
            }
        }, ai_speed * 3);
    };

};


module.exports = new Games;