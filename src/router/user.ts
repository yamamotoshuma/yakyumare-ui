import type { RouteLocationNormalized } from "vue-router";

export default {
  routes: [
    {
      path: "/user/login",
      name: "Login",
      component: () => import("@/views/User/Login.vue"),
      meta: { title: "ログイン" },
    },
    {
      path: "/user/register",
      name: "UserRegister",
      component: () => import("@/views/User/Register.vue"),
      meta: { title: "アカウント登録" },
    },
    {
      path: "/user/myPage",
      name: "MyPage",
      component: () => import("@/views/User/MyPage.vue"),
      meta: { requiresAuth: true, title: "マイページ" },
    },
    {
      path: "/user/:id",
      name: "Users",
      component: () => import("@/views/User/MyPage.vue"),
      meta: { title: "ユーザー" },
    },
    {
      path: "/user/editProfile",
      name: "EditProfile",
      component: () => import("@/views/User/EditProfile.vue"),
      meta: { requiresAuth: true, title: "プロフィール編集" },
    },
    {
      path: "/user/verificationSuccess",
      name: "VerificationSuccess",
      component: () => import("@/views/User/VerificationSuccess.vue"),
      meta: { title: "メール確認完了" },
    },
    {
      path: "/user/forgotPassword",
      name: "ForgotPassword",
      component: () => import("@/views/User/ForgotPassword.vue"),
      meta: { title: "パスワードを忘れた場合" },
    },
    {
      path: "/user/resetPassword",
      name: "ResetPassword",
      component: () => import("@/views/User/ResetPassword.vue"),
      meta: { title: "パスワードリセット" },
      props: (route: RouteLocationNormalized) => ({
        token: route.query.token,
        email: route.query.email,
      }),
    },
  ],
};
