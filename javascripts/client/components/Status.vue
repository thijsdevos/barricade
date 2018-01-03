<script>
    import Socket from '../utils/socket';
    export default {
        computed: {
            game() {
                return this.$store.getters.game;
            },
            profile() {
                return this.$store.getters.profile;
            },
            action() {
                if(this.profile.color === null) {
                    return 'kies kleur';
                }
                return this.game.action;
            }
        },
        methods: {
            isAdmin() {
                return this.game.admin === this.profile.id;
            },
            canStart() {
                return !this.game.started;// && this.profile.color !== null;
            },
            canReset() {
                return this.game.started;
            },
            startGame() {
                Socket.send('start_game');
            },
            resetGame() {
                Socket.send('reset_game');
            }
        },
    }
</script>

<template>
    <div class="status">

        Action: {{ action }} <br />
        Turn: {{ game.turn }} <br />

        Player id: {{ profile.id }} <br />
        Game id: {{ game.id }} <br />
        Admin: {{ game.admin }} <br />
        Color: {{ profile.color }} <br />
        Picked: {{ game.picked_pawn }}<br />
        Turn counter: {{ game.counter.co }}

        <div v-if="isAdmin()">
            <div v-if="canStart()" v-on:click="startGame()" style="margin: 10px; cursor: pointer; border: 1px solid black;">Start spel</div>
            <div v-if="canReset()" v-on:click="resetGame()" style="margin: 10px; cursor: pointer; border: 1px solid black;">Reset spel</div>
        </div>

    </div>
</template>
