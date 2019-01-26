<template>
  <div>
    <strong v-if="loading">Loading...</strong>
    <ul v-if="manifestData">
      <li v-for="(data, url) in manifestData" v-bind:key="url">
        <router-link :to="{path: 'template', query: {url}}">{{data.title}}</router-link>
        <br>
        <small>{{data.description}}</small>
      </li>
    </ul>
  </div>
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

