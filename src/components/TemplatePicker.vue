<template>
  <div>
    <LoadingSpinner v-if="loading"/>
    <v-stepper v-else vertical v-model="stepperStep">
      <v-stepper-step step="1" :complete="stepperStep > 1">
        <span @click="stepperStep = 1" class="step-title">Platform</span>
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-form class="pa-1">
          <v-radio-group v-model="codeTypeInput.platform">
            <v-radio
              v-for="(_, platform) in codeTypes"
              :label="titlecase(platform)"
              :key="platform"
              :value="platform"
            />
          </v-radio-group>
        </v-form>
        <v-btn color="primary" @click="stepperStep = 2">Continue</v-btn>
        <v-btn flat @click="stepperStep = 1; codeTypeInput =  {};">Reset</v-btn>
      </v-stepper-content>

      <v-stepper-step step="2" :complete="stepperStep > 2">
        <span @click="stepperStep = 2" class="step-title" v-if="codeTypeInput.platform">Type</span>
        <span v-else>Type</span>
      </v-stepper-step>
      <v-stepper-content step="2">
        <v-form class="pa-1">
          <v-radio-group v-model="codeTypeInput.type">
            <v-radio
              v-for="(_, type) in codeTypes[codeTypeInput.platform]"
              :label="titlecase(type)"
              :key="type"
              :value="type"
            />
          </v-radio-group>
        </v-form>
        <v-btn color="primary" @click="stepperStep = 3">Continue</v-btn>
        <v-btn flat @click="stepperStep = 1; codeTypeInput =  {};">Reset</v-btn>
      </v-stepper-content>

      <v-stepper-step step="3" :complete="stepperStep > 3">
        <span @click="stepperStep = 3" class="step-title" v-if="codeTypeInput.type">Template Choice</span>
        <span v-else>Template Choice</span>
      </v-stepper-step>
      <v-stepper-content step="3">
        <TemplateListing :manifestData="filteredManifests" class="pa-1"/>
        <v-btn flat @click="stepperStep = 1; codeTypeInput =  {};">Reset</v-btn>
      </v-stepper-content>
    </v-stepper>
  </div>
</template>

<script lang="ts">
import LoadingSpinner from "./LoadingSpinner.vue";
import TemplateListing from "./TemplateListing.vue";
import { Component, Prop, Vue } from "vue-property-decorator";
import jsyaml from "js-yaml";

@Component({
  components: { LoadingSpinner, TemplateListing }
})
export default class TemplatePicker extends Vue {
  loading = false;
  manifestData: { [index: string]: any } = {};
  @Prop({ default: [] })
  manifests!: Array<string[]>;
  codeTypes: any = {};
  codeTypeInput: any = {};
  stepperStep = 1;

  get filteredManifests() {
    return Object.keys(this.manifestData).reduce((acc: any, key: string) => {
      const manifest = this.manifestData[key];
      if ("code_type" in manifest) {
        const platforms = Object.keys(manifest.code_type);
        let added = false;
        for (const platform of platforms) {
          if (this.codeTypeInput.platform === platform) {
            for (const platformType of manifest.code_type[platform]) {
              if (!added && platformType === this.codeTypeInput.type) {
                acc[key] = this.manifestData[key];
                added = true;
              }
            }
          }
        }
      } else {
        acc[key] = this.manifestData[key];
      }
      return acc;
    }, {});
  }

  mounted() {
    this.onMount();
  }

  titlecase(s: string) {
    if (typeof s !== "string") {
      return s;
    }
    return s.substring(0, 1).toLocaleUpperCase() + s.substring(1);
  }

  async onMount() {
    this.loading = true;
    this.manifestData = await this.manifests.reduce(
      async (soFar: any, v: string[]) => {
        soFar = await soFar;
        soFar[v[0]] = jsyaml.load(await (await fetch(v[1])).text());
        return soFar;
      },
      {}
    );

    Object.keys(this.manifestData).forEach((key: any) => {
      const manifest = this.manifestData[key];
      if ("code_type" in manifest) {
        const platforms = Object.keys(manifest.code_type);
        for (const platform of platforms) {
          if (!(platform in this.codeTypes)) {
            this.codeTypes[platform] = {};
          }
          for (const platformType of manifest.code_type[platform]) {
            if (!(platformType in this.codeTypes[platform])) {
              this.codeTypes[platform][platformType] = [];
            }

            this.codeTypes[platform][platformType].push(key);
          }
        }
      }
    });

    this.loading = false;
  }
}
</script>

<style lang="scss">
.step-title {
  cursor: pointer;
}
</style>
