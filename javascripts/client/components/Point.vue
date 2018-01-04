<script>
    import Socket from '../utils/socket';
    export default {
        props: ['point_id'],
        data() {
            return {
                show_ids: true
            }
        },
        computed: {
            game() {
                return this.$store.getters.game;
            },
            profile() {
                return this.$store.getters.profile;
            },
            points() {
                return this.$store.getters.board.points;
            },
            possible_moves() {
                return this.$store.getters.possible_moves;
            },
            row() {
                return parseInt(this.point_id.split(',')[0]);
            }
        },
        methods: {
            isPuttableForPawn() {
                return this.possible_moves.includes(this.point_id);
            },
            isPuttableForBarricade() {
                return this.game.action === 'put_barricade' && this.game.turn === this.profile.color && this.row < 12 && this.points[this.point_id] === null;
            },
            isPickable() {
                return this.points[this.point_id] === this.game.turn && this.game.turn === this.profile.color && this.game.action === 'pick_pawn';
            },
            isPicked() {
                return this.point_id === this.game.picked_pawn && this.game.action === 'put_pawn';
            },
            makeClass() {
                return {
                    '--blocked': this.points[this.point_id] === 'blocked',
                    '--blue': this.points[this.point_id] === 'blue',
                    '--red': this.points[this.point_id] === 'red',
                    '--yellow': this.points[this.point_id] === 'yellow',
                    '--green': this.points[this.point_id] === 'green',
                    '--pickable': this.isPickable(),
                    '--picked': this.isPicked(),
                    '--puttable': this.isPuttableForPawn(),
                    '--puttable-barricade': this.isPuttableForBarricade(),
                };
            },
            clickPawn() {
                let action = '';
                if(this.isPickable()) {
                    action = 'pick_pawn';
                } else if(this.isPicked()) {
                    action = 'cancel_pawn';
                } else if(this.isPuttableForPawn()) {
                    action = 'put_pawn';
                } else if(this.isPuttableForBarricade()) {
                    action = 'put_barricade';
                } else {
                    return false;
                }
                Socket.send(action, this.point_id);
            }
        }
    }
</script>

<template>
    <div v-on:click="clickPawn()" class="point" :class="makeClass()" :point_id="point_id">{{ show_ids ? point_id : '' }}</div>
</template>
