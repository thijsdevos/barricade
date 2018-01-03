import Vue from 'vue';
import Game from './components/Game.vue';
import Store from './store';

new Vue({
    el: '#app',
    components: { Game },
    store: Store
});