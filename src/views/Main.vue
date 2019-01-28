<template>
  <v-container fluid>
    <h1 class="display-3">Create X App</h1>
    <h2 class="title">Templates for every language and use case</h2>
    <div class="pt-4">
      <h3>Available Templates</h3>
      <div class="pt-2">
        <TemplatePicker :manifests="manifests"/>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import TemplateListing from "@/components/TemplateListing.vue";
import TemplatePicker from "@/components/TemplatePicker.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: { TemplateListing, TemplatePicker }
})
export default class Main extends Vue {
  manifests = [
    [
      "https://github.com/MikeDombo/CXAPythonCLI/",
      "https://raw.githubusercontent.com/MikeDombo/CXAPythonCLI/master/manifest.cxa.yml"
    ],
    [
      "https://github.com/MikeDombo/CXAPythonFlask",
      "https://raw.githubusercontent.com/MikeDombo/CXAPythonFlask/master/manifest.cxa.yml"
    ]
  ];

  mounted() {
    document.title = "CXA | Home";
  }
}
</script>

