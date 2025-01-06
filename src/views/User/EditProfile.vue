<template>
  <Navbar />
  <UserForm
    v-if="user"
    title="プロフィール編集"
    submitButtonText="更新"
    :fields="profileFields"
    :errorMessages="error"
    :initialData="initialUserData"
    @submit="updateProfile"
  >
    <template #additional-top-fields>
      <div class="mb-3 text-center">
        <img
          :src="getProfileUrl(user)"
          alt="User Avatar"
          class="rounded-circle mb-3"
          style="width: 100px; height: 100px; object-fit: cover"
        />
        <input type="file" @change="onFileChange" class="form-control" />
      </div>
    </template>
    <template #additional-button-fields>
      <div class="mt-2">
        <button
          type="button"
          @click="deleteAccount"
          class="btn w-100 btn-danger"
        >
          アカウント削除
        </button>
      </div>
    </template>
  </UserForm>

  <LoadingScreen v-show="load"></LoadingScreen>
  <Modal
    v-if="showModal"
    :title="modalTitle"
    :bodyText="modalBodyText"
    @closeModal="closeModal"
    @confirmAction="confirmAction"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import store from "@/store";
import Navbar from "@/components/Navbar.vue";
import LoadingScreen from "@/components/LoadingScreen.vue";
import { createApiError } from "@/service/errorService";
import { getProfileUrl } from "@/service/profileImage";
import UserForm from "@/components/UserForm.vue";
import Modal from "@/components/Modal.vue";

interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  provider: string | null;
}

const user = ref<User | null>(null);
const router = useRouter();
const avatar = ref<File | null>(null);
const load = ref(false);
const avatarPreview = ref<string | null>(null);
const error = ref<string[] | undefined>(undefined);

const showModal = ref(false);
const modalTitle = "アカウント削除";
const modalBodyText = "アカウントを削除します。\nよろしいですか？";

const profileFields = computed(() => [
  {
    name: "name",
    type: "text",
    label: "ユーザー名",
    placeholder: "野球マン",
    required: true,
  },
  {
    name: "email",
    type: "email",
    label: "メールアドレス",
    placeholder: "Email",
    disabled: user.value?.provider !== null,
    required: true,
  },
  {
    name: "bio",
    type: "textarea",
    label: "ひとこと",
    placeholder: "どうぞよろしくお願いします。",
  },
  {
    name: "password",
    type: "password",
    label: "新しいパスワード",
    placeholder: "",
    disabled: user.value?.provider !== null,
  },
  {
    name: "password_confirmation",
    type: "password",
    label: "新しいパスワード（確認）",
    placeholder: "",
    disabled: user.value?.provider !== null,
  },
]);

const initialUserData = computed(() => {
  if (!user.value) return {};
  return {
    name: user.value.name,
    email: user.value.email,
    bio: user.value.bio,
  };
});

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

const updateProfile = async (formData: any) => {
  if (avatar.value) {
    formData.append("avatar", avatar.value);
  }

  try {
    load.value = true;
    await store.dispatch("updateProfile", formData);
    router.push("/user/myPage");
  } catch (e) {
    error.value = createApiError(e);
    load.value = false;
  }
};

const deleteAccount = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const confirmAction = async () => {
  closeModal();
  load.value = true;
  try {
    load.value = true;
    await store.dispatch("deleteUser", user.value);
    window.location.reload();
  } catch (e) {
    error.value = createApiError(e);
  } finally {
    load.value = false;
  }
};
onMounted(async () => {
  const response = await store.dispatch("checkAuthStatus");
  user.value = response.data;
});
</script>

<style scoped>
.card {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  font-family: "Arial", sans-serif;
  color: #333333;
}

.form-label {
  font-weight: bold;
  color: #555555;
}

.form-control {
  background-color: #f9f9f9;
  border: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  padding: 10px;
}

.rounded-circle {
  border: 2px solid #ddd;
}
</style>
