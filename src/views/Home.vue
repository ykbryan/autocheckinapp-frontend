<template>
  <article>
    <b-toast id="toast" :title="toast.title">{{ toast.message }}</b-toast>
    <div class="app" :class="{ 'sign-up-active': showSignUp, 'home-active': isUser }">
      <LoadingView :isActive="showLoader" :uploadPercentage="uploadPercentage"></LoadingView>
      <div class="overlay-top text-center">
        <h2 class="mb-3">{{member.title }}</h2>
      </div>
      <div class="overlay-bottom text-center">
        <h5 class="mt-3 mb-3 ml-5 mr-5">{{ member.message }}</h5>
        <b-button class="button rounded-pill" @click="restart">Dismiss</b-button>
      </div>
      <div class="overlay-app">
        <div class="overlay">
          <div class="overlay-left">
            <h2>Welcome Back!</h2>
            <img
              src="https://a0.awsstatic.com/libra-css/images/site/touch-icon-ipad-144-smile.png"
              alt="AWS Demo"
              width="150"
              title="AWS"
            />
            <p>
              If you already have an existing account, you can go to the sign in
              page to login with your webcam.
            </p>
            <b-button class="button rounded-pill" @click="showSignUp = !showSignUp">Sign In</b-button>
          </div>
          <div class="overlay-right">
            <h2>Hello Friend!</h2>
            <p>
              <img
                src="https://a0.awsstatic.com/libra-css/images/site/touch-icon-ipad-144-smile.png"
                alt="AWS Demo"
                width="150"
                title="AWS"
              />
            </p>
            <p>
              If you are new here, you can go to the sign up page to register
              your account with your webcam.
            </p>
            <b-button class="button rounded-pill" @click="showSignUp = !showSignUp">Sign Up</b-button>
          </div>
        </div>
      </div>
      <div class="form sign-up">
        <h2>Registration</h2>
        <b-form-input id="input-name" placeholder="Name" v-model="name" trim></b-form-input>
        <b-form-input id="input-email" placeholder="Email" v-model="email" v-if="email !== ''" trim></b-form-input>
        <vue-web-cam
          class="webcam rounded"
          ref="registerCam"
          :device-id="deviceId"
          width="100%"
          height="200"
          @error="onError"
          @cameras="onCameras"
          @camera-change="onCameraChange"
          v-if="registerImg === null"
        />
        <img
          height="190"
          width="264"
          :src="registerImg"
          v-if="registerImg !== null"
          class="registerImg rounded mt-1 mb-2"
          alt="click img to reset"
          title="click img to reset"
          @click="restart"
        />
        <div v-if="devices.length > 1">
          <select class="form-control" v-model="camera">
            <option>-- Select Device --</option>
            <option
              v-for="device in devices"
              :key="device.deviceId"
              :value="device.deviceId"
            >{{ device.label }}</option>
          </select>
        </div>
        <div>
          <b-button
            v-if="registerImg === null"
            class="button rounded-pill"
            @click="onCapture"
          >Take Photo</b-button>
          <b-button v-if="registerImg !== null" class="button rounded-pill" @click="signUp">Sign Up</b-button>
        </div>
        <div class="mobile-only">
          <a href="#" @click="showSignUp = !showSignUp">Back to login</a>
        </div>
      </div>
      <div class="form sign-in">
        <form action="#">
          <h2>Sign in</h2>
          <div>with your camera</div>
          <img
            height="190"
            width="264"
            class="rounded mt-1 mb-2"
            :src="loginImg"
            @click="loginImg = null"
            v-if="loginImg !== null"
          />
          <vue-web-cam
            class="webcam rounded"
            ref="loginCam"
            :device-id="deviceId"
            width="100%"
            height="200"
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
              >{{ device.label }}</option>
            </select>
          </div>
          <b-button class="button rounded-pill" @click="signIn">Sign In</b-button>
          <div class="mobile-only">
            <a href="#" @click="showSignUp = !showSignUp">No account? Register now!</a>
          </div>
        </form>
      </div>
    </div>
  </article>
</template>

