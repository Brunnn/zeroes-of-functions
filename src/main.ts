import "./assets/base.scss";
import "@mdi/font/css/materialdesignicons.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
(window as any).global = window;
import App from "./App.vue";
import router from "./router";


const app = createApp(App);
app.use(createPinia());
app.use(router);

app.mount("#app");
