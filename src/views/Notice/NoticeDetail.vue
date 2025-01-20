<template>
  <div>
    <div class="container mt-5 mb-5">
      <h1 class="mb-4">{{ notice.title }}</h1>
      <div class="card">
        <div class="card-body">
          <div class="text-break prewrap-text">{{ notice.content }}</div>
          <p class="text-muted" v-if="notice.created_at">
            {{ new Date(notice.created_at).toLocaleDateString() }}
          </p>
        </div>
      </div>
      <router-link to="/" class="btn btn-primary mt-4">戻る</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "@/service/axios";
import { useRoute } from "vue-router";
import sanitize from "@/service/marked";

const route = useRoute();
const notice = ref({});

const fetchNotice = async () => {
  try {
    const response = await axios.get(`/notices/${route.params.id}`);
    notice.value = response.data;
  } catch (error) {
    console.error("Error fetching notice:", error);
  }
};

const parsedContent = computed(() => {
  return sanitize(notice.value.content || "");
});

onMounted(() => {
  fetchNotice();
});
</script>

<style scoped>
.container {
  max-width: 800px;
}

.card {
  border-color: #ff8c00;
}

.card-body {
  background-color: #fdfdfd;
}

.btn-primary {
  background-color: #ff8c00;
  border-color: #ff8c00;
}

.btn-primary:hover {
  background-color: #e67e22;
  border-color: #e67e22;
}

.prewrap-text {
  white-space: pre-wrap;
}
</style>
