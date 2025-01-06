<template>
  <div>
    <Navbar />
    <UserForm
      title="ログイン"
      submitButtonText="ログイン"
      :fields="loginFields"
      :additionalButtons="additionalButtons"
      :errorMessages="errorMessages"
      :successMessage="message"
      :isGoogleLogin="true"
      @submit="login"
      @googleLogin="googleLogin"
    />
    <LoadingScreen v-show="load" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { createApiError } from "@/service/errorService.ts";
import Navbar from "@/components/Navbar.vue";
import LoadingScreen from "@/components/LoadingScreen.vue";
import UserForm from "@/components/UserForm.vue";

const router = useRouter();
const route = useRoute();
const store = useStore();
const load = ref(false);
const errorMessages = ref<string[]>([]);
const message = ref<string | undefined>(undefined);

onMounted(() => {
  if (route.query.message) {
    message.value = route.query.message as string;
    // オプション: メッセージを表示した後、URLからクエリパラメータを削除
    router.replace({ query: {} });
  }
});

const loginFields = [
  {
    name: "email",
    type: "email",
    label: "メールアドレス",
    placeholder: "Email",
    required: true,
  },
  {
    name: "password",
    type: "password",
    label: "パスワード",
    placeholder: "Password",
    required: true,
  },
];

const additionalButtons = [
  {
    text: "新規アカウント作成",
    to: { name: "UserRegister" },
    class: "btn-outline-info",
  },
  {
    text: "パスワードを忘れた方",
    to: { name: "ForgotPassword" },
    class: "btn-outline-secondary",
  },
];

const login = async (formData: any) => {
  try {
    message.value = "";
    errorMessages.value = [];
    load.value = true;
    await store.dispatch("login", formData);
    const redirectPath = route.query.redirect?.toString() || "/";
    router.push(redirectPath);
  } catch (error) {
    errorMessages.value = createApiError(error);
  } finally {
    load.value = false;
  }
};

const googleLogin = async (response: any) => {
  try {
    message.value = "";
    errorMessages.value = [];
    load.value = true;
    // Googleから返されたトークンをバックエンドに送信
    console.log(response);
    await store.dispatch("googleLogin", response.code);
    const redirectPath = route.query.redirect?.toString() || "/";
    router.push(redirectPath);
    // ログイン成功後の処理
  } catch (error) {
    errorMessages.value = createApiError(error);
  } finally {
    load.value = false;
  }
};
</script>
