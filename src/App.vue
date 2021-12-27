<template>
  <AppHeader />
  <AuthModal />
  <router-view></router-view>
  <app-player />
</template>
<script>
import AppHeader from './components/Header.vue';
import AuthModal from './components/Auth.vue';
import AppPlayer from './components/Player.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    AuthModal,
    AppPlayer,
  },
  created() {
    this.$store.dispatch('initLogin');
  },
};
</script>