<script>
import { WebCam } from "vue-web-cam";
import LoadingView from "@/components/LoadingView";
import Auth from "@aws-amplify/auth";
import Storage from "@aws-amplify/storage";
import apihelper from "@/common/apihelper";
import imagehelper from "@/common/imagehelper";

export default {
  computed: {
    device: function() {
      return this.devices.find(n => n.deviceId === this.deviceId);
    }
  },
  data: () => {
    return {
      showLoader: false,
      showSignUp: false,
      isUser: false,
      name: "",
      email: "",
      registerImg: null,
      loginImg: null,
      camera: null,
      deviceId: null,
      devices: [],
      toast: {
        title: "Login Successful",
        message: "Hello {{somebody}}, Welcome to Demo!"
      },
      member: {
        title: "",
        message: ""
      },
      uploadPercentage: 0
    };
  },
  components: {
    "vue-web-cam": WebCam,
    LoadingView
  },
  methods: {
    signUp() {
      if (this.name !== "")
        this.uploadImageToS3(`register/${this.name}.jpg`, this.registerImg)
          .then(() => {
            apihelper
              .postToRegister(`public/register/${this.name}.jpg`)
              .then(response => {
                // Add your code here
                console.log(response);
                const { data, status } = response;

                setTimeout(() => {
                  this.showLoader = false;
                }, 500); // purposely slow it down to see the percentage & loader
                this.toast.title = status === 200 ? "Success!" : "Error";
                this.toast.message = data.message;
                this.$bvToast.show("toast");
              })
              .catch(error => {
                console.log(error.response);
                const { data } = error.response;
                this.toast.title = "Error registering";
                this.toast.message = data.message;
                this.$bvToast.show("toast");
                this.restart();
                this.showLoader = false;
              });
          })
          .catch(err => console.log(err));
      else alert("please enter your name");
    },
    signIn() {
      const imageName = Math.floor(Date.now() / 1000);
      this.loginImg = this.$refs.loginCam.capture();
      this.uploadImageToS3(`login/${imageName}.jpg`, this.loginImg)
        .then(() => {
          apihelper
            .postToLogin(`public/login/${imageName}.jpg`)
            .then(response => {
              // Add your code here
              console.log(response);
              const { data, status } = response;

              setTimeout(() => {
                this.showLoader = false;
                this.isUser = true;
              }, 500); // purposely slow it down to see the percentage & loader
              this.toast.title = status === 200 ? "Success!" : "Error";
              this.toast.message = data.message;
              this.member.title = "Welcome to the Event";
              this.member.message = data;
              this.$bvToast.show("toast");
            })
            .catch(error => {
              console.log(error.response);
              const { data } = error.response;
              this.toast.title = "Error logging in";
              this.toast.message = data.message;
              this.$bvToast.show("toast");
              this.restart();
              this.showLoader = false;
            });
        })
        .catch(err => console.log(err));
    },
    restart() {
      this.isUser = false;
      this.showLoader = false;
      this.loginImg = null;
      this.registerImg = null;
      setTimeout(() => {
        this.$refs.loginCam.start();
        this.$refs.registerCam.start();
      }, 500);
    },
    onCapture() {
      this.registerImg = this.$refs.registerCam.capture();
    },
    onError(error) {
      console.log("On Error Event", error);
    },
    onCameras(cameras) {
      this.devices = cameras;
    },
    onCameraChange(deviceId) {
      this.deviceId = deviceId;
      this.camera = deviceId;
    },
    setPercentage(progress) {
      const percentage = (progress.loaded / progress.total) * 100;
      console.log(percentage);
      this.uploadPercentage = percentage;
    },
    uploadImageToS3(filename, encodedImg) {
      const img = imagehelper.decodeImage(encodedImg);
      this.showLoader = true;
      Auth.currentCredentials();
      const refSetPercentage = this.setPercentage;
      return Storage.put(filename, img, {
        level: "public",
        contentType: "image/jpeg",
        progressCallback(progress) {
          refSetPercentage(progress);
        }
      });
    }
  },
  watch: {
    camera: function(id) {
      this.deviceId = id;
    },
    devices: function() {
      const [first] = this.devices;
      if (this.deviceId === null) {
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
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/styles/home.scss";
</style>
