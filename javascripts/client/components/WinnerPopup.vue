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
                Socket.send('reset');
            }
        }
    }
</script>

<template>
    <div>
        <div class="popup-background"></div>
        <div class="winner-popup">
            <p class="winner-popup_text">De winnaar is {{ nickname_winner }}!</p>
            <div v-if="isAdmin()" v-on:click="resetGame()" class="winner-popup_button">Reset spel</div>
        </div>
    </div>
</template>