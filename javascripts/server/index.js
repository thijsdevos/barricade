
const Socket = require('./socket');
const Players = require('./players');
const Games = require('./games');


Socket.on('connection', (client) => {

    const player_id = client.handshake.query.profile_id;

    if(!Players.exists(player_id)) {
        Players.create(player_id);
    } else if(Players.get(player_id).game_id !== null) {
        var player = Players.get(player_id);
        client.join(player.game_id);
        client.emit('updateProfile', player);
        client.emit('setupGame', Games.get(player.game_id));
    }

    client.on('setup', (nickname) => {

        const game = Games.create(player_id);

        Players.setNickname(player_id, nickname);
        Players.setGameId(player_id, game.id);

        Games.addPlayer(game.id, Players.get(player_id));

        client.join(game.id);
        client.emit('setupGame', Games.get(game.id));
    });

    client.on('join', (obj) => {

        const game_id = obj.pincode;

        Players.setNickname(player_id, obj.nickname);
        Players.setGameId(player_id, game_id);

        Games.addPlayer(game_id, Players.get(player_id));

        client.join(game_id);
        client.emit('setupGame', Games.get(game_id));
    });

    client.on('pick_color', (color) => {

        Players.setColor(player_id, color);
        Players.setType(player_id, 'human');

        const player = Players.get(player_id);
        const game_id = player.game_id;

        Games.updatePlayer(game_id, player);

        client.emit('updateProfile', player);
        Socket.to(game_id).emit('updateGame', Games.get(game_id));
    });

    client.on('pick_ai', (color) => {
        const game_id = Players.get(player_id).game_id;
        Games.addPlayer(game_id, {
            id: Math.random().toString(36).substr(2),
            game_id: game_id,
            nickname: color,
            color: color,
            type: 'ai'
        });
        Socket.to(game_id).emit('updateGame', Games.get(game_id));
    });

    client.on('start_game', () => {
        const game_id = Players.get(player_id).game_id;
        Games.startGame(game_id);
        Socket.to(game_id).emit('updateGame', Games.get(game_id));
    });

    client.on('reset_game', () => {
        const game_id = Players.get(player_id).game_id;
        Games.resetGame(game_id);
        Socket.to(game_id).emit('updateGame', Games.get(game_id));
        Socket.to(game_id).emit('updateProfileAfterReset');
    });

    client.on('set_thrown', (thrown) => {
        const game_id = Players.get(player_id).game_id;
        Games.setThrown(game_id, thrown);
        Socket.to(game_id).emit('updateGame', Games.get(game_id));
    });

    client.on('pick_pawn', (point_id) => {
        const game_id = Players.get(player_id).game_id;
        Games.setPickedPawn(game_id, point_id);
        Socket.to(game_id).emit('updateGame', Games.get(game_id));
        Socket.to(game_id).emit('updatePossibleMoves', Games.getPossibleMoves(game_id, point_id));
    });

    client.on('cancel_pawn', (point_id) => {
        const game_id = Players.get(player_id).game_id;
        Games.cancelPickedPawn(game_id, point_id);
        Socket.to(game_id).emit('updateGame', Games.get(game_id));
        Socket.to(game_id).emit('updatePossibleMoves', []);
    });

    client.on('put_pawn', (point_id) => {
        const game_id = Players.get(player_id).game_id;
        Games.setPutPawn(game_id, point_id);
        Socket.to(game_id).emit('updateGame', Games.get(game_id));
        Socket.to(game_id).emit('updatePossibleMoves', []);

        //if(Games.isAI(game_id)) {
            //Games.turnAI(game_id);
        //}
    });

    client.on('put_barricade', (point_id) => {
        const game_id = Players.get(player_id).game_id;
        Games.setPutBarricade(game_id, point_id);
        Socket.to(game_id).emit('updateGame', Games.get(game_id));

        //if(Games.isAI(game_id)) {
           // Games.turnAI(game_id);
       // }
    });



});

console.log('server started!');