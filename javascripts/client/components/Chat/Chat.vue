<script>
    import Socket from '../../utils/socket';
    export default {
        created() {
            Socket.recieve('updateChat', obj => { this.$store.dispatch('updateChat', obj); });
        },
        data() {
            return {
                send_message: null
            }
        },
        computed: {
            chat() {
                return this.$store.getters.chat;
            },
            profile() {
                return this.$store.getters.profile;
            }
        },
        methods: {
            sendMessage() {
                Socket.send('send_message', {nickname: this.profile.nickname, text: this.send_message});
                this.send_message = null;
            }
        }
    }
</script>

<template>
    <div class="chat">
        <div class="chat_messages">
            <div v-for="message in chat" class="chat_message">
                <span class="chat_message_nickname">{{ message.nickname }}:</span>
                <span class="chat_message_text">{{ message.text }}</span>
            </div>
        </div>
        <div class="chat_send-message">
            <input v-model="send_message" class="chat_send-message_input" placeholder="Send a message to other players" />
            <div v-on:click="sendMessage()" class="chat_send-message_button">Send</div>
        </div>
    </div>
</template>