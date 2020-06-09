<template>
  <div class="loader" :class="{ 'loader-active': isActive }">
    <div>
      <p v-if="uploadPercentage !== null">
        <strong>{{ uploadPercentage }}</strong>%
      </p>
      <b-spinner variant="success" label="Spinning"></b-spinner>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class LoadingView extends Vue {
  @Prop() private isActive!: boolean;
  @Prop() private uploadPercentage!: number;
}
</script>

<style scoped>
.loader {
  position: absolute;
  background-color: #eeeeee;
  opacity: 0.7;
  width: 768px;
  height: 100%;
  z-index: 100;
  display: none;
}
.loader-active {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>
