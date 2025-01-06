import type { RouteLocationNormalized } from "vue-router";

export default {
  routes: [
    {
      path: "/user/login",
      name: "Login",
      component: () => import("@/views/User/Login.vue"),
    },
    {
      path: "/user/register",
      name: "UserRegister",
      component: () => import("@/views/User/Register.vue"),
    },
    {
      path: "/user/myPage",
      name: "MyPage",
      component: () => import("@/views/User/MyPage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/user/:id",
      name: "Users",
      component: () => import("@/views/User/MyPage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/user/editProfile",
      name: "EditProfile",
      component: () => import("@/views/User/EditProfile.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/user/verificationSuccess",
      name: "VerificationSuccess",
      component: () => import("@/views/User/VerificationSuccess.vue"),
    },
    {
      path: "/user/forgotPassword",
      name: "ForgotPassword",
      component: () => import("@/views/User/ForgotPassword.vue"),
    },
    {
      path: "/user/resetPassword",
      name: "ResetPassword",
      component: () => import("@/views/User/ResetPassword.vue"),
      props: (route: RouteLocationNormalized) => ({
        token: route.query.token,
        email: route.query.email,
      }),
    },
  ],
};
