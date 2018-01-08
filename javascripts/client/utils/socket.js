import io from 'socket.io-client';

//const url = 'ws://barricade-barricadeserver.1d35.starter-us-east-1.openshiftapps.com/';
const url = 'ws://localhost:8443';

const Socket = new function() {
    this.socket = io(url + '?profile_id=' + localStorage.getItem('barricade_profile_id'));
    this.send = (name, variable) => {
        this.socket.emit(name, variable);
    };

    this.recieve = (name, callback) => {
        this.socket.on(name, callback);
    };
};

//socket.on('connect', function(){});
//socket.on('event', function(data){});
//socket.on('disconnect', function(){});

export default Socket;