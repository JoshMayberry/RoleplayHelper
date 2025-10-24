import { createApp } from "vue";

import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "../shared/router";
import pinia from "../shared/stores";
import { registerSettingsPersistence } from "../shared/stores/settings";

// Styles
import "unfonts.css";

const app = createApp(App);

app.use(vuetify)
	.use(router)
	.use(pinia);

registerSettingsPersistence()

app.mount("#app");
