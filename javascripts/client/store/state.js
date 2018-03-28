export default {
    profile: {
        id: null,
        color: null,
        nickname: null
    },
    game: {
        id: null,
        turn: null, // red, blue etc
        action: null, // throw, pick barricade, put barricade, pick pawn, put pawn,
        admin: null,
        started: false,
        players: [],
        thrown: null,
        picked_pawn: null,
        won: null,
        running: false,
        counter: {
            color: null,
            co: 0
        },
        speed: 100
    },
    board: {
        home: {},
        points: {}
    },
    possible_moves: [],
    dice: {
        thrown: null, // integer between 1 and 6,
        history: [], // history of what has been thrown in the turn of the active player. So that all the nuke stuff can happen after thrown 6's
    },
    players: {
        red: {
            admin: false,
            nickname: null
        }
    },
    chat: [
        {
            nickname: null,
            text: null
        }
    ]
}

