<template>
  <div>
    <LoadingSpinner v-if="loading"/>
    <v-list v-else-if="manifestData" two-line>
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
}
</script>
