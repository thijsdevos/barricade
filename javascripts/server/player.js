
const Player = function(id) {
    this.id = id;
    this.game_id = null;
    this.nickname = null;
    this.color = null;
    this.type = null; // human / ai
};

module.exports = Player;