<template>
  <article>
    <b-toast id="toast" :title="toast.title">
      {{ toast.message }}
    </b-toast>
    <div class="app mt-5 mb-5" :class="{ 'sign-up-active': showSignUp }">
      <div class="loader" :class="{ 'loader-active': showLoader }">
        <b-spinner variant="success" label="Spinning"></b-spinner>
      </div>
      <div class="overlay-app">
        <div class="overlay">
          <div class="overlay-left">
            <h2>Welcome Back!</h2>
            <p>Please login with your personal info</p>
            <b-button
              class="button rounded-pill"
              @click="showSignUp = !showSignUp"
              >Sign In</b-button
            >
          </div>
          <div class="overlay-right">
            <h2>Hello, Friend!</h2>
            <p>Please enter your personal details</p>
            <b-button
              class="button rounded-pill"
              @click="showSignUp = !showSignUp"
              >Sign Up</b-button
            >
          </div>
        </div>
      </div>
      <div class="form sign-up">
        <h2>Registration</h2>
        <b-form-input
          id="input-name"
          placeholder="Name"
          v-model="name"
          trim
        ></b-form-input>
        <b-form-input
          id="input-email"
          placeholder="Email"
          v-model="email"
          trim
        ></b-form-input>
        <vue-web-cam
          class="webcam rounded"
          ref="registerCam"
          :device-id="deviceId"
          width="100%"
          height="200"
          @started="onStarted"
          @stopped="onStopped"
          @error="onError"
          @cameras="onCameras"
          @camera-change="onCameraChange"
          v-if="registerImg === null"
        />
        <img
          height="200"
          :src="registerImg"
          v-if="registerImg !== null"
          class="rounded"
        />
        <div v-if="devices.length > 1">
          <select class="form-control" v-model="camera">
            <option>-- Select Device --</option>
            <option
              v-for="device in devices"
              :key="device.deviceId"
              :value="device.deviceId"
              >{{ device.label }}</option
            >
          </select>
        </div>
        <div>
          <b-button class="button rounded-pill" @click="signUp"
            >Sign Up</b-button
          >
        </div>
      </div>
      <div class="form sign-in">
        <form action="#">
          <h2>Sign in</h2>
          <div>with your camera</div>
          <img
            height="200"
            :src="loginImg"
            v-if="loginImg !== null"
            class="rounded"
          />
          <vue-web-cam
            class="webcam rounded"
            ref="loginCam"
            :device-id="deviceId"
            width="100%"
            height="200"
            @started="onStarted"
            @stopped="onStopped"
            @error="onError"
            @cameras="onCameras"
            @camera-change="onCameraChange"
            v-if="loginImg === null"
          />
          <div v-if="devices.length > 1">
            <select class="form-control" v-model="camera">
              <option>-- Select Device --</option>
              <option
                v-for="device in devices"
                :key="device.deviceId"
                :value="device.deviceId"
                >{{ device.label }}</option
              >
            </select>
          </div>
          <b-button class="button rounded-pill" @click="signIn"
            >Sign In</b-button
          >
        </form>
      </div>
    </div>
  </article>
</template>

<script>
import { WebCam } from 'vue-web-cam';

