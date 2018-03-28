<script>
    import Socket from '../utils/socket';
    export default {
        data() {
            return {
                speed: this.$store.getters.game.speed
            }
        },
        computed: {
            game() {
                return this.$store.getters.game;
            },
            profile() {
                return this.$store.getters.profile;
            },
            canStart() {
                return !this.game.running && this.isAdmin();
            },
            canReset() {
                return this.game.running && this.isAdmin();
            }
        },
        methods: {
            isAdmin() {
                return this.game.admin === this.profile.id;
            },
            startGame() {
                Socket.send('start');
            },
            resetGame() {
                Socket.send('reset');
            },
            setGameSpeed() {
                Socket.send('set_game_speed', this.speed);
            }
        }
    }
</script>

<template>
    <div class="controls">
        <span v-if="canStart" v-on:click="startGame()" class="controls_button">Start the game</span>
        <span v-if="canReset" v-on:click="resetGame()" class="controls_button">Reset the game</span>

        <select v-if="isAdmin()" class="controls_speed" v-model="speed" v-on:change="setGameSpeed()">
            <option value="100">Speed: fast</option>
            <option value="1000">Speed: normal</option>
            <option value="3000">Speed: slow</option>
        </select>

        <span class="controls_pincode">Pincode: {{ game.id }}</span>

    </div>
</template>