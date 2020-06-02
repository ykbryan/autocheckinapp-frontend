<template>
  <div class="about">
    <h1>This is an about page</h1>
    <router-link :to="{ name: 'About', params: { id: 2345 } }"
      >Another Link</router-link
    >
    <router-link :to="{ name: 'About', query: { plan: 'testing' } }"
      >Another Link</router-link
    >
    <p>{{ $route.params.id }}</p>
    <p>{{ $route.query }}</p>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log(this.$route.params.id);
  },
  watch: {
    $route(to, from) {
      console.log('to', to);
      console.log('from', from);
    },
  },
};
</script>
<style scoped></style>
