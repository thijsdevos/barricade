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
                return this.game.thrown === null ? 'nothing' : this.game.thrown;
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
            },
            makeRollClass() {
                return 'roll_' + this.thrown;
            },
            makeStatusClass() {
                return { '-rolling' : this.isRolling() }
            }
        }
    }
</script>

<template>
    <div class="dice" :class="makeStatusClass()" v-on:click="stopRolling()">
        <roll v-if="isRolling()" v-on:rolled="setRoll" :rolling="rolling"></roll>
        <div v-else :class="makeRollClass()">
            <span v-if="thrown !== null" v-for="index in thrown"></span>
            <span v-else></span>
        </div>
    </div>
</template>
