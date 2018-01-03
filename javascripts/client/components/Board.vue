<script>
    import Points from '../../common/points';
    import Row from './Row.vue';

    export default {
        components: {
            Row
        },
        data() {
            return {
                points: Points,
            }
        },
    }
</script>

<template>
    <div class="board">
        <row v-for="(row, row_id) in points" :key="row_id" :row_id="row_id" :row="row"></row>
    </div>
</template>
