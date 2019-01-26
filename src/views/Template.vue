<template>
  <v-container fluid v-if="loading">
    <v-layout align-center justify-center>
      <v-progress-circular indeterminate size="128"/>
    </v-layout>
  </v-container>
  <v-container fluid v-else>
    <v-layout>
      <v-flex>
        <div v-if="manifestData">
          <h1>{{manifestData.title}}</h1>
          <h3>{{manifestData.author}}</h3>
          <a :href="manifestData.repository">Project Repository</a>
          <p>{{manifestData.description}}</p>
        </div>
      </v-flex>
    </v-layout>
    <v-layout
      row
      wrap
      v-if="manifestData.uses_template_variables && manifestData.required_template_variables"
    >
      <v-flex>
        <v-form @submit.prevent="submit" v-model="formIsValid">
          <v-layout row wrap>
            <template
              v-for="(variableData, variableName) in manifestData.required_template_variables"
            >
              <v-flex xs12 md4 pa-2 :key="variableName">
                <v-text-field
                  v-model.trim="formData[variableName]"
                  :label="variableName"
                  :required="!variableData.type.includes('opt(')"
                  :rules="rules[variableName]"
                />
              </v-flex>
            </template>
          </v-layout>
          <v-btn large ripple type="submit" color="primary">Create App Now!</v-btn>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import jsyaml from "js-yaml";
import urljoin from "url-join";

@Component({
  components: {}
})
export default class Template extends Vue {
  loading = false;
  url: string = "";
  manifestData: any = {};
  formData = {};
  formIsValid = false;
  rules: any = {};

  mounted() {
    this.url = this.$route.query.url as string;
    this.fetchData();
  }

  async fetchData() {
    this.loading = true;

    const rawManifestURL = urljoin(
      this.url.replace("github.com", "raw.githubusercontent.com"),
      "master/manifest.cxa.yml"
    );

    const manifestData = jsyaml.load(
      await (await fetch(rawManifestURL)).text()
    );
    this.loading = false;

    if (
      manifestData.uses_template_variables &&
      manifestData.required_template_variables
    ) {
      this.rules = Object.entries(
        manifestData.required_template_variables
      ).reduce((soFar: any, [key, value]: any) => {
        const theseRules: any[] = [];
        if ("type" in value) {
          if (!value.type.includes("opt(")) {
            theseRules.push((v: string) => !!v || `${key} is required`);
          }

          if (value.type.includes("integer")) {
            theseRules.push(
              (v: string) =>
                Number.isInteger(parseFloat(v)) || `${key} must be an integer`
            );
          } else if (value.type.includes("string")) {
            if ("validation" in value) {
              const regexValidations = {
                regexMatch: true,
                regexNoMatch: false
              };
              Object.entries(regexValidations).forEach(([k, val]) => {
                let rule: any = value.validation;
                rule = rule.match(k + "\\((.*)\\)");
                if (rule) {
                  rule = rule[1];
                  theseRules.push((v: string) => {
                    if (typeof v === "undefined") {
                      return false;
                    }
                    if ((v.match(rule) === null) === val) {
                      return `Failed to validate ${key} with regex check ${rule}`;
                    }
                    return false;
                  });
                }
              });
            }
          }
        }
        soFar[key] = theseRules;
        return soFar;
      }, {});
    }

    this.manifestData = manifestData;
  }

  submit() {
    console.log("submit");
    fetch("http://localhost:8000/transform", {
      method: "POST",
      body: JSON.stringify({
        gitURL: this.url.replace(/\/$/, "") + ".git",
        template_variables: this.formData
      }),
      headers: { "Content-Type": "application/json" }
    }).then(r => {
      if (r.status === 200) {
        r.blob().then(b => {
          var link = document.createElement("a");
          link.href = window.URL.createObjectURL(b);
          link.download = (this.manifestData as any).title + ".zip";

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      }
    });
  }
}
</script>

<style lang="scss">
.requiredLabel::after {
  content: "*";
  color: red;
}
</style>