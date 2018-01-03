var Points = require('./points');
var Barricades = require('./barricades');

function createPoints() {
    var created_points = {};
    Points.forEach((row, row_id) => {
        row.forEach((point_id) => {
            var position = row_id + ',' + point_id;
            created_points[position] = Barricades.includes(position) ? 'blocked' : null;
        });
    });
    return created_points;
}
/*
module.exports = {
    'home': {
        '14,2': 5,
        '14,6': 5,
        '14,10': 5,
        '14,14': 5
    },
    'points': createPoints()
};
*/

module.exports = function() {

    this.home = {
        '14,2': 5,
        '14,6': 5,
        '14,10': 5,
        '14,14': 5
    };

    this.points = createPoints();

};
