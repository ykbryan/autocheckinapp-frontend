<template>
  <article>
    <b-toast id="toast" :title="toast.title">{{ toast.message }}</b-toast>
    <div class="app" :class="{ 'sign-up-active': showSignUp, 'home-active': isUser  }">
      <div class="loader" :class="{ 'loader-active': showLoader }">
        <b-spinner variant="success" label="Spinning"></b-spinner>
      </div>
      <div class="overlay-top text-center">
        <h2 class="mb-3">Welcome back!</h2>
      </div>
      <div class="overlay-bottom text-center">
        <h3 class="mt-3">Another place here</h3>
        <b-button class="button rounded-pill" @click="isUser = !isUser;">Dismiss</b-button>
      </div>
      <div class="overlay-app">
        <div class="overlay">
          <div class="overlay-left">
            <h2>Welcome Back!</h2>
            <p>Please login with your personal info</p>
            <b-button class="button rounded-pill" @click="showSignUp = !showSignUp">Sign In</b-button>
          </div>
          <div class="overlay-right">
            <h2>Hello, Friend!</h2>
            <p>Please enter your personal details</p>
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
          v-if="registerImg === null"
        />
        <img
          height="200"
          width="264"
          :src="registerImg"
          v-if="registerImg !== null"
          class="registerImg rounded mt-1 mb-2"
          alt="click img to reset"
          title="click img to reset"
          @click="registerImg = null"
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
      </div>
      <div class="form sign-in">
        <form action="#">
          <h2>Sign in</h2>
          <div>with your camera</div>
          <img
            height="200"
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
        </form>
      </div>
    </div>
  </article>
</template>

<script>
import { WebCam } from "vue-web-cam";
import Auth from "@aws-amplify/auth";
import Storage from "@aws-amplify/storage";

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
      }
    };
  },
  components: {
    "vue-web-cam": WebCam
  },
  methods: {
    signUp() {
      this.uploadImageToS3("register.jpg", this.registerImg)
        .then(async result => {
          console.log(result);
          this.showLoader = false;
          this.toast.title = "Work in progress";
          this.toast.message = "Image has been uploaded.. ";
          this.$bvToast.show("toast");
        })
        .catch(err => console.log(err));
    },
    signIn() {
      this.loginImg = this.$refs.loginCam.capture();
      this.uploadImageToS3("login.jpg", this.loginImg)
        .then(async result => {
          console.log(result);
          this.showLoader = false;
          this.toast.title = "Still work in progress";
          this.toast.message = "Image has been uploaded.. ";
          this.$bvToast.show("toast");
          // this.isUser = true;
        })
        .catch(err => console.log(err));
    },
    onCapture() {
      this.registerImg = this.$refs.registerCam.capture();
    },
    onError(error) {
      console.log("On Error Event", error);
    },
    onCameras(cameras) {
      this.devices = cameras;
      console.log("On Cameras Event", cameras);
    },
    onCameraChange(deviceId) {
      this.deviceId = deviceId;
      this.camera = deviceId;
      console.log("On Camera Change Event", deviceId);
    },
    uploadImageToS3(filename, encodedImg) {
      const img = this.decodeImage(encodedImg);

      this.showLoader = true;
      // this.$bvToast.show("toast");
      Auth.currentCredentials();
      return Storage.put(filename, img, {
        level: "public",
        contentType: "image/jpeg"
      });
    },
    decodeImage(encodedImg) {
      // Split the base64 string in data and contentType
      const block = encodedImg.split(";");
      // Get the content type of the image
      const contentType = block[0].split(":")[1]; // In this case "image/gif"
      // get the real base64 content of the file
      const realData = block[1].split(",")[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."
      // Convert it to a blob to upload
      return this.b64toBlob(realData, contentType);
    },
    b64toBlob(b64Data, contentType, sliceSize) {
      contentType = contentType || "";
      sliceSize = sliceSize || 512;

      const byteCharacters = atob(b64Data);
      const byteArrays = [];

      for (
        let offset = 0;
        offset < byteCharacters.length;
        offset += sliceSize
      ) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: contentType });
      return blob;
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
article {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
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
  background: #ffffff;
  .overlay-top {
    background-color: #ffac31;
    position: absolute;
    top: -40%;
    left: 0;
    width: 100%;
    height: 40%;
    overflow: hidden;
    transition: transform 0.5s ease-in-out;
    z-index: 99;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 101;
  }
  .overlay-bottom {
    background-color: #fff;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    height: 60%;
    overflow: hidden;
    transition: transform 0.5s ease-in-out;
    z-index: 101;
  }
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
    background: linear-gradient(to bottom right, #ffac31, #ff9900);
    color: #fff;
    transform: translateX(0);
    transition: transform 0.5s ease-in-out;
    .button {
      border-color: #ffffff;
    }
  }
  .webcam {
    border: 1px solid #a3a3a3;
  }
  .registerImg:hover {
    cursor: pointer;
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
  border: 1px solid #ff9900;
  background-color: #ff9900;
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
  background: #ffffff;
  transition: all 0.5s ease-in-out;
  overflow: hidden;
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
.home-active {
  .overlay-top {
    transform: translateY(100%);
  }
  .overlay-bottom {
    transform: translateY(-100%);
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
