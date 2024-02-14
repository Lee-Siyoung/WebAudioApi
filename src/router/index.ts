import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import useApiPage from "@/components/useApi.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "useApi",
    component: useApiPage,
  },
];

const router = createRouter({
  history: createWebHistory("/"), // process.env.BASE_URL)
  routes,
});

export default router;
