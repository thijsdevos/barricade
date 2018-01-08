const Game = function(id, player_id) {

    this.id = id;
    this.admin = player_id;
    this.players = [];
    this.running = false;

    this.get = () => {
        return {
            id: this.id,
            admin: this.admin,
            running: this.running,
            players: this.players
        }
    };

    this.addPlayer = (player) => {
        this.players.push(player);
    };

    this.start = () => {
        this.running = true;
    };

    this.reset = () => {
        this.running = false;
    }

};


module.exports = Game;