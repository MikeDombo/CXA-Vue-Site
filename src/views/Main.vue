<template>
  <v-container fluid>
    <v-layout align-center justify-center v-if="loading">
      <v-progress-circular indeterminate size="128"/>
    </v-layout>
    <h1 v-else>Available Templates</h1>
    <v-list v-if="manifestData" two-line>
      <v-list-tile
        v-for="(data, url) in manifestData"
        :key="url"
        ripple
        @click="$router.push({path: 'template', query: {url}})"
      >
        <v-list-tile-content>
          <v-list-tile-title>{{data.title}}</v-list-tile-title>
          <v-list-tile-sub-title>{{data.description}}</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import jsyaml from "js-yaml";

@Component({
  components: {}
})
export default class Main extends Vue {
  loading = false;
  manifestData: { [index: string]: any } = {};

  created() {
    this.onMount();
  }

  mounted() {
    document.title = "CXA | Home";
  }

  async onMount() {
    this.loading = true;
    const manifests = [
      [
        "https://github.com/MikeDombo/CXAPythonCLI/",
        "https://raw.githubusercontent.com/MikeDombo/CXAPythonCLI/master/manifest.cxa.yml"
      ]
    ];

    this.manifestData = await manifests.reduce(
      async (soFar, v) => {
        soFar[v[0]] = jsyaml.load(await (await fetch(v[1])).text());
        return soFar;
      },
      {} as any
    );
    this.loading = false;
  }
}
</script>

<style lang="sass">

</style>

