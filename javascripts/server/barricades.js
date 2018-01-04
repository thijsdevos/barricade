const Barricades = function() {

    const loop = {
        left: [/*'3,16','3,15','3,14','3,13','3,12','3,11','3,10','3,9',*/'3,8','3,7','3,6','3,5','3,4','3,3','3,2','3,1','3,0','2,0','1,0','1,1','1,2','1,3','1,4','1,5','1,6','1,7','1,8'],
        right: [/*'3,0','3,1','3,2','3,3','3,4', '3,5','3,6','3,7',*/'3,8','3,9','3,10','3,11','3,12','3,13','3,14','3,15','3,16','2,16','1,16','1,15','1,14','1,13','1,12','1,11','1,10','1,9','1,8']
    };

    this.getNumberBarricadesBetweenPawnAndFinish = (points, point_id) => {

        let route = {
            left: null,
            right: null
        };

        let best_put_place = {
            left: null,
            right: null
        };

        for(let i in route) {

            let check = false;
            loop[i].forEach((loop_point_id) => {
                if(loop_point_id === point_id) {
                    check = true;
                    route[i] = 0;
                }
                if(check && points[loop_point_id] === 'blocked') {
                    route[i]++;
                } else if(check) {

                    if(points[loop_point_id] === null) {
                        best_put_place[i] = loop_point_id;
                    } else {
                        best_put_place[i] = null;
                    }

                }
            });
        }

        return {
            route: route,
            best_put_place: best_put_place
        };
    };

    this.getRoutes = () => {
        return loop;
    };

    this.getRow = (point_id) => {
        return parseInt(point_id.split(',')[0]);
    };

    this.getColumn = (point_id) => {
        return parseInt(point_id.split(',')[1]);
    };
};


module.exports = new Barricades;