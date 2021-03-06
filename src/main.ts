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

Amplify.configure({
  API: {
    endpoints: [
      {
        name: 'AutoCheckInAPI',
        endpoint:
          'https://hf2ow2fmbd.execute-api.ap-southeast-1.amazonaws.com/Prod',
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
