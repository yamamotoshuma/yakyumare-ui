<template>
  <div>
    <Navbar />
    <UserForm
      title="パスワードリセット"
      submitButtonText="リセットリンク送信"
      :fields="forgotPasswordFields"
      :additionalButtons="additionalButtons"
      :errorMessages="errorMessages"
      :successMessage="successMessage"
      @submit="sendResetLink"
    >
      <template #description>
        <p class="description text-center mb-4">
          再設定用のリンクをご登録のメールアドレスに送信します
        </p>
      </template>
    </UserForm>
    <LoadingScreen v-show="load" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "@/service/axios";
import Navbar from "@/components/Navbar.vue";
import UserForm from "@/components/UserForm.vue";
import { createApiError } from "@/service/errorService";
import LoadingScreen from "@/components/LoadingScreen.vue";

const errorMessages = ref<string[]>([]);
const successMessage = ref("");
const load = ref(false);

const forgotPasswordFields = [
  {
    name: "email",
    type: "email",
    label: "メールアドレス",
    placeholder: "Email",
  },
];

const additionalButtons = [
  { text: "ログイン画面へ", to: { name: "Login" }, class: "btn-outline-info" },
];

const sendResetLink = async (formData: { email: string }) => {
  try {
    load.value = true;
    errorMessages.value = [];
    successMessage.value = "";
    await axios.post("/forgot-password", formData);
    successMessage.value = "パスワードリセットリンクを送信しました";
  } catch (error) {
    errorMessages.value = createApiError(error);
  } finally {
    load.value = false;
  }
};
</script>
<style scoped>
.description {
  font-size: 0.8rem;
}
</style>
