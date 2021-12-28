import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import veeValidate from './includes/validation';
import './assets/tailwind.css';
import './assets/main.css';
import { auth } from './includes/firebase';
import Icon from './directives/icon';

let app;

auth.onAuthStateChanged(() => {
  if (!app) {
    app = createApp(App);
    app.use(veeValidate);
    app.use(store);
    app.use(router);
    app.directive('icon', Icon);
    app.mount('#app');
  }
});
