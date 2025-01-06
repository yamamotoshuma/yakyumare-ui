<template>
  <div>
    <Navbar />
    <div class="container mt-5">
      <h1 class="mb-4">{{ isEdit ? "お知らせの修正" : "お知らせの作成" }}</h1>
      <form @submit.prevent="submitForm">
        <div class="mb-3">
          <label for="title" class="form-label">タイトル</label>
          <input
            type="text"
            class="form-control"
            id="title"
            v-model="notice.title"
            required
          />
        </div>
        <div class="mb-3">
          <label for="content" class="form-label">内容</label>
          <textarea
            class="form-control"
            id="content"
            v-model="notice.content"
            rows="10"
            required
          ></textarea>
        </div>
        <div class="mb-3">
          <label for="start_date" class="form-label">開始日</label>
          <input
            type="date"
            class="form-control"
            id="start_date"
            v-model="notice.start_date"
            required
          />
        </div>
        <div class="mb-3">
          <label for="end_date" class="form-label">終了日</label>
          <input
            type="date"
            class="form-control"
            id="end_date"
            v-model="notice.end_date"
            required
          />
        </div>
        <div class="mb-3">
          <label for="status" class="form-label">ステータス</label>
          <select
            class="form-control"
            id="status"
            v-model="notice.status"
            required
          >
            <option value="draft">下書き</option>
            <option value="published">公開</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">
          {{ isEdit ? "更新" : "投稿" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "@/service/axios";
import { useRoute, useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import { createApiError } from "@/service/errorService";

const route = useRoute();
const router = useRouter();

const notice = ref({
  title: "",
  content: "",
  start_date: "",
  end_date: "",
  status: "draft",
});

const isEdit = computed(() => route.params.id !== undefined);

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await axios.put(`/notices/${route.params.id}`, notice.value);
    } else {
      await axios.post("/notices", notice.value);
    }
    router.push("/");
  } catch (error) {
    alert(createApiError(error));
  }
};

const fetchNotice = async () => {
  try {
    const response = await axios.get(`/notices/${route.params.id}`);
    notice.value = response.data;
  } catch (error) {
    alert(createApiError(error));
  }
};

onMounted(() => {
  if (isEdit.value) {
    fetchNotice();
  }
});
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
