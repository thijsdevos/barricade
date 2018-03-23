<script>
    import Setup from './Setup.vue';
    import Board from './Board.vue';
    import Dice from './Dice.vue';
    import Status from './Status.vue';
    import Controls from './Controls.vue';
    import WinnerPopup from './WinnerPopup.vue';
    import Socket from '../utils/socket';

    export default {
        components: {
            Setup,
            Board,
            Dice,
            Controls,
            Status,
            WinnerPopup
        },
        beforeCreate() {
            this.$store.dispatch('setProfileId');
        },
        created() {
            Socket.recieve('setupGame', obj => { this.$store.dispatch('setupGame', obj); });
            Socket.recieve('updateGame', obj => { this.$store.dispatch('updateGame', obj); });
            Socket.recieve('updateProfile', obj => { this.$store.dispatch('updateProfile', obj); });
            Socket.recieve('updateProfileAfterReset', () => { this.$store.dispatch('updateProfileAfterReset'); });
            Socket.recieve('updatePossibleMoves', arr => { this.$store.dispatch('updatePossibleMoves', arr); });
        },
        computed: {
            game() {
                return this.$store.getters.game;
            }
        }
    }
</script>

<template>
    <div class="game">
        <setup v-if="game.id === null"></setup>
        <template v-else>
            <controls></controls>
            <board></board>
            <dice></dice>
            <status></status>
            <winner-popup v-if="game.won !== null"></winner-popup>
        </template>
    </div>
</template>
