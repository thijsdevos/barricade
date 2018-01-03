const Moves = function() {

    this.points = null;
    this.available = [];
    this.checked = [];

    this.get = (points, point_id, thrown, turn) => {

        this.points = points;
        this.turn = turn;
        this.available = [];
        this.checked = [];

        this.check(point_id, thrown);

        return this.available;
    };

    this.check = (point_id, thrown) => {

        this.checked.push(point_id);

        //console.log('point id: ' + point_id + ' thrown: ' + thrown + ' pointarr: ' + this.points[point_id]);
        //console.log('thrown: ' + thrown);

        if(thrown === 0) {
            if(this.exists(point_id) && this.points[point_id] !== this.turn) {
                //console.log('add point available: ' + point_id);
                this.available.push(point_id);
            }
        } else if(this.points[point_id] !== 'blocked') {
            const row = this.getRow(point_id);
            const column = this.getColumn(point_id);

            //check left
            let temp_id = row + ',' + (column - 1);
            //console.log('temp id left: ' + temp_id);
            if (this.continue(temp_id)) {
                this.check(temp_id, thrown - 1);
            }

            //check right
            temp_id = row + ',' + (column + 1);
            //console.log('temp id right: ' + temp_id);
            if (this.continue(temp_id)) {
                this.check(temp_id, thrown - 1);
            }

            //check top
            temp_id = (row - 1) + ',' + column;
            //console.log('temp id top: ' + temp_id);
            if (this.continue(temp_id)) {
                this.check(temp_id, thrown - 1);
            }

            //check bottom
            temp_id = (row + 1) + ',' + column;
            //console.log('temp id bottom: ' + temp_id);
            if (this.continue(temp_id)) {
                this.check(temp_id, thrown - 1);
            }
        }
    };

    this.exists = (point_id) => {
        return typeof this.points[point_id] !== 'undefined';
    };

    this.continue = (temp_id) => {
        return this.exists(temp_id) &&
               this.getRow(temp_id) !== 14 &&
               !this.checked.includes(temp_id);
    };

    this.getRow = (point_id) => {
        return parseInt(point_id.split(',')[0]);
    };

    this.getColumn = (point_id) => {
        return parseInt(point_id.split(',')[1]);
    };
};


module.exports = new Moves;