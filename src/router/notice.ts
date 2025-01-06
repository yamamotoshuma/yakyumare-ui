export default {
  routes: [
    {
      path: "/notice/:id",
      name: "NoticeDetail",
      component: () => import("@/views/Notice/NoticeDetail.vue"),
    },
    {
      path: "/notice/create",
      name: "NoticeCreate",
      component: () => import("@/views/Notice/NoticeForm.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/notice/edit/:id",
      name: "NoticeEdit",
      component: () => import("@/views/Notice/NoticeForm.vue"),
      meta: { requiresAuth: true },
    },
  ],
};
