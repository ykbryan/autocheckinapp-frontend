import '@babel/polyfill';
import 'mutationobserver-shim';
import Vue from 'vue';
import './plugins/bootstrap-vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Amplify from '@aws-amplify/core';
//@ts-ignore
import awsconfig from './aws-exports';

// TODO: to replace the API gateway for ep2
Amplify.configure({
  API: {
    endpoints: [
      {
        name: 'AutoCheckInAPI',
        endpoint:
          'https://cj2aqjavvl.execute-api.ap-southeast-1.amazonaws.com/Prod',
      },
    ],
  },
  ...awsconfig,
});
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
