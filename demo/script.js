
var Helper = new function() {
    this.getRow = function(id) {
        return parseInt(id.split(';')[0]);
    };
    this.getColumn = function(id) {
        return parseInt(id.split(';')[1]);
    }
    this.pointExists = function(id) {
        return typeof Points[id] === 'object';
    }
};

var Dice = new function() {
    var timeout;
    this.thrown = 1;

    this.start = function() {
        $('.dice').off('click', Dice.stop).on('click', Dice.stop);
        Dice.render();
    };

    this.render = function() {
        timeout = setTimeout(function() {
            $('.dice').html(Math.ceil(Math.random() * 6));
            Dice.start();
        });
    };

    this.stop = function() {
        clearTimeout(timeout);
        Dice.thrown = parseInt($('.dice').html());
        $('.dice').off('click', Dice.start).on('click', Dice.start);
    };

    this.getThrown = function() {
        return this.thrown;
    };
};

var Actions = new function() {
    this.selectPoint = function() {
        var point_id = $(this).attr('point_id');
        var player_id = $(this).attr('player_id');

        Route.create(point_id, player_id);
        Route.show();
    };
};

var Route = new function() {
    this.available = [];
    this.checked = [];

    this.create = function(point_id, player_id) {
        var _thrown = Dice.getThrown();
        Route.checked = [];
        Route.available = [];
        Route.check(point_id, _thrown, '');
        Route.show();
    };

    this.check = function(point_id, thrown, wind) {
        var _row = Helper.getRow(point_id);
        var _column = Helper.getColumn(point_id);

        Route.checked.push(point_id);

        if(thrown === 0) {
            if(Helper.pointExists(point_id)) {
                Route.available.push(point_id);
            }
        } else if(!Points[point_id].getBlocked()) {

            //check left
            var temp_id = _row + ';' + (_column - 1);
            if (Helper.pointExists(temp_id) && $.inArray(temp_id, Route.checked) < 0) {
                Route.check(temp_id, thrown - 1, 'left');
            }

            //check right
            var temp_id = _row + ';' + (_column + 1);
            if (Helper.pointExists(temp_id) && $.inArray(temp_id, Route.checked) < 0) {
                Route.check(temp_id, thrown - 1, 'right');
            }

            //check top
            var temp_id = (_row + 1) + ';' + _column;
            if (Helper.pointExists(temp_id) && $.inArray(temp_id, Route.checked) < 0) {
                Route.check(temp_id, thrown - 1, 'bottom');
            }

            //check bottom
            var temp_id = (_row - 1) + ';' + _column;
            if (Helper.pointExists(temp_id) && $.inArray(temp_id, Route.checked) < 0) {
                Route.check(temp_id, thrown - 1, 'bottom');
            }
        }
    };

    this.show = function() {
        console.log(Route.available);
        for(var i in Route.available) {
            $('[point_id="' + Route.available[i] + '"]').addClass('--available');
        }
    };
};

var Point = function() {
    this.blocked = false;

    this.setBlocked = function(bool) {
        this.blocked = bool;
    };

    this.getBlocked = function() {
        return this.blocked;
    };
};

var Board = new function() {
    this.render = function() {
        this.clear();

        Players.forEach(function(player, key) {

            var filled_points = player.getPoints();

            for(var i in filled_points) {

                var id = filled_points[i];
                var row = Helper.getRow(id);
                var column = Helper.getColumn(id);

                var $point =  $('[point_id="' + id + '"]');

                $point.addClass('--filled').attr({'player_id': key});

                if(row === 0) {
                    var number_of_points_in_point = parseInt($point.html()) + 1;
                    if(number_of_points_in_point > 0) {
                        $point.addClass('--available');
                    }
                    $point.html(number_of_points_in_point);
                }
            }
        });

        for(var id in Points) {
            if(Points[id].blocked) {
                $('[point_id="' + id + '"]').addClass('--blocked');
            }
        }

        $('.--filled').off('click', Actions.selectPoint).on('click', Actions.selectPoint);
        Dice.start();
    };

    this.clear = function() {
        $('.home').removeClass('--available');
        $('.point').removeClass('--blocked --available --filled').attr({'player_id': ''});
    };
};

var Player = function() {
    this.points;

    this.setPoints = function(points) {
        this.points = points;
    }

    this.getPoints = function() {
        return this.points;
    }
};

var Points = {};
var Players = [];
$('.point, .home').each(function() {
    Points[$(this).attr('point_id')] = new Point();
});

Players.push(new Player);
Players.push(new Player);
Players.push(new Player);
Players.push(new Player);

Players[0].setPoints(['0;2', '0;2', '0;2', '0;2', '0;2']);
Players[1].setPoints(['0;6', '0;6', '0;6', '0;6', '0;6']);
Players[2].setPoints(['0;10', '0;10', '0;10', '0;10', '0;10']);
Players[3].setPoints(['0;14', '0;14', '0;14', '0;14', '0;14']);

Points['3;0'].setBlocked(true);
Points['3;4'].setBlocked(true);
Points['3;8'].setBlocked(true);
Points['3;12'].setBlocked(true);
Points['3;16'].setBlocked(true);
Points['7;4'].setBlocked(true);
Points['7;12'].setBlocked(true);
Points['9;8'].setBlocked(true);
Points['10;8'].setBlocked(true);
Points['11;8'].setBlocked(true);
Points['13;8'].setBlocked(true);

Board.render();
