import Vue from "vue";
import Vuetify from "vuetify/lib";
import "vuetify/src/stylus/app.styl";

Vue.use(Vuetify, {
    theme: {
        primary: "#ff521c",
        secondary: "#9b532c",
        accent: "#4372e3",
        error: "#d22b23",
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#FFC107"
    },
    customProperties: true,
    iconfont: "md"
});
