import Socket from '../utils/socket';

export default {
    setProfileId({ commit }) {
        if(localStorage.getItem('barricade_profile_id') === null) {
            localStorage.setItem('barricade_profile_id', Math.random().toString(36).substr(2));
        }
        commit('setProfileId', localStorage.getItem('barricade_profile_id'));
    },
    setThrown({ commit }, thrown) {
        commit('setThrown', thrown);
    },
    setupGame({ commit }, obj) {
        commit('setupGame', obj);
    },
    updateGame({ commit }, obj) {
        commit('updateGame', obj);
    },
    updateProfile({ commit }, obj) {
        commit('updateProfile', obj);
    },
    updateProfileAfterReset({ commit }) {
        commit('updateProfileAfterReset');
    },
    updatePossibleMoves({ commit }, arr) {
        commit('updatePossibleMoves', arr);
    },
    setupChat({ commit }, obj) {
        commit('setupChat', obj);
    },
    updateChat({ commit }, obj) {
        commit('updateChat', obj);
    }
}


