<script>
    import Socket from '../utils/socket';
    export default {
        props: ['point_id'],
        data() {
            return {
                colors: {
                    '14,2': 'red',
                    '14,6': 'green',
                    '14,10': 'yellow',
                    '14,14': 'blue',
                }
            }
        },
        computed: {
            game() {
                return this.$store.getters.game;
            },
            profile() {
                return this.$store.getters.profile;
            },
            pawns() {
                return this.$store.getters.board.home[this.point_id];
            },
            color() {
                return this.colors[this.point_id];
            },
            color_available() {
                return this.$store.getters.picked_colors.includes(this.color);
            },
            nickname() {
                return this.$store.getters.nicknames_per_color[this.color];
            },
            is_players_turn() {
                return this.game.turn === this.color;
            }
        },
        methods: {
            isAdmin() {
                return this.game.admin === this.profile.id;
            },
            pickColor() {
                Socket.send('pick_color', this.color);
            },
            pickAI() {
                Socket.send('pick_ai', this.color);
            },
            makeClass() {
                return { '--is-players-turn': this.is_players_turn }
            },
            isPickable() {
                return this.pawns > 0 && this.is_players_turn && this.game.turn === this.profile.color && this.game.action === 'pick_pawn';
            },
            isPicked() {
                return this.pawns > 0 && this.is_players_turn && this.game.action === 'put_pawn' && this.point_id === this.game.picked_pawn;
            },
            pickPawn() {
                Socket.send('pick_pawn', this.point_id);
            },
            cancelPawn() {
                Socket.send('cancel_pawn', this.point_id);
            }
        }
    }
</script>

<template>
    <div class="home" :point_id="point_id" :color="color" :class="makeClass()">

        <div v-if="isPickable()" v-on:click="pickPawn" class="home_pawns --pickable">{{ pawns }}</div>
        <div v-else-if="isPicked()" v-on:click="cancelPawn" class="home_pawns --picked">{{ pawns }}</div>
        <div v-else class="home_pawns">{{ pawns }}</div>

        <div v-if="!color_available">
            <div v-if="profile.color === null" v-on:click="pickColor" class="home_pick-color">Kiezen</div>
            <span v-if="profile.color === null" style="text-align: center; display: block; margin: 10px 0 -10px;">of</span>
            <div v-on:click="pickAI" class="home_pick-color">AI</div>
        </div>

        <div v-if="color_available" class="home_nickname">{{ nickname }}</div>

    </div>
</template>
