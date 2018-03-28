
function nickNamesPerColor(state) {
    let nicknames_per_color = {'red': 'AI', 'green': 'AI', 'yellow': 'AI', 'blue': 'AI'};
    state.players.forEach(player => {
        if(player.color !== null) {
            nicknames_per_color[player.color] = player.nickname;
        }
    });
    return nicknames_per_color;
}

export default {
    game(state) {
        return state.game;
    },
    profile(state) {
        return state.profile;
    },
    board(state) {
        return state.board;
    },
    possible_moves(state) {
        return state.possible_moves;
    },
    picked_colors(state) {
        let colors = [];
        state.players.forEach(player => {
            if(player.color !== null) {
                colors.push(player.color);
            }
        });
        return colors;
    },
    nicknames_per_color(state) {
        return nickNamesPerColor(state);
    },
    nickname_winner(state) {
        return nickNamesPerColor(state)[state.game.won];
    },
    chat(state) {
        return state.chat;
    }
}