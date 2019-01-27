<template>
  <div>
    <v-snackbar
      v-model="showAlert"
      color="error"
      bottom
      :right="$vuetify.breakpoint.mdAndUp"
      auto-height
    >{{alertText}}</v-snackbar>
    <v-container fluid v-if="loading">
      <v-layout align-center justify-center>
        <v-progress-circular indeterminate size="128"/>
      </v-layout>
    </v-container>
    <v-container fluid v-else>
      <v-alert v-model="showError" color="error" dismissible icon="error">{{errorText}}</v-alert>
      <v-layout v-if="manifestData">
        <v-flex>
          <h1>{{manifestData.title}}</h1>
          <h3>{{manifestData.author}}</h3>
          <a :href="manifestData.repository">Project Repository</a>
          <p>{{manifestData.description}}</p>
        </v-flex>
      </v-layout>
      <v-layout
        row
        wrap
        v-if="manifestData.uses_template_variables && manifestData.required_template_variables"
      >
        <v-flex>
          <v-form @submit.prevent="submit" v-model="formIsValid" ref="form">
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
            <v-btn large ripple to="/" color="secondary">
              <v-icon left medium>arrow_back</v-icon>Back
            </v-btn>
            <v-btn large ripple type="submit" color="primary">Create App Now!</v-btn>
          </v-form>
          <v-progress-linear indeterminate :active="submitting"/>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
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
  showAlert = false;
  alertText = "";
  submitting = false;
  showError = false;
  errorText = "";

  mounted() {
    this.url = this.$route.query.url as string;
    document.title = "CXA | Template";
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
    document.title = "CXA | Template | " + manifestData.title;

    if (this.hasVariables(manifestData)) {
      this.rules = Object.entries(
        manifestData.required_template_variables
      ).reduce((soFar: any, [key, value]: any) => {
        const theseRules: any[] = [];
        if ("type" in value) {
          if (!value.type.includes("opt(")) {
            theseRules.push((v: string) => !!v || `${key} is required`);
          }

          if (value.type.includes("integer") || value.type.includes("float")) {
            theseRules.push(
              (v: string) =>
                !Number.isNaN(parseFloat(v)) || `${key} must be a number`
            );
            if ("validation" in value && typeof value.validation == "object") {
              if ("min" in value.validation) {
                theseRules.push(
                  (v: string) =>
                    parseFloat(v) >= parseFloat(value.validation.min) ||
                    `${key} must be greater than or equal to ${
                      value.validation.min
                    }`
                );
              }
              if ("max" in value.validation) {
                theseRules.push(
                  (v: string) =>
                    parseFloat(v) < parseFloat(value.validation.max) ||
                    `${key} must be less than ${value.validation.max}`
                );
              }
            }
          }

          if (value.type.includes("float")) {
            theseRules.push(
              (v: string) => parseFloat(v) || `${key} must be a float`
            );
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

  hasVariables(manifestData: any) {
    return (
      manifestData.uses_template_variables &&
      manifestData.required_template_variables
    );
  }

  async submit() {
    this.showError = false;
    if (this.submitting) {
      this.alertText = "Wait for the current submission to finish";
      this.showAlert = true;
      return;
    }
    if (!(this.$refs.form as any).validate()) {
      this.alertText = "Fix form validation errors before proceeding";
      this.showAlert = true;
      return;
    }

    this.submitting = true;

    if (this.hasVariables(this.manifestData)) {
      Object.keys(this.manifestData.required_template_variables).forEach(
        variableName => {
          const variableData = this.manifestData.required_template_variables[
            variableName
          ];
          if ("type" in variableData) {
            if (
              variableData.type.includes("integer") ||
              variableData.type.includes("float")
            ) {
              (this.formData as any)[variableName] = parseFloat(
                (this.formData as any)[variableName]
              );
            }
          }
        }
      );
    }

    try {
      const r = await fetch(
        "https://cxa-transform.mikedombrowski.com/transform",
        {
          method: "POST",
          body: JSON.stringify({
            gitURL: this.url.replace(/\/$/, "") + ".git",
            template_variables: this.formData
          }),
          headers: { "Content-Type": "application/json" }
        }
      );

      if (r.status === 200) {
        const content = await r.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(content);
        link.download = (this.manifestData as any).title + ".zip";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (r.status === 400) {
        this.errorText = await r.json();
        this.showError = true;
      }
    } catch {
      this.errorText =
        "Something went wrong with the server or your internet connection";
      this.showError = true;
    }

    this.submitting = false;
  }
}
</script>

<style lang="scss">
</style>
