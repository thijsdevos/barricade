<script>
    import Point from './Point.vue';
    import Home from './Home.vue';

    export default {
        components: {
            Home,
            Point
        },
        props: ['row', 'row_id'],
        methods: {
            isHome(row_id) {
                return row_id === 14;
            }
        },
    }
</script>

<template>
    <div class="row" :row_id="row_id">
        <template v-for="i in row">
            <home v-if="isHome(row_id)" :point_id="row_id + ',' + i"></home>
            <point v-else :point_id="row_id + ',' + i"></point>
        </template>
    </div>
</template>
