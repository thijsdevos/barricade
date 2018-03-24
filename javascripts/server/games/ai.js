
const Moves = require('./moves');
const Barricades = require('./barricades');

const AI = function() {

    this.getBestMoveForPuttingPawn = (board, home_points, turn, thrown) => {

        let points_checked = [];
        let point_with_highest_score = {
            id: null,
            score: 0,
            move: null
        };

        const current_points = board.points;
        const current_number_home_pawns = board.home[home_points[turn]];

        let co = 0;
        for(let x in current_points) {
            if(current_points[x] === turn) {

                const point_id_to_check = x;
                const moves = Moves.get(board.points, point_id_to_check, thrown, turn);

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
                    else if(Moves.getRow(point_id_to_check) < 6 && Moves.getRow(point_id_to_check) > 2 && Moves.getColumn(point_id_to_check) > 6 && Moves.getColumn(point_id_to_check) < 10 && thrown > 1) {
                        let barricades_between_pawn_finish = Barricades.getNumberBarricadesBetweenPawnAndFinish(current_points, '3,8');

                        if(barricades_between_pawn_finish.route.left !== null && Moves.getColumn(point_id_to_check) > Moves.getColumn(move)) {
                            score = 90 / barricades_between_pawn_finish.route.left;
                        }

                        if(barricades_between_pawn_finish.route.right !== null && Moves.getColumn(point_id_to_check) < Moves.getColumn(move)) {
                            let new_score = 90 / barricades_between_pawn_finish.route.right;
                            score = score < new_score ? new_score : score;
                        }
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

                    if(score > point_with_highest_score.score || point_with_highest_score.id === null) {
                        point_with_highest_score.id = x;
                        point_with_highest_score.move = move;
                        point_with_highest_score.score = score;
                    }
                });
                co++;
            }
        }

        if(points_checked.length < 5 && point_with_highest_score.score < 5 && current_number_home_pawns > 0) {
            point_with_highest_score.id = home_points[turn];
            const moves = Moves.get(board.points, point_with_highest_score.id, thrown, turn);

            moves.forEach((move) => {
                if(current_points[move] === 'blocked') {
                    score = 25;
                } else if(Moves.getRow(home_points[turn]) > Moves.getRow(move)) {
                    score = 10 * (Moves.getRow(home_points[turn]) - Moves.getRow(move));
                } else {
                    score = 0;
                }

                if(score > point_with_highest_score.score) {
                    point_with_highest_score.id = home_points[turn];
                    point_with_highest_score.move = move;
                    point_with_highest_score.score = score;
                }
            });
        }

        return point_with_highest_score;
    };

    this.getBestMoveForPuttingBarricade = (board, turn) => {
        const points = board.points;
        const possible_points = [];
        let best_point = null;
        for(let x in points) {
            if(Moves.getRow(x) < 12) {
                if (points[x] === null) {
                    possible_points.push(x);
                }

                if (points[x] !== null && points[x] !== turn && points[x] !== 'blocked') {
                    let row = Moves.getRow(x);
                    let column = Moves.getColumn(x);


                    if(row < 4) {
                        let barricades_between_pawn_finish = Barricades.getNumberBarricadesBetweenPawnAndFinish(points, x);
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
                        break;
                    }
                    else if(row === 1 && column > 8 && typeof points[row + ',' + (column - 1)] !== 'undefined' && points[row + ',' + (column - 1)] === null) {
                        best_point = row + ',' + (column - 1);
                        break;
                    }
                    else if(row === 3 && column < 8 && typeof points[row + ',' + (column - 1)] !== 'undefined' && points[row + ',' + (column - 1)] === null) {
                        best_point = row + ',' + (column - 1);
                        break;
                    }
                    else if(row === 3 && column > 8 && typeof points[row + ',' + (column + 1)] !== 'undefined' && points[row + ',' + (column + 1)] === null) {
                        best_point = row + ',' + (column + 1);
                        break;
                    } else if (typeof points[(row - 1) + ',' + column] !== 'undefined' && points[(row - 1) + ',' + column] === null) {
                        best_point = (row - 1) + ',' + column;
                        break;
                    }
                    else if(row > 3 && column <= 8 && typeof points[row + ',' + (column + 1)] !== 'undefined' && points[row + ',' + (column + 1)] === null) {
                        best_point = row + ',' + (column + 1);
                        break;
                    }
                    else if(row > 3 && column > 8 && typeof points[row + ',' + (column - 1)] !== 'undefined' && points[row + ',' + (column - 1)] === null) {
                        best_point = row + ',' + (column - 1);
                        break;
                    }
                }
            }
        }

        let random_point = possible_points[Math.ceil(Math.random() * (possible_points.length - 1))];
        let choosen_point = best_point !== null && best_point !== '0,8' ? best_point : random_point;

        return choosen_point;
    }

};


module.exports = new AI;