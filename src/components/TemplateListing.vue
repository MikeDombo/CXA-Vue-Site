<template>
  <div>
    <LoadingSpinner v-if="loading"/>
    <v-list v-else two-line>
      <template v-if="manifestData">
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
      </template>
      <v-list-tile v-if="custom">
        <v-list-tile-content>
          <v-container fluid>
            <v-form @submit.prevent="doCustom">
              <v-layout row wrap>
                <v-flex>
                  <v-text-field label="GitHub URL" required v-model.trim="customURL"/>
                </v-flex>
                <v-flex class="pl-2">
                  <v-btn large ripple type="submit" color="primary">Submit</v-btn>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </div>
</template>
<script lang="ts">
import LoadingSpinner from "./LoadingSpinner.vue";
import { Component, Prop, Vue } from "vue-property-decorator";
import jsyaml from "js-yaml";

@Component({
  components: { LoadingSpinner }
})
export default class TemplateListing extends Vue {
  loading = false;
  @Prop({ required: true })
  // @ts-ignore
  manifestData: { [index: string]: any };
  @Prop({ required: false, default: false })
  // @ts-ignore
  custom: boolean;
  customURL: string = "";

  doCustom() {
    this.$router.push({ name: "Template", query: { url: this.customURL } });
  }
}
</script>
