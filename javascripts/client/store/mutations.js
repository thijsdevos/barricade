export default {
    setProfileId(state, profile_id) {
        state.profile.id = profile_id;
    },
    setupGame(state, obj) {
        state.game.id = obj.id;
        state.game.admin = obj.admin;
        state.game.turn = obj.turn;
        state.game.action = obj.action;
        state.game.started = obj.started;
        state.game.thrown = obj.thrown;
        state.game.picked_pawn = obj.picked_pawn;
        state.game.won = obj.won;
        state.board = obj.board;
        state.players = obj.players;
    },
    updateGame(state, obj) {
        state.game.turn = obj.turn;
        state.game.action = obj.action;
        state.game.started = obj.started;
        state.game.thrown = obj.thrown;
        state.game.picked_pawn = obj.picked_pawn;
        state.game.won = obj.won;
        state.game.counter.co = obj.counter.co;
        state.board = obj.board;
        state.players = obj.players;
    },
    setThrown(state, thrown) {
        state.game.thrown = thrown;
    },
    updatePossibleMoves(state, arr) {
        state.possible_moves = arr;
    },
    updateProfile(state, obj) {
        state.profile.color = obj.color;
    },
    updateProfileAfterReset(state) {
        state.profile.color = null;
    }
}
