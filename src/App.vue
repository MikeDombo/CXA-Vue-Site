<template>
  <v-app dark>
    <v-toolbar app>
      <router-link to="/" class="nav-title-link">
        <v-toolbar-title class="headline text-uppercase font-weight-thin">Create X App</v-toolbar-title>
      </router-link>
    </v-toolbar>

    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
import { Component, Vue } from "vue-property-decorator";

@Component
export default class App extends Vue {}
</script>

<style lang="scss">
  .nav-title-link {
    all: unset;
  }
</style>

