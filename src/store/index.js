import { createStore } from 'vuex';
import { Howl } from 'howler';
import { auth, usersCollection } from '@/includes/firebase';

export default createStore({
  state: {
    userLoggedIn: false,
    authModalShow: false,
    currentSong: {},
    sound: {},
  },
  mutations: {
    toggleAuthModal: (state) => {
      state.authModalShow = !state.authModalShow;
    },
    toggleAuth: (state) => {
      state.userLoggedIn = !state.userLoggedIn;
    },
    newSong: (state, payload) => {
      state.currentSong = payload;
      state.sound = new Howl({
        src: [payload.url],
        html5: true,
      });
    },
  },
  actions: {
    initLogin({ commit }) {
      const user = auth.currentUser;
      if (user) {
        commit('toggleAuth');
      }
    },
    async login({ commit }, payload) {
      await auth.signInWithEmailAndPassword(payload.email, payload.password);
      commit('toggleAuth');
    },
    async register({ commit }, payload) {
      const { user } = await auth.createUserWithEmailAndPassword(payload.email, payload.password);
      await usersCollection.doc(user.uid).set({
        name: payload.name,
        email: payload.email,
        age: payload.age,
        country: payload.country,
      });
      user.updateProfile({
        displayName: payload.name,
      });
      commit('toggleAuth');
    },
    async signOut({ commit }) {
      await auth.signOut();
      commit('toggleAuth');
    },
    async newSong({ commit, state }, payload) {
      commit('newSong', payload);
      state.sound.play();
    },
  },
  getters: {},
});
