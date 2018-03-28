import Vue from 'vue';
import Store from './store';
import Game from './components/Game.vue';

new Vue({
    el: '#app',
    store: Store,
    components: { Game }
});