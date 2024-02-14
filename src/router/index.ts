import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import useApiPage from "@/components/useApi.vue";
import notApiPage from "@/components/notApi.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "useApi",
    component: useApiPage,
  },
  {
    path: "/notapi",
    name: "notApi",
    component: notApiPage,
  },
];

const router = createRouter({
  history: createWebHistory("/"), // process.env.BASE_URL)
  routes,
});

export default router;
