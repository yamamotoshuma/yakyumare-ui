<template>
  <div>
    <Navbar />
    <UserForm
      title="お問い合わせ"
      submitButtonText="送信"
      :fields="loginFields"
      :errorMessages="errorMessages"
      :successMessage="message"
      @submit="login"
    />
    <LoadingScreen v-show="load" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "@/service/axios";
import { createApiError } from "@/service/errorService.ts";
import Navbar from "@/components/Navbar.vue";
import LoadingScreen from "@/components/LoadingScreen.vue";
import UserForm from "@/components/UserForm.vue";

const router = useRouter();
const route = useRoute();
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
    name: "name",
    type: "text",
    label: "お名前",
    placeholder: "山田 太郎",
    required: false,
  },
  {
    name: "email",
    type: "email",
    label: "メールアドレス",
    placeholder: "Email",
    required: true,
  },
  {
    name: "title",
    type: "text",
    label: "タイトル",
    placeholder: "タイトル",
    required: true,
  },
  {
    name: "content",
    type: "textarea",
    label: "お問い合わせ内容",
    placeholder: "",
    required: true,
  },
];

const login = async (formData: any) => {
  try {
    message.value = "";
    errorMessages.value = [];
    load.value = true;
    await axios.post("contact", formData);
    message.value = "お問い合わせが完了しました。";
  } catch (error) {
    errorMessages.value = createApiError(error);
  } finally {
    load.value = false;
  }
};
</script>
