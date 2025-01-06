<template>
  <div>
    <Navbar />
    <UserForm
      title="アカウント新規作成"
      submitButtonText="登録"
      :fields="registerFields"
      :additionalButtons="additionalButtons"
      :errorMessages="errorMessages"
      :isGoogleLogin="true"
      @submit="register"
      @googleLogin="googleLogin"
    >
      <template #additional-under-fields>
        <div class="mb-3">
          <label for="avatar" class="form-label">プロフィール画像</label>
          <input
            @change="onFileChange"
            type="file"
            class="form-control"
            id="avatar"
            accept="image/*"
          />
          <div class="d-flex justify-content-center" v-if="avatarPreview">
            <img
              :src="avatarPreview"
              alt="Avatar Preview"
              class="rounded-circle mt-3 avatar-preview"
            />
          </div>
        </div>
      </template>
    </UserForm>
    <LoadingScreen v-show="load" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import Navbar from "@/components/Navbar.vue";
import LoadingScreen from "@/components/LoadingScreen.vue";
import UserForm from "@/components/UserForm.vue";
import { createApiError } from "@/service/errorService";

const router = useRouter();
const store = useStore();
const avatar = ref<File | null>(null);
const avatarPreview = ref<string | null>(null);
const load = ref(false);
const errorMessages = ref<string[]>([]);

const registerFields = [
  {
    name: "name",
    type: "text",
    label: "ユーザー名",
    placeholder: "Name",
    required: true,
  },
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
  {
    name: "password_confirmation",
    type: "password",
    label: "パスワード(再入力)",
    placeholder: "Confirm Password",
    required: true,
  },
];

const additionalButtons = [
  {
    text: "ログインはこちら",
    to: { name: "Login" },
    class: "btn-outline-secondary",
  },
];

const onFileChange = (e: Event) => {
  load.value = true;
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    avatar.value = target.files[0];
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      avatarPreview.value = event.target?.result as string;
    };
    reader.readAsDataURL(avatar.value);
  } else {
    avatar.value = null;
    avatarPreview.value = null;
  }
  load.value = false;
};

const register = async (formData: Record<string, any>) => {
  errorMessages.value = [];
  const registerFormData = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    registerFormData.append(key, value as string);
  });

  if (avatar.value) {
    registerFormData.append("avatar", avatar.value);
  }

  try {
    load.value = true;
    await store.dispatch("register", registerFormData);
    router.push("/");
  } catch (e) {
    errorMessages.value = createApiError(e);
  } finally {
    load.value = false;
  }
};

const googleLogin = async (response: any) => {
  try {
    errorMessages.value = [];
    load.value = true;
    // Googleから返されたトークンをバックエンドに送信
    await store.dispatch("googleLogin", response.code);
    // ログイン成功後の処理
    router.push("/");
  } catch (error) {
    errorMessages.value = createApiError(error);
  } finally {
    load.value = false;
  }
};
</script>

<style scoped>
.avatar-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
</style>
