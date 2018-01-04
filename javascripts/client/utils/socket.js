import io from 'socket.io-client';

const Socket = new function() {
    this.socket = io('ws://localhost:8443?profile_id=' + localStorage.getItem('barricade_profile_id'));
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