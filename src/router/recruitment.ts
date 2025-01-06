export default {
  routes: [
    {
      path: "/recruitment/list",
      name: "recruitmentList",
      component: () => import("@/views/Recruitment/RecruitmentInquiry.vue"),
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
      meta: { requiresAuth: true },
    },
    {
      path: "/recruitment/edit/:id",
      name: "RecruitmentEdit",
      component: () => import("@/views/Recruitment/RecruitmentForm.vue"),
      meta: { requiresAuth: true },
    },
  ],
};
