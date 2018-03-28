import io from 'socket.io-client';

const url = 'ws://localhost:8443';

const Socket = new function() {
    this.socket = io(url + '?profile_id=' + localStorage.getItem('barricade_profile_id'));
    this.send = (name, value) => {
        this.socket.emit(name, value);
    };

    this.recieve = (name, callback) => {
        this.socket.on(name, callback);
    };
};

export default Socket;