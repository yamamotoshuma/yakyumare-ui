import { createRouter, createWebHistory } from "vue-router";

import User from "@/router/user.ts";
import Notice from "@/router/notice.ts";
import recruitment from "@/router/recruitment.ts";
import store from "@/store";

const routes = [
  { path: "/", component: () => import("@/views/Home.vue") },
  {
    path: "/message",
    name: "message",
    component: () => import("@/views/message/index.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/contact",
    name: "Contact",
    component: () => import("@/views/Contact/index.vue"),
  },
  ...User.routes,
  ...Notice.routes,
  ...recruitment.routes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

router.beforeEach(async (to, _from, next) => {
  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !store.getters.isLoggedIn
  ) {
    next({
      path: "/user/login",
      query: { redirect: to.fullPath },
    });
  } else {
    next();
  }
});

export default router;
