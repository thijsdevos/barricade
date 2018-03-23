<script>
    import Socket from '../utils/socket';
    export default {
        data() {
            return {
                pincode: { value: null, validated: true },
                nickname: { value: 'kees', validated: true }
            }
        },
        mounted(){
            this.$refs.nickname.focus();
        },
        methods: {
            setup() {
                Socket.send('setup', this.nickname.value);
            },
            join() {
                Socket.send('join', {
                    pincode: this.pincode.value,
                    nickname: this.nickname.value
                });
            }
        }
    }
</script>

<template>
    <div class="setup">
        <div class="setup_row">
            <input v-model="nickname.value" class="setup_input" placeholder="Nickname" ref="nickname" />
            <span v-on:click="setup" class="setup_button">Setup game</span>
        </div>
        <div class="setup_row">
            <input v-model="pincode.value" class="setup_input" placeholder="Pincode" />
            <span v-on:click="join" class="setup_button">Join game</span>
        </div>
    </div>
</template>
