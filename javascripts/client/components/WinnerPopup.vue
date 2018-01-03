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
            nickname_winner() {
                return this.$store.getters.nickname_winner;
            }
        },
        methods: {
            isAdmin() {
                return this.game.admin === this.profile.id;
            },
            resetGame() {
                Socket.send('reset_game');
            }
        }
    }
</script>

<template>
    <div>
        <div class="popup-background"></div>
        <div class="winner-popup">
            De winnaar is {{ nickname_winner }}!
            <div v-if="isAdmin()" v-on:click="resetGame()" style="margin: 10px; cursor: pointer; border: 1px solid black;">Reset spel</div>
        </div>
    </div>
</template>