export default {
  computed: {
    device: function() {
      return this.devices.find((n) => n.deviceId === this.deviceId);
    },
  },
  data: () => {
    return {
      showLoader: false,
      showSignUp: false,
      name: '',
      email: '',
      registerImg: null,
      loginImg: null,
      camera: null,
      deviceId: null,
      devices: [],
      toast: {
        title: 'Login Successful',
        message: 'Hello {{somebody}}, Welcome to Demo!',
      },
    };
  },
  components: {
    'vue-web-cam': WebCam,
  },
  methods: {
    signUp() {
      console.log('signUp');
      this.registerImg = this.$refs.registerCam.capture();
      this.showLoader = true;
      this.toast = {
        title: 'Sign Up Successful',
        message: 'Welcome to the team, {{somebody}}',
      };
      this.$bvToast.show('toast');
    },
    signIn() {
      console.log('signIn');
      this.loginImg = this.$refs.loginCam.capture();
      this.showLoader = true;
      this.$bvToast.show('toast');
    },
    onCapture() {
      this.registerImg = this.$refs.loginCam.capture();
    },
    onStarted(stream) {
      console.log('On Started Event', stream);
    },
    onStopped(stream) {
      console.log('On Stopped Event', stream);
    },
    onStop() {
      this.$refs.loginCam.stop();
    },
    onStart() {
      this.$refs.loginCam.start();
    },
    onError(error) {
      console.log('On Error Event', error);
    },
    onCameras(cameras) {
      this.devices = cameras;
      console.log('On Cameras Event', cameras);
    },
    onCameraChange(deviceId) {
      this.deviceId = deviceId;
      this.camera = deviceId;
      console.log('On Camera Change Event', deviceId);
    },
  },
  watch: {
    camera: function(id) {
      this.deviceId = id;
    },
    devices: function() {
      // Once we have a list select the first one
      const [first] = this.devices;
      if (first) {
        this.camera = first.deviceId;
        this.deviceId = first.deviceId;
      }
    },
    showSignUp: function(value) {
      this.registerImg = null;
      this.loginImg = null;
      if (value) {
        this.$refs.loginCam.stop();
        this.$refs.registerCam.start();
      } else {
        this.$refs.loginCam.start();
        this.$refs.registerCam.stop();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.loader {
  position: absolute;
  display: none;
  background-color: #eeeeee;
  opacity: 0.7;
  width: 768px;
  height: 580px;
  z-index: 100;
  span {
    margin-top: 35%;
  }
}
.loader-active {
  display: inherit;
  text-align: center;
}
.app {
  position: relative;
  width: 768px;
  height: 580px;
  margin: 0 auto;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2), 0 10px 10px rgba(0, 0, 0, 0.2);
  background: linear-gradient(to bottom, #efefef, #ccc);
  .overlay-app {
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    transition: transform 0.5s ease-in-out;
    z-index: 99;
  }
  .overlay {
    position: relative;
    left: -100%;
    height: 100%;
    width: 200%;
    background: linear-gradient(to bottom right, #7fd625, #009345);
    color: #fff;
    transform: translateX(0);
    transition: transform 0.5s ease-in-out;
  }
  .webcam {
    border: 1px solid #a3a3a3;
  }
  @mixin overlays($property) {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-direction: column;
    padding: 70px 40px;
    text-align: center;
    transform: translateX($property);
    transition: transform 0.5s ease-in-out;
  }
  .overlay-left {
    @include overlays(-20%);
  }
  .overlay-right {
    @include overlays(0);
    right: 0;
  }
}
.button {
  border: 1px solid #009345;
  background-color: #009345;
  text-transform: uppercase;
  margin: 5px;
  padding: 10px 40px;
  cursor: pointer;
  transition: transform 0.1s ease-in;
  &:active {
    transform: scale(0.9);
  }
  &:focus {
    outline: none;
  }
}
.btn-clear {
  background-color: #a3a3a3;
  border: 1px solid #999999;
}
.form {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
  padding: 50px 60px;
  text-align: center;
  background: linear-gradient(to bottom, #efefef, #ccc);
  transition: all 0.5s ease-in-out;
}
.sign-in,
.sign-up,
.overlay-left,
.overlay-right {
  width: 50%;
  height: 100%;
}
.sign-in {
  left: 0;
  z-index: 2;
}
.sign-up {
  left: 0;
  z-index: 1;
  opacity: 0;
}
.sign-up-active {
  .sign-in {
    transform: translateX(100%);
  }
  .sign-up {
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
    animation: show 0.5s;
  }
  .overlay-app {
    transform: translateX(-100%);
  }
  .overlay {
    transform: translateX(50%);
  }
  .overlay-left {
    transform: translateX(0);
  }
  .overlay-right {
    transform: translateX(20%);
  }
}
@keyframes show {
  0% {
    opacity: 0;
    z-index: 1;
  }
  49% {
    opacity: 0;
    z-index: 1;
  }
  50% {
    opacity: 1;
    z-index: 10;
  }
}
</style>
