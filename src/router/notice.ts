export default {
  routes: [
    {
      path: "/notice/:id",
      name: "NoticeDetail",
      component: () => import("@/views/Notice/NoticeDetail.vue"),
      meta: { title: "お知らせ" },
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
