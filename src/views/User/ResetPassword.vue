<template>
  <div>
    <UserForm
      title="パスワードリセット"
      submitButtonText="パスワードリセット"
      :fields="resetPasswordFields"
      :errorMessages="errorMessages"
      @submit="resetPassword"
    >
      <template #additional-top-fields>
        <input type="hidden" v-model="token" />
        <div class="mb-3">
          <label for="email" class="form-label">メールアドレス</label>
          <input
            v-model="email"
            type="email"
            class="form-control"
            id="email"
            placeholder="Email"
            disabled
          />
        </div>
      </template>
    </UserForm>
    <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
      {{ successMessage }}
    </div>
    <LoadingScreen v-show="load" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "@/service/axios";
import LoadingScreen from "@/components/LoadingScreen.vue";
import UserForm from "@/components/UserForm.vue";
import { createApiError } from "@/service/errorService";

const router = useRouter();
const route = useRoute();
const token = ref("");
const email = ref("");
const load = ref(false);
const errorMessages = ref<string[]>([]);
const successMessage = ref("");

const resetPasswordFields = [
  {
    name: "password",
    type: "password",
    label: "新しいパスワード",
    placeholder: "Password",
    required: true,
  },
  {
    name: "password_confirmation",
    type: "password",
    label: "パスワード確認",
    placeholder: "Confirm Password",
    required: true,
  },
];

onMounted(() => {
  token.value = route.query.token as string;
  email.value = route.query.email as string;
});

const resetPassword = async (formData: Record<string, any>) => {
  try {
    load.value = true;
    errorMessages.value = [];
    successMessage.value = "";
    await axios.post("/reset-password", {
      token: token.value,
      email: email.value,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    });
    successMessage.value = "パスワードがリセットされました。";
    setTimeout(() => {
      router.push({
        name: "Login",
        query: { message: "パスワードがリセットされました。" },
      });
    }, 2000);
  } catch (error) {
    errorMessages.value = createApiError(error);
  } finally {
    load.value = false;
  }
};
</script>
