<script>
    import Roll from './Roll.vue';
    import Socket from '../utils/socket';

    export default {
        components: {
            Roll
        },
        data() {
            return {
                rolling: true
            }
        },
        computed: {
            game() {
                return this.$store.getters.game;
            },
            profile() {
                return this.$store.getters.profile;
            },
            thrown() {
                return this.game.thrown === null ? '?' : this.game.thrown;
            }
        },
        methods: {
            isRolling() {
                return this.game.turn === this.profile.color && this.game.action === 'throw' && this.game.thrown === null;
            },
            stopRolling() {
                if(this.game.turn === this.profile.color) {
                    this.rolling = false;
                }
            },
            setRoll(thrown) {
                this.rolling = true;
                this.$store.dispatch('setThrown', thrown);
                Socket.send('set_thrown', thrown);
            }
        }
    }
</script>

<template>
    <div class="dice" v-on:click="stopRolling()">
        <roll v-if="isRolling()" v-on:rolled="setRoll" :rolling="rolling"></roll>
        <span v-else>{{ thrown }}</span>
    </div>
</template>
