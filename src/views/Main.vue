<template>
  <v-container fluid>
    <h1 class="display-3">Create X App</h1>
    <h2 class="title">Templates for every language and use case</h2>
    <div class="pt-4">
      <h3>Available Templates</h3>
      <div class="pt-2">
        <TemplateListing :manifests="manifests"/>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
    import TemplateListing from "@/views/TemplateListing.vue";
    import {Component, Vue} from "vue-property-decorator";

    @Component({
        components: {TemplateListing}
    })
    export default class Main extends Vue {
        manifests = [
            [
                "https://github.com/MikeDombo/CXAPythonCLI/",
                "https://raw.githubusercontent.com/MikeDombo/CXAPythonCLI/master/manifest.cxa.yml"
            ]
        ];

        mounted() {
            document.title = "CXA | Home";
        }
    }
</script>

