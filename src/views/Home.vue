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
        <img
          src="@/assets/qr.jpg"
          width="150"
          alt="QR Feedback"
          title="QR code to provide feedback"
        />

        <div>
          <b-button
            class="button rounded-pill"
            href="https://bit.ly/3bOsZ3u"
            target="_blank"
            title="Give us feedback"
          >Give us feedback</b-button>
          <b-button class="button rounded-pill" @click="restart">Dismiss</b-button>
        </div>
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
        <b-form-input id="input-email" placeholder="Email" v-model="email" trim></b-form-input>
        <vue-web-cam
          class="webcam rounded"
          ref="registerCam"
          :device-id="deviceId"
          width="100%"
          height="200"
          @error="onError"
          @cameras="onCameras"
          @camera-change="onCameraChange"
        />
        <div style="width: 100%" v-if="registerImages.length !== 0">
          <div v-for="img in registerImages" v-bind:key="img">
            <img
              width="50"
              :src="img"
              class="registerImg rounded mt-1 mb-2"
              alt="click img to reset"
              title="click img to reset"
              @click="restart"
            />
          </div>
        </div>

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
            v-if="registerImages.length === 0"
            class="button rounded-pill"
            @click="onCapture"
          >Take Photo</b-button>
          <b-button
            v-if="registerImages.length === maxImages"
            class="button rounded-pill"
            @click="signUp"
          >Sign Up</b-button>
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
      registerImages: [],
      maxImages: 5,
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
    async signUp() {
      if (this.name.trim() === "") {
        alert("please enter your name");
        return;
      } else if (this.email.trim() === "") {
        alert("please enter your email");
        return;
      } else if (this.registerImages.length === 0) {
        alert("Take a few photos pls");
        return;
      }

      // generating a timestamp to make filename random
      const date = new Date();
      const timestamp = date.getTime();

      const userdata = {
        name: this.name,
        email: this.email
      };

      // TODO: upload all the images via registerImages
      const imageUrls = [];
      while (this.registerImages.length > 0) {
        const imageName = `register/${timestamp}-${this.name}-${this.registerImages.length}.jpg`;
        const image = this.registerImages.shift();
        const s3response = await this.uploadImageToS3(imageName, image);
        imageUrls.push(`public/${s3response.key}`);
      }

      if (imageUrls.length > 0) {
        const response = await apihelper.postToRegister(userdata, imageUrls);
        const { status, data } = response;
        this.promptUser(status, data.message, data, false);
      }
      this.restart();
    },
    async signIn() {
      const imageName = `login/${Math.floor(Date.now() / 1000)}.jpg`;
      this.loginImg = this.$refs.loginCam.capture();
      const s3response = await this.uploadImageToS3(imageName, this.loginImg);
      const response = await apihelper.postToLogin(`public/${s3response.key}`);

      const { data, status } = response;
      this.promptUser(status, data.message, data, true);
    },
    promptUser(status, message, data, showMember) {
      this.toast.title = status === 200 ? "Success!" : "Error";
      this.toast.message = message;
      this.$bvToast.show("toast");

      if (showMember && status === 200) {
        this.member.title = "Welcome to the Event";
        this.member.message = data;
        this.showLoader = false;
        setTimeout(() => {
          this.isUser = true;
        }, 500); // purposely slow it down to see the percentage & loader
      } else if (status === 500) {
        this.restart();
      }
    },
    restart() {
      this.name = "";
      this.email = "";
      this.isUser = false;
      this.showLoader = false;
      this.loginImg = null;
      this.registerImg = null;
      this.registerImages = [];
      setTimeout(() => {
        this.$refs.loginCam.start();
        this.$refs.registerCam.start();
      }, 500);
    },
    onCapture() {
      this.registerImages = [];
      const takePhoto = () => {
        const image = this.$refs.registerCam.capture();
        this.registerImages.push(image);
        if (this.registerImages.length < this.maxImages) {
          setTimeout(() => {
            takePhoto();
          }, 500);
        }
      };
      takePhoto();
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
      this.uploadPercentage = percentage;
    },
    uploadImageToS3(filename, encodedImg) {
      const img = imagehelper.decodeImage(encodedImg);
      this.showLoader = true;
      Auth.currentCredentials();
      const refSetPercentage = this.setPercentage;
      const result = Storage.put(filename, img, {
        level: "public",
        contentType: "image/jpeg",
        progressCallback(progress) {
          refSetPercentage(progress);
        }
      })
        .then(response => {
          return response;
        })
        .catch(error => {
          console.log(error);
          return error.response;
        });

      return result;
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
