export default {
  routes: [
    {
      path: "/recruitment/list",
      name: "recruitmentList",
      component: () => import("@/views/Recruitment/RecruitmentInquiry.vue"),
      meta: { title: "募集一覧" },
    },
    {
      path: "/recruitment/:id",
      name: "RecruitmentDetail",
      component: () => import("@/views/Recruitment/RecruitmentDetail.vue"),
    },
    {
      path: "/recruitment/create",
      name: "RecruitmentCreate",
      component: () => import("@/views/Recruitment/RecruitmentForm.vue"),
      meta: { requiresAuth: true, title: "募集新規作成" },
    },
    {
      path: "/recruitment/edit/:id",
      name: "RecruitmentEdit",
      component: () => import("@/views/Recruitment/RecruitmentForm.vue"),
      meta: { requiresAuth: true, title: "募集編集" },
    },
  ],
};
